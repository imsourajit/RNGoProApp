import {logLoadEvent} from '../../../Services/AnalyticsTools';
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
  SET_ASSET_ID,
  SET_FILE_PATH,
  SET_ETAG,
  SET_BYTES_READ,
  SET_COMPLETED_UPLOADING_SEQUENTIAL_UPLOAD,
  SET_PART_UPLOAD_URL,
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
  uploadedChunkMedia: {},
  analyticsProgressRange: 0,
  analyticsProgressRangeUpload: 0,
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
      let analyticsProgressRange =
        action.data?.percentile > state.analyticsProgressRange + 25
          ? state.analyticsProgressRange + 25
          : state.analyticsProgressRange;

      if (action.data?.percentile > state.analyticsProgressRange + 25) {
        logLoadEvent('app_backup_progress', {
          progress: analyticsProgressRange,
          type: 'download',
        });
      }

      if (action.data?.percentile <= 25 && analyticsProgressRange == 0) {
        // progress for 25
      } else if (action.data?.percentile > 25 && analyticsProgressRange == 50) {
        // progress for 50
      }

      return {
        ...state,
        downloadedMediaProgress: action.data,
        analyticsProgressRange: analyticsProgressRange,
      };
    }

    case SET_UPLOAD_MEDIA_PROGRESS: {
      let analyticsProgressRangeUpload =
        action.data?.percentile > state.analyticsProgressRangeUpload + 25
          ? state.analyticsProgressRangeUpload + 25
          : state.analyticsProgressRangeUpload;

      if (action.data?.percentile > state.analyticsProgressRangeUpload + 25) {
        logLoadEvent('app_backup_progress', {
          progress: analyticsProgressRangeUpload,
          type: 'upload',
        });
      }
      return {
        ...state,
        uploadedMediaProgress: action.data,
        analyticsProgressRangeUpload: analyticsProgressRangeUpload,
      };
    }

    case COMPLETED_DOWNLOADED_FILE: {
      return {
        ...state,
        downloadedMedia: [...state.downloadedMedia, action.data],
        analyticsProgressRange: 0,
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

    case SET_ASSET_ID: {
      return {
        ...state,
        uploadedChunkMedia: {
          ...state.uploadedChunkMedia,
          assetId: action.data,
          eTag: [],
        },
      };
    }

    case SET_FILE_PATH: {
      return {
        ...state,
        uploadedChunkMedia: {
          ...state.uploadedChunkMedia,
          filePath: action.data,
        },
      };
    }

    case SET_ETAG: {
      let eTag = [action.data];
      if (Array.isArray(state.uploadedChunkMedia?.eTag)) {
        eTag = [...state.uploadedChunkMedia.eTag, action.data];
      }
      return {
        ...state,
        uploadedChunkMedia: {
          ...state.uploadedChunkMedia,
          eTag,
        },
      };
    }

    case SET_BYTES_READ: {
      return {
        ...state,
        uploadedChunkMedia: {
          ...state.uploadedChunkMedia,
          bytesRead: action.data,
        },
      };
    }

    case SET_PART_UPLOAD_URL: {
      return {
        ...state,
        uploadedChunkMedia: {
          ...state.uploadedChunkMedia,
          partDetails: action.data,
        },
      };
    }

    case SET_COMPLETED_UPLOADING_SEQUENTIAL_UPLOAD: {
      return {
        ...state,
        uploadedChunkMedia: {},
      };
    }

    default:
      return state;
  }
};
