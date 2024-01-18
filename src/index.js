import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main';
import { rDOM } from 'react-extensions-dom';

const root = ReactDOM.createRoot(document.getElementById(`main`));
root.render(rDOM(Main));