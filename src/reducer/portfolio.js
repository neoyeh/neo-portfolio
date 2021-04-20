const initState = {
    portfolioList: [],
};

const portfolioReducer = (state = initState, action) => {
    switch (action.type) {
        case 'FETCH_PORTFOLIO_SUCCESS':
            return {
                ...state,
                portfolioList: action.payload.data,
            }
        default:
            return state;
    }
};

export default portfolioReducer;