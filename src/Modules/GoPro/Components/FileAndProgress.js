import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

const FileAndProgress = ({data, index}) => {
  const {downloadingFile} = useSelector(st => st.GoProReducer);

  if (!downloadingFile) {
    return null;
  }

  if (downloadingFile && downloadingFile.index == index) {
    return (
      <View style={styles.progressBox}>
        <Text style={styles.fileName}>{data?.n ?? ''}</Text>
        <Text>{downloadingFile.progress}</Text>
      </View>
    );
  }

  return (
    <View style={styles.progressBox}>
      <Text style={styles.fileName}>{data?.n ?? ''}</Text>
      <Text>{downloadingFile.index > index ? 100 : 0}</Text>
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

export default FileAndProgress;
