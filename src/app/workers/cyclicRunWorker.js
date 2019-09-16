const { sacgo, kernels } = require('../../algorithms/sacgo');

function getNormalizedAlgSettings({ targetFunction, xmin, xmax, ymin, ymax }) {
  const func = eval(targetFunction.func);

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
  const solution = alg(func, bounds);

  return solution;
}

function runChunk(chunkSize, algSettings, sacSettings) {
  const chunk = [];

  for(let i = 0; i < chunkSize; i++) {
    chunk.push(solve(algSettings, sacSettings));
  }

  return chunk;
}

function start(amount, algSettings, sacSettings) {
  let chunksTotal = 0;
  const cycleHandler = () => {
    const nextChunkSize = Math.min(100, amount - chunksTotal);
    chunksTotal += nextChunkSize;
    postMessage({
      type: 'CYCLIC_RUN_CHUNK',
      payload: {
        progress: chunksTotal / amount,
        chunk: runChunk(nextChunkSize, algSettings, sacSettings)
      }
    });
    if (chunksTotal < amount) {
      return setTimeout(cycleHandler, 0);
    }
    postMessage({
      type: 'CYCLIC_RUN_END',
      payload: {}
    });
  };

  cycleHandler();
}

addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'CYCLIC_RUN_START':
      const algSettings = getNormalizedAlgSettings(event.data.payload.algSettings);
      const sacSettings = getNormalizedSacSettings(event.data.payload.sacSettings);
      start(event.data.payload.amount, algSettings, sacSettings);
  }
});
