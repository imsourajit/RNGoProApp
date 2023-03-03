import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

const DownloadedMediaBox = props => {
  const [currentDownloads, setDownloads] = React.useState([]);
  const {downloadingMedia, media} = useSelector(st => st.GoPro10Reducer);

  const _renderItem = ({item, index}) => {
    console.log('@name', item);

    const {n} = item;

    if (downloadingMedia.name === n) {
      return (
        <View>
          <Text>{name}</Text>
          {/*<Progress.Bar*/}
          {/*  progress={downloadingMedia.progress}*/}
          {/*  width={Dimensions.get('window').width - 32}*/}
          {/*/>*/}
        </View>
      );
    }
    return (
      <View>
        <Text>{name}</Text>
        {/*<Progress.Bar*/}
        {/*  progress={1}*/}
        {/*  width={Dimensions.get('window').width - 32}*/}
        {/*/>*/}
      </View>
    );
  };

  return (
    <FlatList
      data={props.data}
      renderItem={_renderItem}
      keyExtractor={(item, index) => item.n.toString()}
    />
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

export default DownloadedMediaBox;
