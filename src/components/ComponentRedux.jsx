import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo } from '../action/todolist';
import PropTypes from 'prop-types';


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
    const todoList = useSelector(state => state.todoReducer.todoList)
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
    const todoList = useSelector(state => state.todoReducer.todoList)
    return <div>
        <hr/>
        {`下一件事情：${todoList[0]}`}
    </div>
}

const Main = (props) => {
    const dispatch = useDispatch();
    const todoList = useSelector(state => state.todoReducer.todoList);
    const [newTodo, setNewTodo] = useState('');
    return (
        <div>
            <div>redux</div>
            {props.children}
            <span>{`代辦事項：${todoList.length}`}</span>
            <div>
                <input type="text" 
                    value={newTodo} 
                    onChange={ (e) => { setNewTodo(e.target.value); }} 
                />
                <button type="button" 
                    onClick={() => { 
                        dispatch(addTodo(newTodo)); 
                        setNewTodo('');
                    }}
                >新增事項</button>
            </div>
            <hr/>
            <TodoListPage todoList={todoList}  />
            <CurrentTask todoList={todoList}  />
        </div>
    );
};

export default Main;