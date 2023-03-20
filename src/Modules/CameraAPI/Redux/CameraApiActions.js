import {SET_LIVE_TIME, UPDATE_LIVE_TIME} from './CameraApiActionTypes';

export const setLiveTime = time => {
  return {
    type: SET_LIVE_TIME,
    data: time,
  };
};

export const updateLiveTime = time => {
  return {
    type: UPDATE_LIVE_TIME,
    data: time,
  };
};
