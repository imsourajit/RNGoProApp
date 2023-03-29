import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import RadioButtonSelectionBox from '../Components/RadioButtonSelectionBox';
import {listBatchesByCoachId} from '../Redux/UserActions';
import {useDispatch, useSelector} from 'react-redux';

const BatchSelectionScreen = props => {
  const [batchSelected, selectBatch] = useState(null);
  const [batches, setBatches] = useState([]);

  const dispatch = useDispatch();
  const {
    user: {userId},
  } = useSelector(st => st.userReducer);

  useEffect(() => {
    dispatch(
      listBatchesByCoachId(
        {
          coachId: userId,
        },
        res => setBatches(res),
        err => {
          console.log('Error', err);
          ToastAndroid.show('Unable to fetch list', ToastAndroid.SHORT);
        },
      ),
    );
  }, []);

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
    if (batchSelected == null) {
      ToastAndroid.show('Please select batch', ToastAndroid.SHORT);
      return;
    }

    const {selectedDevice, toRecord} = props.route.params;
    if (selectedDevice === 'CAMERA') {
      props.navigation.navigate('Camera', {
        batchId: batches[batchSelected]?.id,
      });
      return;
    }

    if (selectedDevice === 'GO_PRO') {
      if (toRecord) {
        props.navigation.navigate('GoProRecordScreen', {
          batchId: batches[batchSelected]?.id,
        });
        return;
      }

      props.navigation.navigate('GoPro', {
        batchId: batches[batchSelected]?.id,
      });
      return;
    }
  };
  return (
    <View style={styles.main}>
      <FlatList
        data={batches}
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
