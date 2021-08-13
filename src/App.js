import React from 'react';
import './App.css';
import Todos from './components/todos';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodoData, sendCartData } from './store/todos-slice';

let isInitial = true;
function App() {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todos);
  React.useEffect(() => {
    dispatch(fetchTodoData());
  }, [dispatch]);

  React.useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return;
    }

    if (todos.changed) {
      dispatch(sendCartData(todos));
    }
  }, [todos, dispatch]);

  return (
    <div className='App'>
      <div className=''>
        <Todos />
      </div>
    </div>
  );
}

export default App;
