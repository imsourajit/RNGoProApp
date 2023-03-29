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
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignSelf: 'stretch',
        }}>
        <Text style={styles.noDeviceConnectedTxt}>
          No GoPro devices connected. Please open GoPro Quik app and connect
          your device
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignSelf: 'stretch',
          paddingBottom: 10,
        }}>
        <CustomBtn
          onPress={_btnPressed}
          btnTxt={'Open GoPro Quik App'}
          data={''}
        />
      </View>
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
