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
