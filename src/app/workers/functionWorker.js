/* global addEventListener, postMessage */

function calculate3d(func, xmin, xmax, ymin, ymax, step) {
  if (typeof step !== 'number' || step <= 0) {
    throw Error('Step should be a number and greater than zero');
  }
  if (typeof func !== 'function') {
    throw Error('func should be a function');
  }

  const zvals = [];
  const posvals = [];

  for (let y = ymin; y <= ymax; y += step) {
    let _zvals = [];
    posvals.push(y);

    for (let x = xmin; x <= xmax; x += step) {
      _zvals.push(func(x, y));
    }

    zvals.push(_zvals);
  }

  return { z: zvals, x: posvals, y: posvals };
}

addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'CALCULATE_FUNCTION_VALUES':
      const { func, xmin, xmax, ymin, ymax, step } = event.data.payload;

      return postMessage({
        type: 'CALCULATE_FUNCTION_VALUES_RESULT',
        payload: calculate3d(eval(func), xmin, xmax, ymin, ymax, step)
      });
    default:
      console.log(`functionWorker - unknown message type: ${event.data.type}`);
  }
});
