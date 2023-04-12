import RNFS from 'react-native-fs';

const getFreeSpaceInGB = async () => {
  let size = 0;
  //   return await RNFS.getFSInfo();
  await RNFS.getFSInfo().then(info => {
    size = (info.freeSpace / (1024 * 1024 * 1024)).toFixed(2);
  });
  return size;
};

export {getFreeSpaceInGB};
