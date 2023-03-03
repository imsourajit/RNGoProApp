import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import * as Progress from 'react-native-progress';

const DownloadedMediaBox = props => {
  const [currentDownloads, setDownloads] = React.useState([]);
  const {downloadingMedia, media} = useSelector(st => st.GoPro10Reducer);

  const _renderItem = ({item, index}) => {
    const {n} = item;

    if (downloadingMedia.index == index) {
      return (
        <View>
          <Text>{n}</Text>
          <Progress.Bar
            progress={downloadingMedia.progress / 100}
            width={Dimensions.get('window').width - 32}
          />
        </View>
      );
    }
    return (
      <View>
        <Text>{n}</Text>
        <Progress.Bar
          progress={downloadingMedia.index > index ? 1 : 0}
          width={Dimensions.get('window').width - 32}
        />
      </View>
    );
  };

  return (
    <View>
      {Array.isArray(props.data) && props.data.length ? (
        <Text>Downloading Files</Text>
      ) : null}
      <FlatList
        data={props.data}
        renderItem={_renderItem}
        // keyExtractor={(item, index) => item.n.toString()}
        style={styles.main}
        ListHeaderComponentStyle={
          <View style={styles.main}>
            <Text style={{color: '#FFFFFF'}}>Downloading Files</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

export default DownloadedMediaBox;
