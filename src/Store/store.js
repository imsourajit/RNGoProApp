import {createStore} from 'redux';
import rootReducer from './RootReducer';

const configureStore = () => {
  return createStore(rootReducer);
};
export default configureStore;
