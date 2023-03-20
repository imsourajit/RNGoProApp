import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Contacts from 'react-native-contacts';

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
  const _goToStudentsListPage = _ => {
    props.navigation.navigate('StudentsListScreen');
  };

  const _renderListOfSessions = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={_goToStudentsListPage}
      btnTitle={item.title}
      btnDesc={item.desc}
    />
  );

  const fetchContactList = () => {
    Contacts.getAll().then(contacts => {
      // contacts returned
      console.log('@contacts', contacts);
    });
  };
  return (
    <View style={styles.main}>
      <FlatList
        data={DATA}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.title.toString() + index}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: '#000000',
          // margin: 25,
        }}>
        <MaterialIcons
          name={'add-circle'}
          size={75}
          color={'#FFFFFF'}
          onPress={fetchContactList}
        />
      </View>
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
