import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import * as Progress from 'react-native-progress';

const FileAndProgress = ({data, index, totalFiles}) => {
  const {downloadingFile} = useSelector(st => st.GoProReducer);

  const progressPercentile = downloadingFile.progress;

  let m = [];

  for (let i = 0; i < index; i++) {
    m.push(
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../Assets/tick.png')}
          style={{
            width: 15,
            height: 15,
            backgroundColor: '#222222',
            resizeMode: 'contain',
          }}
        />
        <Text style={{marginLeft: 2, fontSize: 14}}>{totalFiles[i].n}</Text>
      </View>,
    );
  }

  if (!downloadingFile) {
    return null;
  }

  if (downloadingFile && downloadingFile.index == index) {
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
          {`Downloading ${index + 1} of ${totalFiles.length} files from Go Pro`}
        </Text>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              // marginRight: 10,
            }}>
            <Text>{data?.n ?? ''}</Text>
            <Text style={{color: '#F6F6F6', fontSize: 12}}>
              {progressPercentile.toFixed(2)} %
            </Text>
          </View>
          <Progress.Bar
            progress={downloadingFile.progress / 100}
            width={Dimensions.get('window').width - 60}
            animated={true}
            color={'#17699b'}
          />
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
          {m}
        </View>
      </View>
    );
  }

  return null;
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
