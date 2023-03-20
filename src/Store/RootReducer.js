import {combineReducers} from 'redux';
import {GoProReducer} from '../Modules/GoPro/Redux/GoProReducers';
import userReducer from '../Modules/Core/Redux/UserReducer';

const rootReducer = combineReducers({
  GoProReducer: GoProReducer,
  userReducer: userReducer,
});

export default rootReducer;
