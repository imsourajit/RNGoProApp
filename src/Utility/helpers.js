import RNFS from 'react-native-fs';

const getFreeSpaceInGB = async () => {
  let size = 0;
  //   return await RNFS.getFSInfo();
  await RNFS.getFSInfo().then(info => {
    size = (info.freeSpace / (1024 * 1024 * 1024)).toFixed(2);
  });
  return size;
};

const isEmpty = obj => {
  if (obj !== null && obj !== undefined) {
    if (typeof obj === 'string') {
      if (obj.trim() === '' || obj == 'null') {
        return true;
      }
      return false;
    }
    if (obj.length <= 0) {
      return true;
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      const len = keys.length;
      if (len <= 0) {
        return true;
      }
      return false;
    }
    return false;
  }
  return true;
};
export {getFreeSpaceInGB, isEmpty};
