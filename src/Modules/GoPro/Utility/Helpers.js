import RNFetchBlob from 'rn-fetch-blob';

export const creatorAppDirectory = () => {
  const dirs = RNFetchBlob.fs.dirs; //Use the dir API
  const FC_One_Dir = dirs.DocumentDir + '/FC_One';
  RNFetchBlob.fs.mkdir(FC_One_Dir).catch(err => {
    console.log(err);
  });
  console.log(dirs.DocumentDir);
  console.log(FC_One_Dir);
};
