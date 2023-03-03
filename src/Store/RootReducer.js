import {combineReducers} from 'redux';
import {GoPro10Reducer} from '../Modules/GoPro10/Redux/GoPro10Reducer';

const rootReducer = combineReducers({GoPro10Reducer: GoPro10Reducer});

export default rootReducer;
