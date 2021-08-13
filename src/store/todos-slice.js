import { createSlice } from '@reduxjs/toolkit';
import { uiActions } from './ui-slice';
const todosSlice = createSlice({
  name: 'todos',
  initialState: { data: [], changed: false },
  reducers: {
    todosAdded: (state, action) => {
      const data = action.payload;

      return { ...state, data };
    },
    deleteTodo: (state, action) => {
      const data = state.data.filter(
        (item) => !action.payload.includes(item.id)
      );
      return { ...state, data };
    },
    addNewTodo: (state, { payload }) => {
      const existingItem = state.data.find((item) => item.id === payload.id);
      state.changed = true;
      if (!existingItem) {
        state.data.push({
          id: payload.id,
          username: payload.username,
          title: payload.title,
          completed: payload.completed,
        });
      }
    },
  },
});

export const fetchTodoData = () => {
  return async (dispatch) => {
    const fetchData = async () => {
      const response = await fetch('https://inbound-trainer-798-default-rtdb.firebaseio.com/todos.json');

      if (!response.ok) throw new Error('Could not fetch cart data!');
      return (await response).json();
    };

    try {
      const todoData = await fetchData();
      dispatch(todosActions.todosAdded(todoData.data));
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };
};

export const sendCartData = (todos) => {
  return async (dispatch) => {
    dispatch(
      uiActions.showNotification({
        status: 'pending',
        title: 'Sending...',
        message: 'Sending cart data!',
      })
    );

    const sendRequest = async () => {
      const response = await fetch(
        'https://inbound-trainer-798-default-rtdb.firebaseio.com/todos.json',
        {
          method: 'PUT',
          body: JSON.stringify({
            data: todos.data,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Sending cart data failed.');
      }
    };

    try {
      await sendRequest();

      dispatch(
        uiActions.showNotification({
          status: 'success',
          title: 'Success!',
          message: 'Sent cart data successfully!',
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotification({
          status: 'error',
          title: 'Error!',
          message: 'Sending cart data failed!',
        })
      );
    }
  };
};

export const todosActions = todosSlice.actions;

export default todosSlice;
