import React from 'react';
import ReactDom from 'react-dom';
// import styles from './css-src/index.scss';
import './css-src/index.scss';
import { Provider } from 'react-redux';
import store from './store';
import { HashRouter } from 'react-router-dom';

import Header from './components/Header';


ReactDom.render(
    <Provider store={store}>
        <HashRouter>
            <Header />
        </HashRouter>
    </Provider>
, document.getElementById('root'));