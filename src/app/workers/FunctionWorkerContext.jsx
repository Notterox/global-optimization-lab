import React from 'react';

const worker = new Worker('./functionWorker.js');

export default React.createContext(worker);
