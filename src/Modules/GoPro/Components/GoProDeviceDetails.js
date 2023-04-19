import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';

const {width, height} = Dimensions.get('window');

const GoProDeviceDetails = props => {
  const {ssid} = props.deviceDetails;

  return (
    <View style={styles.block}>
      <View style={styles.leftBlock}>
        <Image
          source={require('../Assets/goPro.png')}
          style={styles.goProImage}
        />
      </View>
      <View style={styles.rightBlock}>
        <Text style={styles.deviceName} numberOfLines={2}>
          {ssid ?? 'GoPro'}
        </Text>
        {props?.id ? (
          <Text style={styles.deviceId}>Device Id: {props.id}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    // flex: 1,
    backgroundColor: '#353535',
    // margin: 10,
    padding: 5,
    // width: width - 20,
    borderRadius: 10,
    flexDirection: 'row',
    // alignSelf:
  },
  leftBlock: {
    // backgroundColor: 'red',
    padding: 0,
    justifyContent: 'flex-start',
  },
  goProImage: {
    width: 160,
    height: 100,
    resizeMode: 'cover',
  },
  rightBlock: {
    paddingVertical: 10,
    width: width - 220,
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#7d7676',
    fontWeight: 'bold',
  },
});

export default GoProDeviceDetails;
