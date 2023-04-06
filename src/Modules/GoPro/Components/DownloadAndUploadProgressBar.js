import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import * as Progress from 'react-native-progress';

const DownloadAndUploadProgressBar = () => {
  const {downloadedMediaProgress, uploadedMediaProgress} = useSelector(
    st => st.GoProReducer,
  );

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
        Sample Text
        {/*{progressPercentile == 0*/}
        {/*  ? 'Optimizing Video'*/}
        {/*  : `Uploading ${index + 1} of ${*/}
        {/*    totalFiles?.length ?? 0*/}
        {/*  } files to Server`}*/}
      </Text>
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // marginRight: 10,
          }}>
          <Text>{fileName ?? ''}</Text>
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
