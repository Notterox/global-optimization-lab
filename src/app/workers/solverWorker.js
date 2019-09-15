const { sacgo, kernels } = require('../../algorithms/sacgo');

function getFunc(funcString) {
  const _func = eval(funcString);
  let calls = 0;

  const func = function (...args) {
    calls += 1;
    return _func(...args);
  };

  func.getCalls = () => calls;

  return func;
}

function getNormalizedAlgSettings({ targetFunction, xmin, xmax, ymin, ymax }) {
  const func = getFunc(targetFunction.func);

  return {
    func,
    xmin: +xmin,
    xmax: +xmax,
    ymin: +ymin,
    ymax: +ymax
  };
}

function getNormalizedSacSettings({ selectionRate, shrinkRate, shrinkMult, trialsAmount, kernel }) {
  return {
    selectionRate: +selectionRate,
    shrinkRate: +shrinkRate,
    shrinkMult: +shrinkMult,
    trialsAmount: +trialsAmount,
    kernel
  };
}

function solve(algSettings, sacSettings) {
  const { selectionRate, shrinkRate, shrinkMult, trialsAmount, kernel } = sacSettings;
  const { func, xmin, xmax, ymin, ymax } = algSettings;
  const kernelFunc = kernels(selectionRate)[kernel];
  const alg = sacgo(shrinkMult, shrinkRate, trialsAmount, kernelFunc);
  const bounds = [[xmin, xmax], [ymin, ymax]];
  const solution = alg(func, bounds, { trackChanges: true });

  return { ...solution, calls: func.getCalls() };
}

addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'SOLVE':
      const algSettings = getNormalizedAlgSettings(event.data.payload.algSettings);
      const sacSettings = getNormalizedSacSettings(event.data.payload.sacSettings);

      return postMessage({
        type: 'SOLVE_SUCCESS',
        payload: solve(algSettings, sacSettings)
      });
    default:
      return;
  }
});
