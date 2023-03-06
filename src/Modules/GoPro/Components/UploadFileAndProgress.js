import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

const UploadFileAndProgress = ({data, index}) => {
  const {uploadingFile} = useSelector(st => st.GoProReducer);

  if (!uploadingFile) {
    return null;
  }

  if (uploadingFile && uploadingFile.index == index) {
    return (
      <View style={styles.progressBox}>
        <Text style={styles.fileName}>{data?.n ?? ''}</Text>
        <Text>{uploadingFile.progress}</Text>
      </View>
    );
  }

  return (
    <View style={styles.progressBox}>
      <Text style={styles.fileName}>{data?.n ?? ''}</Text>
      <Text>{uploadingFile.index > index ? 100 : 0}</Text>
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

export default UploadFileAndProgress;
