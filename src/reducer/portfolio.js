const initState = {
  portfolioList: [],
};

// Redux always calls reducers positionally as (state, action); the standard
// `state = initialState` default-param idiom can't be reordered after
// `action` without breaking that contract.
// eslint-disable-next-line default-param-last
const portfolioReducer = (state = initState, action) => {
  switch (action.type) {
    case 'FETCH_PORTFOLIO_SUCCESS':
      return {
        ...state,
        portfolioList: action.payload.data,
      };
    default:
      return state;
  }
};

export default portfolioReducer;
