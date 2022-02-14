import React from 'react';
import PropTypes from 'prop-types';

// отображать в абзаце содержимое, переданное в качестве свойства
const Content = (props) => {
    return (<p className="content">{props.post.content}</p>);
};

// 
Content.propTypes = {
    post: PropTypes.object,
};

// 
export default Content;