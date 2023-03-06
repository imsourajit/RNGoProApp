import {combineReducers} from 'redux';
import {GoProReducer} from '../Modules/GoPro/Redux/GoProReducers';

const rootReducer = combineReducers({GoProReducer: GoProReducer});

export default rootReducer;
