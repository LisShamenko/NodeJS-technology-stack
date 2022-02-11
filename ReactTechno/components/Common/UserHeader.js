import PropTypes from 'prop-types';
import React from 'react';

// 
const UserHeader = props => {

    // 
    let userName = '';
    let userImage = (<img alt="image not defined" width={25} height={25} />);

    // 
    if (props.user) {
        userName = props.user.name;
        if (props.user.image) {
            userImage = (<img src={props.user.image} width={25} height={25} />);
        }
    }

    // 
    return (
        <div>
            <p>{userImage}</p>
            <p>{userName}</p>
        </div>
    );
};

// 
UserHeader.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
    })
};

// 
export default UserHeader;