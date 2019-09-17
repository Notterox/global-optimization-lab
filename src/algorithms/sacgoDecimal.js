const zip = require('lodash/zip');
const Decimal = require('decimal.js').clone({ precision: 6, rounding: 1 });

function kernels(s) {
  return {
    exponential:  g => s.negated().times(g).exp(),
    hyperbolic:   g => g.pow(s.negated()),
    linear:       g => new Decimal(1).minus(g).pow(s),
    parabolic:    g => new Decimal(1).minus(g.pow(2)).pow(s),
    cubic:        g => new Decimal(1).minus(g.pow(3)).pow(s)
  };
}

function sacgo(shrinkMult, shrinkRate, trialsAmount, kernel) {

  function genNoise(n) {
    const noise = Array(n);
    for (let i = 0; i < n; i++) {
      noise[i] = Decimal.random().times(2).minus(1);
    }

    return noise
  }

  function getTrialPoints(start, delta, noise) {
    return noise.map(n => delta.times(n).plus(start));
  }

  function getDimlessValues(sequence, max, min) {
    const diff = max.minus(min);

    return sequence.map(v => v.minus(min).div(diff));
  }

  function getSelectiveValues(sequence, kernel) {
    const sum = sequence.map(kernel).reduce((acc, val) => acc.plus(val));

    return sequence.map(val => kernel(val).div(sum));
  }

  return function algorithm(func, bounds, options = {}) {
    const eps1 = new Decimal(options.eps1 || 0.01);
    const eps2 = new Decimal(options.eps2 || 0.01);
    const n = trialsAmount || 50;
    const log = [];
    const _func = (x, y) => new Decimal(func(x.toNumber(), y.toNumber()));
    const xmin = bound[0][0];
    const xmax = bound[0][1];
    const ymin = bound[1][0];
    const ymax = bound[1][1];

    let iterations = 0;
    let delta = [
      xmax.minus(xmin).div(2),
      ymax.minus(ymin).div(2)
    ];
    let x = [
      xmin.plus(delta[0]),
      ymin.plus(delta[1])
    ]
    let maxFuncVal = Number.MAX_SAFE_INTEGER;
    let minFuncVal = 0;

    while (!(Math.max(...delta) <= eps1 || (maxFuncVal - minFuncVal <= eps2)) && iterations < 100000) {
      const noise = Array(bounds.length).fill(null).map(() => genNoise(n));
      const noisePoints = zip(...noise);
      const trials = noise.map((ni, i) => getTrialPoints(x[i], delta[i], ni));
      const funcVals = zip(...trials).map(point => func(...point));
      maxFuncVal = Math.max(...funcVals);
      minFuncVal = Math.min(...funcVals);
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
