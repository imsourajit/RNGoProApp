import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ToastAndroid,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {listStudentsByBatchId} from '../Redux/UserActions';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';

const StudentListsScreen = props => {
  const dispatch = useDispatch();
  const {batchId} = props.route.params;
  console.log(batchId);

  const [studentsList, setStudentsList] = useState(null);
  useEffect(() => {
    dispatch(
      listStudentsByBatchId(
        {
          batchId,
        },
        res => setStudentsList(res.students),
        err => ToastAndroid.show('Oops!!! Something  went wrong'),
      ),
    );
  }, [batchId]);

  const _renderStudentsList = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={() => {}}
      btnTitle={item.fullName}
      btnDesc={item.phoneNumber}
      isIconShow={false}
    />
  );

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
      <FlatList
        data={studentsList}
        renderItem={_renderStudentsList}
        keyExtractor={(item, index) => item.fullName?.toString() + index}
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

export default StudentListsScreen;
