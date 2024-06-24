import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './polyfills';

import { App } from './app/app';

// import { WorkSpace } from "./app/utils/workspace.ts";
// const workspace = new WorkSpace()

// console.log(workspace,'workspace')

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
