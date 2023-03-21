import {SET_LIVE_TIME, UPDATE_LIVE_TIME} from './CameraApiActionTypes';
import ApiService from '../../../Services/ApiService';

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

export const getSessionIdToTagInLiveVideo =
  (params, onSuccess, onError) => dispatch =>
    ApiService.post(
      dispatch,
      '',
      'fcone/session/start',
      params,
      null,
      null,
      null,
      onSuccess,
      onError,
    );

export const tagLiveUrlsToSession = (params, onSuccess, onError) => dispatch =>
  ApiService.post(
    dispatch,
    '',
    'fcone/session/update',
    params,
    null,
    null,
    null,
    onSuccess,
    onError,
  );
