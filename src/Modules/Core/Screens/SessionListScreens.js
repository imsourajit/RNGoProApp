import React, {useEffect, useState} from 'react';
import {FlatList, Linking, StyleSheet, ToastAndroid, View} from 'react-native';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import {useDispatch} from 'react-redux';
import {listSessionsByCoachId} from '../Redux/UserActions';

const SessionListScreens = props => {
  const [sessionsList, setSessionsList] = useState(null);
  const dispatch = useDispatch();

  function getDayMonthNameFromMillis(millis) {
    const date = new Date(millis);
    const day = date.toLocaleString('en-US', {day: '2-digit'});
    const month = date.toLocaleString('en-US', {month: 'long'});
    return `${day} ${month}`;
  }

  useEffect(() => {
    dispatch(
      listSessionsByCoachId(
        {
          startTime: new Date().getTime(),
          start: 0,
          size: 20,
        },
        suc => {
          setSessionsList(suc.filter(itm => itm.liveStreamUrl !== null));
        },
        err =>
          ToastAndroid.show('Oops!! Something went wrong', ToastAndroid.SHORT),
      ),
    );
  }, []);

  const _goToSessionWebview = url => {
    Linking.openURL(url);
  };

  const _renderListOfSessions = ({item, index}) => (
    <RightArrowBoxesWithDescription
      pressed={_goToSessionWebview}
      btnTitle={getDayMonthNameFromMillis(item.startTime)}
      btnDesc={item.centreTitle ?? ''}
      data={item.liveStreamUrl}
    />
  );
  return (
    <View style={styles.main}>
      <FlatList
        data={sessionsList}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.startTime.toString() + index}
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
