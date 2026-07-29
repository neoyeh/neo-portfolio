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
  const gitlinkbuild = (data) => {
    if (data) {
      if (Array.isArray(data) && data.length > 0) {
        return (
          data.map((link) => (
              <a href={link} key={link} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer" aria-label="GitHub repository">
                  <i className="fa fa-github" aria-hidden="true" />
              </a>
          ))
        );
      }
      return (
          <a href={data} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer" aria-label="GitHub repository">
              <i className="fa fa-github" aria-hidden="true" />
          </a>
      );
    }
    return '';
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
                                {(linkLive)
                                  ? (
                                      <a href={linkLive} className="font-card-icon font-card-icon--live" target="_blank" rel="nofollow noopener noreferrer" aria-label="Live preview">
                                          <i className="fa fa-desktop" aria-hidden="true" />
                                      </a>
                                  ) : ''}
                                {gitlinkbuild(linkGithub)}
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
    link_live: PropTypes.string,
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
