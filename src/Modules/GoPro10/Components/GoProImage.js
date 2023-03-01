import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {GOPRO10_IMG} from '../Utility/Constants';

const GoProImage = props => {
  return (
    <View style={styles.main}>
      <Image
        source={{
          uri: GOPRO10_IMG,
        }}
        style={styles.goProImg}
      />
      <Text style={styles.deviceName}>{props.name}</Text>
      <Text style={styles.deviceName}>Connected Device Id: {props.id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: 'center',
  },
  goProImg: {
    height: 140,
    width: 300,
    resizeMode: 'contain',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: '#FFFFFF',
    margin: 4,
  },
});

export default GoProImage;
