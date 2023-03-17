import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';

const SessionListScreens = props => {
  const DATA = [
    {
      title: '17 March',
      desc: 'DNR Reflection',
    },
    {
      title: '18th March',
      desc: 'Sobha',
    },
  ];
  const _goToSessionWebview = _ => {};

  const _renderListOfSessions = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={_goToSessionWebview}
      btnTitle={item.title}
      btnDesc={item.desc}
    />
  );
  return (
    <View style={styles.main}>
      <FlatList
        data={DATA}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.title.toString() + index}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
});

export default SessionListScreens;
