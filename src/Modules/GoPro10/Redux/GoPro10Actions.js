import {DOWNLOAD_MEDIA_PROGRESS} from './GoPro10ActionTypes';

export const setDownloadingProgress = data => {
  return {
    type: DOWNLOAD_MEDIA_PROGRESS,
    data: data,
  };
};
