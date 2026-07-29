import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './css-src/index.scss';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import store from './store';

import Header from './components/Header';

const root = createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <HashRouter>
            <Header />
        </HashRouter>
    </Provider>,
);
