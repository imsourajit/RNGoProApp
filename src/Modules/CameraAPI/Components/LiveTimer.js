import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {updateLiveTime} from '../Redux/CameraApiActions';

const LiveTimer = props => {
  const convertToHHMMSS = millis => {
    let days = Math.floor(millis / (1000 * 60 * 60 * 24));
    let hours = Math.floor((millis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((millis % (1000 * 60)) / 1000);

    if (minutes === 0 && seconds === 0) {
      return '';
    }

    if (hours < 10) {
      hours = '0' + hours;
    }

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return hours + ' : ' + minutes + ' : ' + seconds;
  };

  const {toStart} = props;

  const dispatch = useDispatch();

  const {liveTime} = useSelector(st => st.cameraApiReducer);

  let interval;

  useEffect(() => {
    console.log('Timer', toStart);

    interval = setInterval(() => {
      console.log('Timer inside', toStart);

      if (!toStart) {
        clearInterval(interval);
      } else {
        dispatch(updateLiveTime(1000));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [toStart]);

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerTxt}>
        {liveTime ? convertToHHMMSS(liveTime) : '00: 00: 00'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    backgroundColor: 'red',
    padding: 7,
    // margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // minWidth: 100,
  },
  timerTxt: {
    color: 'white',
    fontSize: 16,
  },
});

export default LiveTimer;
