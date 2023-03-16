import React, {useEffect} from 'react';
import {
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MainScreen = props => {
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);
    } catch (err) {
      console.warn(err);
    }
  };

  const goToCamera = () => {
    props.navigation.navigate('Camera');
  };

  const goToGoPro = () => {
    props.navigation.navigate('GoPro');
  };

  return (
    <View style={styles.main}>
      <Text style={styles.question}>Choose a device to do live stream</Text>
      <View style={styles.deviceLists}>
        <Pressable onPress={goToCamera}>
          <View style={styles.box}>
            <Text style={styles.btnTxt}>Camera</Text>
          </View>
        </Pressable>
        <Pressable onPress={goToGoPro}>
          <View style={styles.box}>
            <Text>Go Pro</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: 25,
    textAlign: 'center',
  },
  deviceLists: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
  },
  box: {
    width: 100,
    height: 100,
    // backgroundColor: '#ABABAB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen;
