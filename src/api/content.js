
export const getContent = () => (
    fetch('https://httpbin.org/get')
        .then(response => response.json())
);

export const getPortfolioList = () => (
    fetch('./portfolio.json')
        .then(response => response.json())
);