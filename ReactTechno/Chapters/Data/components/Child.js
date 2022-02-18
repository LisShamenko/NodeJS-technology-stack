import React, { Component } from 'react';
import PropTypes from 'prop-types';

// 
class Child extends Component {
    render() {
        console.log(Child.propTypes);
        return (
            <div>
                <p>Child component, получает значение свойства 'this.props.name' от компонента Parent:</p>
                <code>
                    {
                        JSON.stringify({
                            "name": 'String',
                            "this.props.name": this.props.name
                        }, null, 2)
                    }
                </code>
            </div>
        );
    }
}

// 
Child.propTypes = {
    name: PropTypes.string
}

// 
Child.defaultProps = {
    name: ''
}

// 
export default Child;