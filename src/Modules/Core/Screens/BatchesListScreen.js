import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BatchesListScreen = props => {
  const DATA = [
    {
      title: 'DNR Reflection',
      desc: '10 Students',
    },
    {
      title: 'Sobha',
      desc: '25 Students',
    },
  ];
  const _goToStudentsListPage = _ => {};

  const _renderListOfSessions = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={_goToStudentsListPage}
      btnTitle={item.title}
      btnDesc={item.desc}
    />
  );
  return (
    <View style={styles.main}>
      <MaterialIcons
        name={'add-circle'}
        size={75}
        color={'#FFFFFF'}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          margin: 25,
        }}
      />
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

export default BatchesListScreen;
