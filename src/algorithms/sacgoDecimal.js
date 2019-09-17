const zip = require('lodash/zip');
const Decimal = require('decimal.js').clone({ precision: 6, rounding: 1 });

function kernels(s) {
  const $s = new Decimal(s);
  return {
    exponential:  g => $s.negated().mul(g).exp(),
    hyperbolic:   g => g.pow($s.negated()),
    linear:       g => new Decimal(1).sub(g).pow($s),
    parabolic:    g => new Decimal(1).sub(g.pow(2)).pow($s),
    cubic:        g => new Decimal(1).sub(g.pow(3)).pow($s)
  };
}

function sacgo(shrinkMult, shrinkRate, trialsAmount, kernel) {
  function genNoise(n) {
    const noise = Array(n);
    for (let i = 0; i < n; i++) {
      noise[i] = Decimal.random().mul(2).sub(1);
    }

    return noise;
  }

  function getTrialPoints(start, delta, noise) {
    return noise.map(n => delta.mul(n).add(start));
  }

  function getDimlessValues(sequence, max, min) {
    const diff = max.sub(min);

    return sequence.map(v => v.sub(min).div(diff));
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
    // eslint-disable-next-line no-underscore-dangle
    const _func = (x, y) => new Decimal(func(x.toNumber(), y.toNumber()));
    const xmin = new Decimal(bounds[0][0]);
    const xmax = new Decimal(bounds[0][1]);
    const ymin = new Decimal(bounds[1][0]);
    const ymax = new Decimal(bounds[1][1]);

    let iterations = 0;
    let delta = [
      xmax.sub(xmin).div(2),
      ymax.sub(ymin).div(2)
    ];
    let x = [
      xmin.add(delta[0]),
      ymin.add(delta[1])
    ];
    let maxFuncVal = new Decimal(Number.MAX_SAFE_INTEGER);
    let minFuncVal = new Decimal(0);

    while (
      !(Decimal.max(...delta).lessThanOrEqualTo(eps1)
       || maxFuncVal.sub(minFuncVal).lessThanOrEqualTo(eps2))
      && iterations < 100) {
      const noise = [genNoise(n), genNoise(n)];
      const noisePoints = zip(...noise);
      const trials = [
        getTrialPoints(x[0], delta[0], noise[0]),
        getTrialPoints(x[1], delta[1], noise[1])
      ];
      const funcVals = zip(...trials).map(point => _func(...point));
      maxFuncVal = Decimal.max(...funcVals);
      minFuncVal = Decimal.min(...funcVals);
      const dimlessVals = getDimlessValues(funcVals, maxFuncVal, minFuncVal);
      const selectiveVals = getSelectiveValues(dimlessVals, kernel);

      const selectedNoise = zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          point[0].times(sval).plus(acc[0]),
          point[1].times(sval).plus(acc[1])
        ], [new Decimal(0), new Decimal(0)]);

      const nextDelta = zip(noisePoints, selectiveVals)
        .reduce((acc, [point, sval]) => [
          point[0].abs().pow(shrinkRate).mul(sval).add(acc[0]),
          point[1].abs().pow(shrinkRate).mul(sval).add(acc[1])
        ], [new Decimal(0), new Decimal(0)])
        .map((coord, i) => coord.pow(new Decimal(1).div(shrinkRate)).mul(delta[i]).mul(shrinkMult));

      const nextX = [
        delta[0].mul(selectedNoise[0]).add(x[0]),
        delta[1].mul(selectedNoise[1]).add(x[1]),
      ];

      if (options.trackChanges) {
        log.push({
          point: x.map(e => e.toNumber()),
          delta: delta.map(e => e.toNumber()),
          trials: trials.map(t => t.map(e => e.toNumber())),
          value: _func(...x).toNumber()
        });
      }

      x = nextX;
      delta = nextDelta;
      ++iterations;
    }

    if (options.trackChanges) {
      log.push({
        point: x.map(e => e.toNumber()),
        delta: delta.map(e => e.toNumber()),
        trials: [],
        value: _func(...x).toNumber()
      });
    }

    return {
      point: x.map(e => e.toNumber()),
      iterations,
      ...(log.length ? { log } : {}),
      value: _func(...x).toNumber() };
  };
}

module.exports = { sacgo, kernels };
