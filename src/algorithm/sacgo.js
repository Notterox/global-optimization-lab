const _ = require('lodash');

function cores(s) {
  return {
    exponential:  g => Math.exp(-s * g),
    hyperbolic:   g => Math.pow(g, -s),
    linear:       g => Math.pow(1 - g, s),
    parabolic:    g => Math.pow(1 - Math.pow(g, 2), s),
    cubic:        g => Math.pow(1 - Math.pow(g, 3), s)
  };
}

function sacgo(gamma, q, core) {

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

  function getSelectiveValues(sequence, core) {
    const sum = sequence.map(core).reduce((acc, val) => acc + val, 0);

    return sequence.map(val => core(val) / sum);
  }

  return function algorithm(func, bounds, options = {}) {
    const eps = options.eps || 0.0001;
    const n = options.n || 50;
    const log = [];

    let iterations = 0;
    let x = bounds.map(([min, max]) => min + ((max - min) / 2));
    let delta = bounds.map(([min, max]) => max - min);

    while (Math.max(...delta) > eps && iterations < 100000) {
      const noise = Array(bounds.length).fill(null).map(() => genNoise(n));
      const noisePoints = _.zip(...noise);
      const trials = noise.map((ni, i) => getTrialPoints(x[i], delta[i], ni));
      const funcVals = _.zip(...trials).map(point => func(...point));
      const maxFuncVal = Math.max(...funcVals);
      const minFuncVal = Math.min(...funcVals);
      const dimlessVals = getDimlessValues(funcVals, maxFuncVal, minFuncVal);
      const selectiveVals = getSelectiveValues(dimlessVals, core);

      const selectedNoise = _.zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          acc[0] + point[0] * sval,
          acc[1] + point[1] * sval
        ], [0, 0]);
      const nextDelta = _.zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          acc[0] + Math.pow(Math.abs(point[0]), q) * sval,
          acc[1] + Math.pow(Math.abs(point[1]), q) * sval
        ], [0, 0])
        .map((coord, i) => gamma * delta[i] * Math.pow(coord, 1 / q));
      const nextX = x.map((coord, i) => coord + delta[i] * selectedNoise[i]);

      if (options.trackChanges) {
        log.push({ x, delta });
      }

      x = nextX;
      delta = nextDelta;
      iterations++;
    }

    return { point: x, iterations, ...(log.length ? { log } : {}) };
  };
}

module.exports = { sacgo, cores };

const f = (x, y) => 6 * Math.pow(x + 5, 2) + 7 * Math.pow(y - 3, 2); // minimum at (-5, 3)

const alg = sacgo(1, 2, cores(5).exponential);

const result = alg(f, [[-10, 10], [-10, 10]]);

console.log(`Result = ${result}`);
