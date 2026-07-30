import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioBegin } from '../../action/portfolio';
import LazyImage from '../lazy-image';

function PortfolioCard({
  item = {
    project_name: '',
    image: '',
    text: '',
    link_live: '',
    link_github: '',
  },
}) {
  const {
    project_name: projectName,
    image,
    text,
    link_live: linkLive,
    link_github: linkGithub,
  } = item;
  const buildLinkIcons = (data, modifierClass, iconClassName, ariaLabel) => {
    if (!data) {
      return '';
    }
    const links = Array.isArray(data) ? data : [data];
    return links.map((link) => (
        <a
          href={link}
          key={link}
          className={`font-card-icon font-card-icon--${modifierClass}`}
          target="_blank"
          rel="nofollow noopener noreferrer"
          aria-label={ariaLabel}
          title={ariaLabel}
        >
            <i className={iconClassName} aria-hidden="true" />
        </a>
    ));
  };
  return (
      <div className="protfolio-card">
          <div className="protfolio-card-padding">
              <div className="protfolio-card-content">
                  <div className="image-block">
                      <LazyImage
                        src={image}
                        srcset={image}
                        alt={projectName}
                      />
                  </div>
                  <div className="wording-area">
                      <div className="text-block">
                          <div className="font-card-title">{projectName}</div>
                          {(text)
                            ? (
                                <div
                                  className="font-card-text"
                                  dangerouslySetInnerHTML={{ __html: text }}
                                />
                            ) : ''}
                      </div>
                      {(linkLive || linkGithub)
                        ? (
                            <div className="link-block">
                                {buildLinkIcons(linkLive, 'live', 'fas fa-desktop', '查看正式網站')}
                                {buildLinkIcons(linkGithub, 'github', 'fab fa-github', '查看 Prototype')}
                            </div>
                        )
                        : ''}
                  </div>
              </div>
          </div>
      </div>
  );
}

// `item` has a JS default parameter (see function signature above) instead of
// `PortfolioCard.defaultProps`, which React 19 removed for function components.
// eslint-plugin-react's `functions` option still defaults to 'defaultProps' (not
// yet 'defaultArguments') and eslint-config-airbnb@19.0.4 hasn't overridden it, so
// this rule can't see the default-parameter equivalent. Safe to leave; propTypes
// is superseded by TypeScript in a later migration anyway.
PortfolioCard.propTypes = {
  // eslint-disable-next-line react/require-default-props
  item: PropTypes.shape({
    project_name: PropTypes.string,
    image: PropTypes.string,
    text: PropTypes.string,
    link_live: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    link_github: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  }),
};

function Portfolio() {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.portfolioReducer);

  useEffect(() => {
    dispatch(fetchPortfolioBegin());
  }, []);

  return (
      <div className="protfolio-content">
          {list.portfolioList.map((yearGroup) => (
              <div className="protfolio-list" key={yearGroup.years}>
                  <div className="protfolio-year">{yearGroup.years}</div>
                  <div className="protfolio-list-content">
                      {yearGroup.protfolio_list
                        .filter((e) => e.hidden !== true)
                        .map((e) => (
                            <PortfolioCard item={e} key={e.project_name} />
                        ))}
                  </div>
              </div>
          ))}
      </div>
  );
}

export default Portfolio;
export { PortfolioCard };
