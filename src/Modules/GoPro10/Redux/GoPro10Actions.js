import {
  DOWNLOAD_MEDIA_PROGRESS,
  DOWNLOAD_MEDIA_SUCCESS,
} from './GoPro10ActionTypes';

export const setDownloadingProgress = data => {
  return {
    type: DOWNLOAD_MEDIA_PROGRESS,
    data: data,
  };
};

export const setDownloadCompletedMedia = data => {
  return {
    type: DOWNLOAD_MEDIA_SUCCESS,
    data: data,
  };
};

export const setUploadingProgress = data => {
  return {
    type: DOWNLOAD_MEDIA_PROGRESS,
    data: data,
  };
};

export const setUploadedCompletedMedia = data => {
  return {
    type: DOWNLOAD_MEDIA_SUCCESS,
    data: data,
  };
};
