import React, { Component } from 'react';
import Child from './Child';

// 
class Parent extends Component {
    render() {
        return (
            <div>
                <p>Parent component, передача свойства 'name' в компонент child:</p>
                <Child name={"mark"} />
            </div>
        );
    }
}

// 
export default Parent;