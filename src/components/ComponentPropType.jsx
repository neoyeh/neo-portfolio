import React from 'react';
import PropTypes from 'prop-types';

{/* props&propType */}
const ComponentPropType = (props) => {
    const {
        names = []
    } = props;
    const isEmpty = (value) => {
        return value === '';
    };
    
    return (
        <div>
            <div>propType</div>
            {names.map(name => (
                <div
                    key = {name}
                >
                    {`Hellow ${isEmpty(name)?'word':name}`}
                </div>
            ))}
        </div>
   )
}
ComponentPropType.propTypes = {
    names: PropTypes.arrayOf(PropTypes.string),
};
ComponentPropType.defaultProps = {
    names: ['Default string'],
};
const Task = ({task}) => {
    return (
        <div>task</div>
    )
};
Task.prototype = {
    task: PropTypes.string,
};
Task.defaultProps = {
    task:'',
};

export default ComponentPropType;