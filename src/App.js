import React from 'react';
import './App.css';
import axios from 'axios';
import Todos from './components/todos';
import { useDispatch } from 'react-redux';
import { todosActions } from './store/todos-slice';
function App() {
  const [data, setData] = React.useState([]);
  const [user, setUser] = React.useState([]);

  const dispatch = useDispatch();

  React.useEffect(() => {
    axios
      .get('http://jsonplaceholder.typicode.com/todos')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log('Error: ', err));

    axios
      .get('http://jsonplaceholder.typicode.com/users')
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.log('Error: ', err));
  }, []);

  React.useEffect(() => {
    dispatch(
      todosActions.todosAdded(
        data.map((item) => ({
          ...item,
          ...user
            .filter((usr) => usr.id === item.userId)
            .map((usr) => {
              return usr.name;
            }),
        }))
      )
    );
  }, [dispatch, data, user]);

  return (
    <div className='App'>
      <div className=''>
        <Todos />
      </div>
    </div>
  );
}

export default App;
