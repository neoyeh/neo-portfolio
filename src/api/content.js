
export const getPortfolioList = () => (
    fetch('./portfolio.json')
        .then(response => response.json())
);