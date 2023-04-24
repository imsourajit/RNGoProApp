import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Contacts from 'react-native-contacts';
import {useDispatch, useSelector} from 'react-redux';
import {addBatchByCoachId, listBatchesByCoachId} from '../Redux/UserActions';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';

const BatchesListScreen = props => {
  const dispatch = useDispatch();

  const [batches, setBatches] = useState(null);
  const [formVisibility, setFormVisibility] = useState(false);
  const [batchTitle, setBatchTitle] = useState('');

  const {
    user: {userId},
  } = useSelector(st => st.userReducer);

  useEffect(() => {
    const backAction = () => {
      logClickEvent('app_back', {
        screen: 'batch',
        type: 'soft',
      });
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    logLoadEvent('app_batch_screen');
  }, []);

  useEffect(() => {
    getListOfBatches();
  }, [userId]);

  const getListOfBatches = () => {
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
  };

  const _goToStudentsListPage = bId => {
    logClickEvent('app_batch_select', {
      batch: bId,
    });
    props.navigation.navigate('StudentsListScreen', {
      batchId: bId,
    });
  };

  const _renderListOfSessions = ({item, index}) => {
    const {students} = item;

    let btnDesc = '';

    if (students === null || (Array.isArray(students) && !students.length)) {
      btnDesc = '0 student';
    } else {
      btnDesc =
        students.length === 1 ? '1 student' : students.length + ' students';
    }

    return (
      <RightArrowBoxesWithDescription
        pressed={_goToStudentsListPage}
        btnTitle={item.title}
        btnDesc={btnDesc}
        data={item.id}
      />
    );
  };

  const fetchContactList = () => {
    Contacts.getAll().then(contacts => {
      // contacts returned
      console.log('@contacts', contacts);
    });
  };

  const addBatch = () => {
    dispatch(
      addBatchByCoachId(
        {
          title: batchTitle,
          coachId: userId,
        },
        res => {
          console.log('Batch has been added', res);
          getListOfBatches();
          setFormVisibility(false);
          ToastAndroid.show('New batch added successfully', ToastAndroid.SHORT);
        },
        err => console.log('Error while adding batch', err),
      ),
    );
  };

  const addBatchesFormVisibility = () => {
    setFormVisibility(true);
  };

  if (!Array.isArray(batches)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000',
        }}>
        <ActivityIndicator size={'large'} color={'#FFFFFF'} />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={formVisibility}
        onRequestClose={() => {
          setFormVisibility(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add Batch</Text>
            <TextInput
              value={batchTitle}
              onChangeText={setBatchTitle}
              style={{
                borderWidth: 1,
                borderColor: '#ababab',
                fontSize: 17,
              }}
              placeholder={'Enter Batch title'}
              placeholderTextColor={'#ababab'}
            />
            <Pressable
              style={[styles.button]}
              onPress={() => {
                if (batchTitle.length > 3) {
                  addBatch();
                  return;
                }
                ToastAndroid.show(
                  'Please enter batch title',
                  ToastAndroid.SHORT,
                );
              }}>
              <Text style={styles.textStyle}>Add batch</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FlatList
        data={batches}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.title.toString() + index}
      />
      {/* <View
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
          onPress={addBatchesFormVisibility}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  modalText: {
    color: '#000000',
    alignSelf: 'center',
    fontSize: 20,
    marginBottom: 30,
  },
  modalView: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    margin: 20,
    borderRadius: 10,
    padding: 10,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFA366',
    margin: 10,
    marginHorizontal: 30,
  },
  textStyle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default BatchesListScreen;
