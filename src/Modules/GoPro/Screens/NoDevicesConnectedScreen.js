import React from 'react';
import CustomBtn from '../Components/CustomBtn';
import {Linking, StyleSheet, Text, View} from 'react-native';

const NoDevicesConnectedScreen = props => {
  const _btnPressed = () => {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.gopro.smarty',
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.noDeviceConnectedTxt}>
        No Go Pro devices connected. Please open Go Pro Quik app and connect
        your device
      </Text>
      <CustomBtn
        onPress={_btnPressed}
        btnTxt={'Open Go Pro Quik App'}
        data={''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 46,
    backgroundColor: '#000000',
  },
  noDeviceConnectedTxt: {
    fontSize: 20,
    fontWeight: '700',
    color: 'red',
    textAlign: 'center',
  },
});

export default NoDevicesConnectedScreen;
