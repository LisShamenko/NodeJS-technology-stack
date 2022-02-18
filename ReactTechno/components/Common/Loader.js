import PropTypes from 'prop-types';
import React from 'react';

// 
const Loader = props => {
    return (
        <div>
            <div className="ball-pulse-sync">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

// 
export default Loader;