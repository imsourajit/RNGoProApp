import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import * as Progress from 'react-native-progress';
import _ from 'lodash';
import {btnBgColor} from '../../../Config';

const DownloadAndUploadProgressBar = () => {
  const {
    downloadedMediaProgress,
    uploadedMediaProgress,
    media,
    uploadedChunkMedia,
  } = useSelector(st => st.GoProReducer);

  const {filesSelected, backupFilePos} = uploadedChunkMedia ?? {};

  const [backupText, setBackupText] = useState('Taking backup');

  useEffect(() => {
    console.log(filesSelected, backupFilePos, uploadedChunkMedia);

    if (filesSelected != undefined && backupFilePos !== undefined) {
      setBackupText(`Taking backup ${backupFilePos} of ${filesSelected}`);
    }
  }, [filesSelected, backupFilePos]);

  // useEffect(() => {
  //   let allFiles = [];
  //   media?.map(item => {
  //     allFiles = [...allFiles, ...item.fs];
  //   });

  //   const index = _.findIndex(allFiles, file =>
  //     (file.n === downloadedMediaProgress) === null
  //       ? uploadedMediaProgress?.fileName
  //       : downloadedMediaProgress?.fileName,
  //   );
  //   if (index >= 0) {
  //     setBackupText(`Taking backup of ${index + 1} of ${allFiles.length}`);
  //   }
  // }, [media]);

  if (downloadedMediaProgress == null && uploadedMediaProgress == null) {
    return null;
  }

  const uploadedFileName = uploadedMediaProgress?.fileName ?? '';
  const uploadedProgress = uploadedMediaProgress?.percentile ?? 0;
  const downloadedFileName = downloadedMediaProgress?.fileName ?? '';
  const downloadedProgress = downloadedMediaProgress?.percentile ?? 0;

  const progressPercentile =
    downloadedMediaProgress === null ? uploadedProgress : downloadedProgress;
  const fileName =
    downloadedMediaProgress === null ? uploadedFileName : downloadedFileName;

  const uploadBackUpText = uploadedMediaProgress?.progressText;

  if (!progressPercentile) {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={btnBgColor} />
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#222222',
        padding: 10,
        borderRadius: 5,
      }}>
      <Text
        style={{
          color: '#1fa2e7',
          fontWeight: 'bold',
          marginBottom: 10,
          // marginTop: 5,
          fontSize: 16,
        }}>
        {uploadBackUpText ?? backupText}
      </Text>
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // marginRight: 10,
          }}>
          <Text style={{color: '#FFFFFF'}}>
            {decodeURIComponent(fileName.slice(0, 35)) ?? ''}
          </Text>
          <Text style={{color: '#F6F6F6', fontSize: 12}}>
            {progressPercentile.toFixed(2)} %
          </Text>
        </View>
        <Progress.Bar
          progress={progressPercentile / 100}
          width={Dimensions.get('window').width - 20 - 32}
          animated={true}
          color={'#17699b'}
          indeterminate={progressPercentile == 0}
        />
      </View>
      {/*<View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>*/}
      {/*  {m}*/}
      {/*</View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBox: {
    flex: 1,
  },
});

export default DownloadAndUploadProgressBar;
