import { all } from 'redux-saga/effects';
import toodlistSaga from './content';
import portfolioSaga from './portfolio';
function* rootSaga() {
  yield all([
    toodlistSaga(),
    portfolioSaga(),
  ]);
}

export default rootSaga;