import React from 'react';
import ReactDom from 'react-dom';
import './css-src/index.scss';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import store from './store';

import Header from './components/Header';

ReactDom.render(
    <Provider store={store}>
        <HashRouter>
            <Header />
        </HashRouter>
    </Provider>,
    document.getElementById('root'),
);
