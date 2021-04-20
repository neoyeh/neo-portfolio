import { call, put, takeEvery } from 'redux-saga/effects';
import { FETCH_PORTFOLIO_BEGIN, fetchPortfolioSuccess } from '../action/portfolio'
import { getPortfolioList } from '../api/content'


function* fetchPortfolioData(){
    // 使用 data 接收請求的資料
    const data = yield call(getPortfolioList);
    yield put(fetchPortfolioSuccess(data));
}
function* portfolioSaga() {
    yield takeEvery(FETCH_PORTFOLIO_BEGIN, fetchPortfolioData);
}
export  default portfolioSaga;
