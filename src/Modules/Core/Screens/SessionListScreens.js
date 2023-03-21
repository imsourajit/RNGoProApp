import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, ToastAndroid, View} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import {useDispatch} from 'react-redux';
import {listSessionsByCoachId} from '../Redux/UserActions';

const SessionListScreens = props => {
  const [sessionsList, setSessionsList] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      listSessionsByCoachId(
        {
          startTime: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
          // endTime: new Date().getTime(),
          start: 0,
          size: 20,
        },
        suc => setSessionsList(suc),
        err =>
          ToastAndroid.show('Oops!! Something went wrong', ToastAndroid.SHORT),
      ),
    );
  }, []);

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
        data={sessionsList}
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
