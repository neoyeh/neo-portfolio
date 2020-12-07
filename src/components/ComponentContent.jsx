import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const TodoListContext = createContext();
const Task = (props) => {
    const { task } = props;
    return <div className="image-card">
        <div className="image-block"></div>
        <div>{task}</div>
    </div>;
};

Task.protoTypes = {
    task: PropTypes.string,
};
Task.defaultProps = {
    task: '',
};

const TodoList = () => {
    const todoList = useContext(TodoListContext);
    return <div>
        {todoList.map(task =>{
            return <Task 
                key={task}
                task={task}
            />
        })}
    </div>;
};

const TodoListPage = () => {
    return <div>
        <div>所有內容:</div>
        <TodoList />
    </div>;
};

const CurrentTask = () => {
    const todoList = useContext(TodoListContext);
    return <div>
        <hr/>
        {`下一件事情：${todoList[0]}`}
    </div>
}

const Main = () => {
    const [todoList] = useState(['first','second']);
    return (
        <TodoListContext.Provider value={todoList}>
            <div>
                <div>useContent</div>
                <span>{`代辦事項：${todoList.length}`}</span>
                <hr/>
                <TodoListPage todoList={todoList}  />
                <CurrentTask todoList={todoList}  />
            </div>
        </TodoListContext.Provider>
    );
};

export default Main;