import {combineReducers} from 'redux';
import {GoProReducer} from '../Modules/GoPro/Redux/GoProReducers';
import userReducer from '../Modules/Core/Redux/UserReducer';
import cameraApiReducer from '../Modules/CameraAPI/Redux/CameraApiReducer';
import {LOGOUT} from '../Modules/Core/Redux/UserActionTypes';

const appReducer = combineReducers({
  GoProReducer: GoProReducer,
  userReducer: userReducer,
  cameraApiReducer: cameraApiReducer,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    return appReducer({}, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
