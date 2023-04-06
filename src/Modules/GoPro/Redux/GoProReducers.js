import {
  SET_DIR_NAME_TO_DOWNLOAD,
  SET_DOWNLOADED_COMPLETED,
  SET_DOWNLOADING_FILE,
  SET_GOPRO_FILES_TO_LOCAL_STORAGE,
  SET_GOPRO_MEDIA,
  SET_SESSION_DETAILS,
  SET_UPLOADEDED_COMPLETED,
  SET_UPLOADING_FILE,
} from './GoProActionTypes';

const initialState = {
  mediaList: [],
  downloadedMediaList: [],
  downloadedDirName: null,
  downloadingFile: null,
  uploadedMediaList: [],
  uploadingFile: null,
  sessionDetails: null,
  media: [],
  downloadedMedia: [],
  uploadedMedia: [],
};

export const GoProReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_GOPRO_FILES_TO_LOCAL_STORAGE:
      return {
        ...state,
        mediaList: action.data,
      };

    case SET_DOWNLOADING_FILE:
      return {
        ...state,
        downloadingFile: action.data,
      };

    case SET_UPLOADING_FILE:
      return {
        ...state,
        uploadingFile: action.data,
      };

    case SET_DIR_NAME_TO_DOWNLOAD:
      return {
        ...state,
        downloadedDirName: action.data,
      };

    case SET_DOWNLOADED_COMPLETED:
      return {
        ...state,
        downloadedMediaList: [...state.downloadedMediaList, action.data],
      };

    case SET_UPLOADEDED_COMPLETED:
      return {
        ...state,
        uploadedMediaList: [...state.uploadedMediaList, action.data],
      };

    case SET_SESSION_DETAILS:
      return {
        ...state,
        sessionDetails: action.data,
      };

    case SET_GOPRO_MEDIA:
      return {
        ...state,
        media: action.data,
      };

    default:
      return state;
  }
};
