import {combineReducers} from 'redux';
import {GoProReducer} from '../Modules/GoPro/Redux/GoProReducers';
import userReducer from '../Modules/Core/Redux/UserReducer';
import cameraApiReducer from '../Modules/CameraAPI/Redux/CameraApiReducer';

const rootReducer = combineReducers({
  GoProReducer: GoProReducer,
  userReducer: userReducer,
  cameraApiReducer: cameraApiReducer,
});

export default rootReducer;
