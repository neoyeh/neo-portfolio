export const FETCH_PORTFOLIO_BEGIN = 'FETCH_PORTFOLIO_BEGIN';

export const fetchPortfolioBegin = () => ({
    type: FETCH_PORTFOLIO_BEGIN,
});

export const FETCH_PORTFOLIO_SUCCESS = 'FETXH_PORTFOLIO_SUCCESS';

const fetchPortfolioSuccess = data => ({
    type: FETCH_PORTFOLIO_SUCCESS,
    payload: {
        data,
    },
});