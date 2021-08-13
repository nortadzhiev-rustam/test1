import { configureStore } from '@reduxjs/toolkit';
import todosSlice from './todos-slice';
import uiSlice from './ui-slice';

const store = configureStore({
  reducer: { todos: todosSlice.reducer, ui: uiSlice.reducer },
});

export default store;
