/* global addEventListener, postMessage */

function calculate3d(func, min, max, step) {
  if (typeof step !== 'number' || step <= 0) {
    throw Error('Step should be a number and greater than zero');
  }
  if (typeof func !== 'function') {
    throw Error('func should be a function');
  }

  const zvals = [];
  const posvals = [];

  for (let x = min; x <= max; x += step) {
    let _zvals = [];
    posvals.push(x);

    for (let y = min; y <= max; y += step) {
      _zvals.push(func(x, y));
    }

    zvals.push(_zvals);
  }

  return { z: zvals, x: posvals, y: posvals };
}

addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'CALCULATE_FUNCTION_VALUES':
      const { func, min, max, step } = event.data.payload;

      return postMessage({
        type: 'CALCULATE_FUNCTION_VALUES_RESULT',
        payload: calculate3d(eval(func), min, max, step)
      });
    default:
      console.log(`functionWorker - unknown message type: ${event.data.type}`);
  }
});
