import ApiService from '../../../Services/ApiService';
import {
  ADD_CONTACTS,
  EMPTY_CONTACTS,
  REMOVE_CONTACTS,
  SET_USER_DETAILS,
  UPDATE_AUTH_TOKEN,
} from './UserActionTypes';

export const sendOtpForValidation =
  (params, onSuccess, onFailure) => dispatch =>
    ApiService.post(
      dispatch,
      '',
      'fcone/user/login/get-otp',
      params,
      null,
      null,
      null,
      onSuccess,
      onFailure,
    );
export const validateOtp = (params, onSuccess, onFailure) => dispatch =>
  ApiService.post(
    dispatch,
    '',
    'fcone/user/login/verify-otp',
    params,
    null,
    null,
    null,
    onSuccess,
    onFailure,
  );

export const updateAuthToken = token => ({
  type: UPDATE_AUTH_TOKEN,
  data: token,
});

export const setUserDetails = user => ({
  type: SET_USER_DETAILS,
  data: user,
});

export const addBatchByCoachId = (params, onSuccess, onError) => dispatch =>
  ApiService.post(
    dispatch,
    '',
    'fcone/batch/add',
    params,
    null,
    null,
    null,
    onSuccess,
    onError,
  );

export const listBatchesByCoachId =
  (params, onSuccess, onError) => dispatch => {
    ApiService.get(
      dispatch,
      '',
      'fcone/batch/batches-by-coachId',
      params,
      null,
      null,
      null,
      onSuccess,
      onError,
    );
  };

export const listStudentsByBatchId =
  (params, onSuccess, onFailure) => dispatch =>
    ApiService.get(
      dispatch,
      '',
      'fcone/batch/students-by-batchId',
      params,
      null,
      null,
      null,
      onSuccess,
      onFailure,
    );

export const listSessionsByCoachId = (params, onSuccess, onError) => dispatch =>
  ApiService.get(
    dispatch,
    '',
    'fcone/session/coach',
    params,
    null,
    null,
    null,
    onSuccess,
    onError,
  );

export const selectContact = data => ({
  type: ADD_CONTACTS,
  data,
});

export const removeSelectedContact = data => ({
  type: REMOVE_CONTACTS,
  data,
});

export const emptySelectedContactList = _ => ({
  type: EMPTY_CONTACTS,
  data: [],
});

export const addStudentsToBatch = (params, onSuccess, onError) => dispatch =>
  ApiService.post(
    dispatch,
    '',
    'fcone/batch/add-student',
    params,
    null,
    null,
    null,
    onSuccess,
    onError,
  );
