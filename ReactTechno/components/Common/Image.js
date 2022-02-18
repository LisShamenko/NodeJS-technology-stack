import PropTypes from 'prop-types';
import React from 'react';

// 
const Image = props => {
    if (props.post && props.post.image) {
        return (<img src={props.post.image} />);
    }
    return null;
};

// 
Image.propTypes = {
    post: PropTypes.shape({ image: PropTypes.string })
};

// 
export default Image;