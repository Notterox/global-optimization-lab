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

function getNormalizedExperimentSettings({ parameter, start, end, step }) {
  return {
    parameter,
    start: +start,
    end: +end,
    step: +step
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

function startCyclicRun(amount, algSettings, sacSettings) {
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

function runExperimentChunk(start, step, end, chunkMaxSize, parameter, algSettings, sacSettings) {
  const chunk = [];
  const parametersValuesChunk = [];

  for (let i = start; i <= end && chunk.length < chunkMaxSize; i = +(i + step).toFixed(3)) {
    chunk.push(solve(algSettings, { ...sacSettings, [parameter]: i }));
    parametersValuesChunk.push(i);
  }

  return { chunk, parametersValuesChunk };
}


function startExperiment(algSettings, sacSettings, experimentSettings) {
  const { start, end, step, parameter } = experimentSettings;
  const chunkMaxSize = 10;
  let lastParameterValue = start;

  const experimentHandler = () => {
    const result = runExperimentChunk(lastParameterValue, step, end, chunkMaxSize, parameter, algSettings, sacSettings);

    lastParameterValue = +(lastParameterValue + step * chunkMaxSize).toFixed(3);
    postMessage({
      type: 'EXPERIMENT_RUN_CHUNK',
      payload: {
        progress: (lastParameterValue - start) / (end - start),
        ...result
      }
    });
    if (lastParameterValue < end) {
      return setTimeout(experimentHandler, 0);
    }
    postMessage({
      type: 'EXPERIMENT_RUN_END',
      payload: {}
    });
  };

  experimentHandler();
}

addEventListener('message', (event) => {
  let algSettings;
  let sacSettings;
  let experimentSettings;

  switch (event.data.type) {
    case 'CYCLIC_RUN_START':
      algSettings = getNormalizedAlgSettings(event.data.payload.algSettings);
      sacSettings = getNormalizedSacSettings(event.data.payload.sacSettings);
      startCyclicRun(event.data.payload.amount, algSettings, sacSettings);
      break;
    case 'EXPERIMENT_RUN_START':
      algSettings = getNormalizedAlgSettings(event.data.payload.algSettings);
      sacSettings = getNormalizedSacSettings(event.data.payload.sacSettings);
      experimentSettings = getNormalizedExperimentSettings(event.data.payload.experimentSettings);
      startExperiment(algSettings, sacSettings, experimentSettings);
      break;
  }
});
