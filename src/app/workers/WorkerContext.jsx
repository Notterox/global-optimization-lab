import React from 'react';

const functionWorker = new Worker('./functionWorker.js');
const solverWorker = new Worker('./solverWorker.js');

export default React.createContext({ functionWorker, solverWorker });
