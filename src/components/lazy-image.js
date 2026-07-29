import React from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'vanilla-lazyload';

const lazyloadConfig = {
  elements_selector: '.lazy-img',
};

// Only initialize it one time for the entire application
if (!document.lazyLoadInstance) {
  document.lazyLoadInstance = new LazyLoad(lazyloadConfig);
}

class LazyImage extends React.Component {
  // Update lazyLoad after first rendering of every image
  componentDidMount() {
    document.lazyLoadInstance.update();
  }

  // Update lazyLoad after rerendering of every image
  componentDidUpdate() {
    document.lazyLoadInstance.update();
  }

  // Just render the image with data-src
  render() {
    const {
      alt, src, srcset, sizes, width, height,
    } = this.props;
    return (
        <img
          alt={alt}
          className="lazy-img"
          data-src={src}
          data-srcset={srcset}
          data-sizes={sizes}
          width={width}
          height={height}
        />
    );
  }
}

LazyImage.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  srcset: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

LazyImage.defaultProps = {
  sizes: undefined,
  width: undefined,
  height: undefined,
};

export default LazyImage;
