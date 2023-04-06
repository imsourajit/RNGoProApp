import {
  COMPLETED_DOWNLOADED_FILE,
  COMPLETED_UPLOADED_FILE,
  SET_DIR_NAME_TO_DOWNLOAD,
  SET_DOWNLOAD_MEDIA_PROGRESS,
  SET_DOWNLOADED_COMPLETED,
  SET_DOWNLOADING_FILE,
  SET_GOPRO_FILES_TO_LOCAL_STORAGE,
  SET_GOPRO_MEDIA,
  SET_SCHEDULED_SESSIONS,
  SET_SESSION_DETAILS,
  SET_UPLOAD_MEDIA_PROGRESS,
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
  downloadedMediaProgress: null,
  uploadedMediaProgress: null,
  scheduledSessions: [],
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

    case SET_DOWNLOAD_MEDIA_PROGRESS: {
      return {
        ...state,
        downloadedMediaProgress: action.data,
      };
    }

    case SET_UPLOAD_MEDIA_PROGRESS: {
      return {
        ...state,
        uploadedMediaProgress: action.data,
      };
    }

    case COMPLETED_DOWNLOADED_FILE: {
      return {
        ...state,
        downloadedMedia: [...state.downloadedMedia, action.data],
      };
    }

    case COMPLETED_UPLOADED_FILE: {
      return {
        ...state,
        uploadedMedia: [...state.uploadedMedia, action.data],
      };
    }

    case SET_SCHEDULED_SESSIONS: {
      return {
        ...state,
        scheduledSessions: action.data,
      };
    }

    default:
      return state;
  }
};
