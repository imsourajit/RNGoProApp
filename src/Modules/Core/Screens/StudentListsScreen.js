import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  addStudentsToBatch,
  emptySelectedContactList,
  listStudentsByBatchId,
} from '../Redux/UserActions';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Contacts from 'react-native-contacts';
import ContactSelectionBox from '../Components/ContactSelectionBox';

const StudentListsScreen = props => {
  const dispatch = useDispatch();
  const {batchId} = props.route.params;

  const [studentsList, setStudentsList] = useState(null);
  const [contactListVisibility, setContactListVisibility] = useState(false);
  const [contacts, setContacts] = useState([]);

  const {selectedContacs} = useSelector(st => st.userReducer);

  useEffect(() => {
    _getListofStudents();
  }, [batchId]);

  const _getListofStudents = _ => {
    dispatch(
      listStudentsByBatchId(
        {
          batchId,
        },
        res => setStudentsList(res.students),
        err =>
          ToastAndroid.show(
            'Oops!!! Something  went wrong',
            ToastAndroid.BOTTOM,
          ),
      ),
    );
  };

  const _renderStudentsList = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={() => {}}
      btnTitle={item.fullName}
      btnDesc={item.phoneNumber}
      isIconShow={false}
    />
  );

  const showContactList = async _ => {
    setContactListVisibility(true);
    let tempContactNumbers = [];
    try {
      const contacts = await Contacts.getAll();
      contacts.map(item => {
        item.phoneNumbers.map(ph => {
          const pushObj = {...item, ph};
          const check = studentsList.filter(
            itm => itm.phoneNumber === ph.number,
          );
          if (!check.length) {
            tempContactNumbers.push(pushObj);
          }
        });
      });
      setContacts(tempContactNumbers);
    } catch (err) {
      console.log('Fetching contacts error', err);
    }
  };

  const _renderContacts = ({item, index}) => {
    const {displayName, phoneNumbers, ph, givenName} = item;
    return (
      <ContactSelectionBox
        name={displayName}
        mobileNumber={ph.number}
        batchId={batchId}
      />
    );
  };

  const _addSelectedContactsToBatch = () => {
    // dispatch(addStudentsToBatch(selectedContacs));
    selectedContacs.map(item => dispatch(addStudentsToBatch(item, null, null)));
    setContactListVisibility(false);
    _getListofStudents();
  };

  if (studentsList === null) {
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
        transparent={false}
        visible={contactListVisibility}
        onRequestClose={() => {
          dispatch(emptySelectedContactList());
          setContactListVisibility(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Contact List</Text>

            <FlatList
              data={contacts}
              renderItem={_renderContacts}
              keyExtractor={(item, index) =>
                item.displayName + index.toString()
              }
              style={{
                flex: 1,
              }}
              ListEmptyComponent={
                <View style={{flex: 1}}>
                  <Text style={{color: '#FFFFFF'}}>
                    No extra contacts found that can be added in this batch
                  </Text>
                </View>
              }
            />

            {contacts.length ? (
              <Pressable onPress={_addSelectedContactsToBatch}>
                <View style={styles.addContactBtn}>
                  <Text style={styles.addContactBtnTxt}>Add</Text>
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
      <FlatList
        data={studentsList}
        renderItem={_renderStudentsList}
        keyExtractor={(item, index) => item.fullName?.toString() + index}
        ListEmptyComponent={
          <View style={{flex: 1}}>
            <Text style={{color: '#FFFFFF'}}>
              No students found in this batch
            </Text>
          </View>
        }
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
          onPress={showContactList}
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
    // alignItems: 'center',
  },
  modalText: {
    color: '#FFFFFF',
    alignSelf: 'center',
    fontSize: 20,
    marginBottom: 30,
  },
  modalView: {
    backgroundColor: '#000000',
    margin: 20,
    flex: 1,
    // borderRadius: 10,
    // padding: 10,
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
  addContactBtn: {
    backgroundColor: '#FFA366',
    padding: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContactBtnTxt: {
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontSize: 16,
  },
});

export default StudentListsScreen;
