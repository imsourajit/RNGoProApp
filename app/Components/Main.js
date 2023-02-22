import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {CAMERA_IP, CAMERA_NAME, CAMERA_PASSWORD} from '../Utils/Constants';

const Main = props => {
  const [isWifiConnected, setWifiConnected] = useState(null);

  const _stopRecordingVideo = _ => {
    fetch(`http://${CAMERA_IP}/gopro/camera/shutter/stop`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };
  const _startRecordingVideo = _ => {
    fetch(`http://${CAMERA_IP}/gopro/camera/shutter/start`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _stopWebCam = _ => {
    fetch(`http://${CAMERA_IP}/gopro/webcam/stop`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };
  const _startWebCam = _ => {
    alert(`http://${CAMERA_IP}/gopro/webcam/start`);
    fetch(`http://${CAMERA_IP}/gopro/webcam/preview`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _handleWifiConnection = async _ => {
    setWifiConnected(true);
    try {
      await WifiManager.connectToProtectedSSID(
        CAMERA_NAME,
        CAMERA_PASSWORD,
        false,
      );
      console.log('Wifi Successfully Connected');
    } catch (error) {
      console.log('Wifi failed Connecting');
    }
    setWifiConnected(false);
  };

  const _getMediaList = _ => {
    fetch(`http://${CAMERA_IP}/gopro/media/list`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r.media[0].fs[0]))
      .catch(e => console.log('Camera State error', e));
  };

  const __downloadMedia = _ => {
    Linking.openURL(`http://${CAMERA_IP}/videos/DCIM/100GOPRO/GH010958.MP4`);
  };

  return (
    <View style={styles.main}>
      {isWifiConnected && <ActivityIndicator size={'large'} color={'blue'} />}
      <Pressable onPress={_handleWifiConnection} style={styles.btn}>
        <Text style={{fontSize: 24}}>Connect to GoProHero10</Text>
      </Pressable>
      <Pressable onPress={_startRecordingVideo} style={styles.btn}>
        <Text style={{fontSize: 24}}>Start Recording Video</Text>
      </Pressable>
      <Pressable onPress={_stopRecordingVideo} style={styles.btn}>
        <Text style={{fontSize: 24}}>Stop Recording Video</Text>
      </Pressable>
      <Pressable onPress={_startWebCam} style={styles.btn}>
        <Text style={{fontSize: 24}}>Start Webcam</Text>
      </Pressable>
      <Pressable onPress={_stopWebCam} style={styles.btn}>
        <Text style={{fontSize: 24}}>Stop Webcam</Text>
      </Pressable>
      <Pressable onPress={_getMediaList} style={styles.btn}>
        <Text style={{fontSize: 24}}>Get Media List</Text>
      </Pressable>
      <Pressable onPress={__downloadMedia} style={styles.btn}>
        <Text style={{fontSize: 24}}>Download Media</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    marginVertical: 20,
  },
});

export default Main;
