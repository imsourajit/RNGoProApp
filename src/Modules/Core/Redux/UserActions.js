import ApiService from '../../../Services/ApiService';
import {SET_USER_DETAILS, UPDATE_AUTH_TOKEN} from './UserActionTypes';

export const sendOtpForValidation =
  (params, onSuccess, onFailure) => dispatch =>
    ApiService.post(
      dispatch,
      '',
      'fcone/user/login/get-otp',
      params,
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
