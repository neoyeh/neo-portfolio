import { all } from 'redux-saga/effects';
import portfolioSaga from './portfolio';

function* rootSaga() {
  yield all([
    portfolioSaga(),
  ]);
}

export default rootSaga;
