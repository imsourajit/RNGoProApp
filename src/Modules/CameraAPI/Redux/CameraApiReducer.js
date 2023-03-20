import {SET_LIVE_TIME, UPDATE_LIVE_TIME} from './CameraApiActionTypes';

const initialState = {
  liveTime: 0,
};

const cameraApiReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LIVE_TIME: {
      return {...state, liveTime: action.data};
    }

    case UPDATE_LIVE_TIME: {
      return {...state, liveTime: state.liveTime + action.data};
    }

    default: {
      return state;
    }
  }
};

export default cameraApiReducer;
