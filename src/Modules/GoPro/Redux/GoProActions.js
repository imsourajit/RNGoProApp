import {
  COMPLETED_DOWNLOADED_FILE,
  COMPLETED_UPLOADED_FILE,
  SET_ASSET_ID,
  SET_BYTES_READ,
  SET_COMPLETED_UPLOADING_SEQUENTIAL_UPLOAD,
  SET_DIR_NAME_TO_DOWNLOAD,
  SET_DOWNLOAD_MEDIA_PROGRESS,
  SET_DOWNLOADED_COMPLETED,
  SET_DOWNLOADING_FILE,
  SET_ETAG,
  SET_FILE_PATH,
  SET_GOPRO_FILES_TO_LOCAL_STORAGE,
  SET_GOPRO_MEDIA,
  SET_PART_UPLOAD_URL,
  SET_SCHEDULED_SESSIONS,
  SET_SESSION_DETAILS,
  SET_UPLOAD_MEDIA_PROGRESS,
  SET_UPLOADEDED_COMPLETED,
  SET_UPLOADING_FILE,
} from './GoProActionTypes';
import ApiService from '../../../Services/ApiService';

export const storeGoProMediaFilesListLocally = files => ({
  type: SET_GOPRO_FILES_TO_LOCAL_STORAGE,
  data: files,
});

export const setDownloadingFile = data => ({
  type: SET_DOWNLOADING_FILE,
  data,
});

export const setDirectoryNameToDownload = dir => ({
  type: SET_DIR_NAME_TO_DOWNLOAD,
  data: dir,
});

export const setDownloadCompleted = data => ({
  type: SET_DOWNLOADED_COMPLETED,
  data,
});

export const setUploadingFile = data => ({
  type: SET_UPLOADING_FILE,
  data,
});

export const setUploadCompleted = data => ({
  type: SET_UPLOADEDED_COMPLETED,
  data,
});

export const setLastSessionDetails = data => ({
  type: SET_SESSION_DETAILS,
  data,
});

export const setGoProMedia = data => ({
  type: SET_GOPRO_MEDIA,
  data,
});

export const setDownloadingProgressOfMedia = data => ({
  type: SET_DOWNLOAD_MEDIA_PROGRESS,
  data,
});

export const setUploadingProgressOfMedia = data => ({
  type: SET_UPLOAD_MEDIA_PROGRESS,
  data,
});
export const downloadedCompletedFile = data => ({
  type: COMPLETED_DOWNLOADED_FILE,
  data,
});
export const uploadedCompletedFile = data => ({
  type: COMPLETED_UPLOADED_FILE,
  data,
});

export const getScheduledSessions = (params, onSuccess, onError) => dispatch =>
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

export const setScheduledSessions = data => ({
  type: SET_SCHEDULED_SESSIONS,
  data,
});

export const setUploadingAssetId = data => ({
  type: SET_ASSET_ID,
  data,
});

export const setETagForAssetId = data => ({
  type: SET_ETAG,
  data,
});

export const setFilePath = data => ({
  type: SET_FILE_PATH,
  data,
});

export const setChunkUploaded = data => ({
  type: 'CHUNK_UPLOADED',
  data,
});

export const setBytesRead = data => ({
  type: SET_BYTES_READ,
  data,
});

export const setCompletedUploading = data => ({
  type: SET_COMPLETED_UPLOADING_SEQUENTIAL_UPLOAD,
});

export const setPartUploadUrl = data => ({
  type: SET_PART_UPLOAD_URL,
  data,
});

export const setFileSize = data => ({
  type: 'SET_FILE_SIZE',
  data,
});

export const setCurrentBackFile = data => ({
  type: 'SET_CURRENT_BACKUP_FILE',
  data,
});
