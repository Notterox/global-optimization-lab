const zip = require('lodash/zip');

function kernels(s) {
  return {
    exponential:  g => Math.exp(-s * g),
    hyperbolic:   g => Math.pow(g, -s),
    linear:       g => Math.pow(1 - g, s),
    parabolic:    g => Math.pow(1 - Math.pow(g, 2), s),
    cubic:        g => Math.pow(1 - Math.pow(g, 3), s)
  };
}

function sacgo(shrinkMult, shrinkRate, trialsAmount, kernel) {

  function genNoise(n) {
    return Array(n).fill(0).map(() => Math.random() * 2 - 1);
  }

  function getTrialPoints(start, delta, noise) {
    return noise.map(n => start + delta * n);
  }

  function getDimlessValues(sequence, max, min) {
    const diff = max - min;

    return sequence.map(v => (v - min) / diff);
  }

  function getSelectiveValues(sequence, kernel) {
    const sum = sequence.map(kernel).reduce((acc, val) => acc + val, 0);

    return sequence.map(val => kernel(val) / sum);
  }

  return function algorithm(func, bounds, options = {}) {
    const eps = options.eps || 0.01;
    const n = trialsAmount || 50;
    const log = [];

    let iterations = 0;
    let x = bounds.map(([min, max]) => min + ((max - min) / 2));
    let delta = bounds.map(([min, max]) => (max - min) / 2);

    while (Math.max(...delta) > eps && iterations < 100000) {
      const noise = Array(bounds.length).fill(null).map(() => genNoise(n));
      const noisePoints = zip(...noise);
      const trials = noise.map((ni, i) => getTrialPoints(x[i], delta[i], ni));
      const funcVals = zip(...trials).map(point => func(...point));
      const maxFuncVal = Math.max(...funcVals);
      const minFuncVal = Math.min(...funcVals);
      const dimlessVals = getDimlessValues(funcVals, maxFuncVal, minFuncVal);
      const selectiveVals = getSelectiveValues(dimlessVals, kernel);

      const selectedNoise = zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          acc[0] + point[0] * sval,
          acc[1] + point[1] * sval
        ], [0, 0]);
      const nextDelta = zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          acc[0] + Math.pow(Math.abs(point[0]), shrinkRate) * sval,
          acc[1] + Math.pow(Math.abs(point[1]), shrinkRate) * sval
        ], [0, 0])
        .map((coord, i) => shrinkMult * delta[i] * Math.pow(coord, 1 / shrinkRate));
      const nextX = x.map((coord, i) => coord + delta[i] * selectedNoise[i]);

      if (options.trackChanges) {
        log.push({ point: x, delta, trials, value: func(...x) });
      }

      x = nextX;
      delta = nextDelta;
      ++iterations;
    }

    if (options.trackChanges) {
      log.push({ point: x, delta, trials: [], value: func(...x) });
    }

    return { point: x, iterations, ...(log.length ? { log } : {}), value: func(...x) };
  };
}

module.exports = { sacgo, kernels };
