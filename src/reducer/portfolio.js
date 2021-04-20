const initState = {
    portfolioList: [],
};

const portfolioReducer = (state = initState, action) => {
    switch (action.type) {
        case action.FETCH_PORTFOLIO_SUCCESS:
            return {
                portfolioList: action.payload.data,
            }
        default:
            return state;
    }
};

export default portfolioReducer;