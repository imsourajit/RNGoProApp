import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import RadioButtonSelectionBox from '../Components/RadioButtonSelectionBox';

const BatchSelectionScreen = props => {
  const [batchSelected, selectBatch] = useState(null);

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
  const _goToStudentsListPage = batchIndex => {
    selectBatch(batchIndex);
  };

  const _renderListOfSessions = ({item, index}) => (
    <RadioButtonSelectionBox
      pressed={_goToStudentsListPage}
      btnTitle={item.title}
      btnDesc={item.desc}
      batchSelected={batchSelected}
      index={index}
    />
  );

  const _startSession = () => {
    const {selectedDevice} = props.route.params;
    if (selectedDevice === 'CAMERA') {
      props.navigation.navigate('Camera');
      return;
    }

    if (selectedDevice === 'GO_PRO') {
      props.navigation.navigate('GoPro');
      return;
    }
  };
  return (
    <View style={styles.main}>
      <FlatList
        data={DATA}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.title.toString() + index}
      />
      <View style={{height: 120, justifyContent: 'center'}}>
        <Pressable onPress={_startSession}>
          <View style={styles.btn}>
            <Text style={styles.btnTxt}>START SESSION</Text>
          </View>
        </Pressable>
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
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  btn: {
    backgroundColor: '#3164F4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
});

export default BatchSelectionScreen;
