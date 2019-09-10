/* global describe, it, expect */
/* eslint-env node, jest */

const { sacgo, cores } = require('./sacgo');

describe('Selective Averaging Global Optimization Algorithm', () => {
  const func = (x, y) => 6 * Math.pow(x + 5, 2) + 7 * Math.pow(y - 3, 2);

  it('correctly finds minimum of simple function', () => {
    const alg = sacgo(1, 2, cores(4).exponential);

    const result = alg(func, [[-10, 10], [-10, 10]]);

    expect(result.point[0]).toBeCloseTo(-5, 3);
    expect(result.point[1]).toBeCloseTo(3, 3);
    expect(result.iterations).toBeDefined();
  });

  it('has log of changes if options.trackChanges set to true', () => {
    const alg = sacgo(1, 2, cores(4).exponential);

    const result = alg(func, [[-10, 10], [-10, 10]], { trackChanges: true });

    expect(result.log).toBeDefined();
    expect(result.log.length).toBe(result.iterations);
  });
});
