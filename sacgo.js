const _ = require('lodash');

function cores(s) {
  return {
    exponential:  g => Math.exp(-sg),
    hyperbolic:   g => Math.pow(g, -s),
    linear:       g => Math.pow(1 - g, s),
    parabolic:    g => Math.pow(1 - Math.pow(g, 2), s),
    cubic:        g => Math.pow(1 - Math.pow(g, 3), s)
  }
}



function sacgo(gamma, q, core) {

  function genNoise(n) {
    return Array(n).map(() => Math.random() * 2 - 1);
  }
  function getTrialPoints(start, delta, noise) {
    return noise.map(n => start + delta * n);
  }

  function getDimlessValues(sequence, max, min) {
    const diff = max - min;

    return sequence.map(v => (v - min) / diff);
  }

  function getSelectiveValues(sequence, core) {
    const sum = Math.sum(sequence.map(core));

    return sequence.map(val => core(val) / sum);
  }

  return function algorithm(func, bounds, options) {
    const eps = options.eps || 0.0001;

    let x = bounds.map(([min, max]) => min + ((max - min) / 2));
    let delta = bounds.map(([min, max]) => max - min)

    while(Math.max(delta) > eps) {
      const noise = Array(bounds.length).map(() => genNoise(options.n));
      const trials = noise.map((ni, i) => getTrialPoints(x[i], delta[i], ni));
      const funcVals = _.zip(...trials).map(point => func(...point));
      const maxFuncVal = Math.max(funcVals);
      const minFuncVal = Math.min(funcVals);
      const dimlessVals = getDimlessValues(funcVals, maxFuncVal, minFuncVal);
      const selectiveVals = getSelectiveValues(dimlessVals, core);

    }

    return x;
  }
}

const f = (x, y) => 6 * Math.pow(x + 5, 2) + 7 * Math.pow(y - 3, 2)); // minimum at (-5, 3)
