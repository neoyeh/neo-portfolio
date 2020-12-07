// import * as actions from '../action/todolist';

// const initState = {
//     todoList: ['阿里山看日出','綠島看日出','環遊世界看日出'],
//     data: {},
// };

// const todoReducer = (state = initState, action) => {
//     switch (action.type){
//         case actions.ADD_TODO:
//             return {
//                 todoList: [
//                     ...state.todoList,
//                     action.payload.todo,
//                 ],
//             };
//         case actions.FETCH_DATA_SUCCESS:
//             return {
//                 ...state,
//                 data: action.payload.data,
//             }
//         default:
//             return state;
//     }
// };
// export default todoReducer;

const initState = {
    todoList: ['第一件事情', '第二件事情'],
    data: "",
};

const todoReducer = (state = initState, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return {
          todoList:[
            ...state.todoList,
            action.payload.todo,
          ],
        }
      case 'FETCH_DATA_SUCCESS':
        
        return {
          ...state,
          data: action.payload.data,
        }
      default:
        return state;
    }
  };
  
export default todoReducer;