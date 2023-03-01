import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import axios from 'axios';
import {Platform, ToastAndroid} from 'react-native';

const STAGING_END_POINT = 'https://qa-platform.thewagmi.app/platform';
const PRODUCTION_END_POINT = 'https://platform.thewagmi.app/platform';

const apiUrl = PRODUCTION_END_POINT;

const getDeviceName = async () => {
  let deviceName = '';

  return Promise.resolve(deviceName);
};

const DataServices = {
  getStoredData: () => {},

  xVedToken: null,

  getXVedToken: () => {
  },

  getConfig: () => {
    let headerParams = {
      'Content-Type': 'application/json',
    };

    return {headers: {...headerParams}};
  },

  init: () =>
    NetInfo.fetch()
      .then(state => {
        const {isConnected} = state;
        if (!isConnected) {
          ToastAndroid.show(
            'Oops!!! No internet connection. Please connect to internet',
          );
        }
        return isConnected;
      })
      .catch(err => {
        ToastAndroid.show(err);
        return false;
      }),

  get: async (
    dispatch,
    services,
    url,
    params = {},
    inProgress = () => {},
    success = () => {},
    failure = () => {},
    successCallback = null,
    failureCallback = null,
    extraParams = {},
  ) => {
    const hasConnection = await DataServices.init();
    // inProgress && dispatch(inProgress());
    if (hasConnection) {
      let endPoint = `${apiUrl}/${url}`;

      if (new URLSearchParams(params).toString().length > 0) {
        endPoint = `${apiUrl}/${url}?${new URLSearchParams(params).toString()}`;
      }

      axios
        .get(endPoint, DataServices.getConfig())
        .then(res => {
          // if (res.headers.hasOwnProperty('x-ved-token')) {
          //   dispatch(updateUserToken(res.headers['x-ved-token']));
          // }

          if (successCallback) {
            successCallback(res?.data ?? []);
          }
          // success && dispatch(success(res?.data ?? []));
        })
        .catch(e => {
          console.log('Api error', JSON.stringify(e));
          if (failureCallback) {
            failureCallback(e.response?.data);
          }
          // failure && dispatch(failure(e.response?.data));
        });
    }
  },

  post: async (
    dispatch,
    services,
    url,
    params = {},
    inProgress = () => {},
    success = () => {},
    failure = () => {},
    successCallback = null,
    failureCallback = null,
    extraParams = {},
  ) => {
    const hasConnection = await DataServices.init();
    // inProgress && dispatch(inProgress());
    if (hasConnection) {
      const endPoint = `${apiUrl}/${url}`;
      axios
        .post(endPoint, params, DataServices.getConfig())
        .then(res => {
          // if (res.headers.hasOwnProperty('x-ved-token')) {
          //   dispatch(updateUserToken(res.headers['x-ved-token']));
          // }
          if (successCallback) {
            successCallback(res?.data);
          }
          // success && dispatch(success(res?.data));
        })
        .catch(e => {
          if (failureCallback) {
            failureCallback(e.response.data);
          }
          // failure && dispatch(failure(e.response.data));
        });
    }
  },
};

export default DataServices;
