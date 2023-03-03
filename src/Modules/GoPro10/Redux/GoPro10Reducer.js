import {
  DOWNLOAD_MEDIA_PROGRESS,
  DOWNLOAD_MEDIA_SUCCESS,
  RESET_DOWNLOAD_MEDIA,
  UPLOAD_MEDIA_PROGRESS,
  UPLOAD_MEDIA_SUCCESS,
} from './GoPro10ActionTypes';

const initialState = {
  media: [],
  downloadingMedia: {},
  downloadedMedia: [],
  uploadingMedia: {},
  uploadedMedia: [],
};

export const GoPro10Reducer = (state = initialState, action) => {
  switch (action.type) {
    case DOWNLOAD_MEDIA_PROGRESS: {
      return {...state, downloadingMedia: action.data};
    }

    case DOWNLOAD_MEDIA_SUCCESS: {
      return {
        ...state,
        downloadedMedia: [...state.downloadedMedia, action.data],
      };
    }

    case RESET_DOWNLOAD_MEDIA: {
      return {
        ...state,
        downloadingMedia: {},
      };
    }

    case UPLOAD_MEDIA_PROGRESS: {
      return {...state, uploadingMedia: action.data};
    }

    case UPLOAD_MEDIA_SUCCESS: {
      return {
        ...state,
        uploadedMedia: [...state.uploadedMedia, action.data],
      };
    }
    default:
      return state;
  }
};
