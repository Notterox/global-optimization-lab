import React from 'react';

const functionWorker = new Worker('./functionWorker.js');
const solverWorker = new Worker('./solverWorker.js');
const cyclicRunWorker = new Worker('./cyclicRunWorker.js');

export default React.createContext({
  functionWorker,
  solverWorker,
  cyclicRunWorker
});
