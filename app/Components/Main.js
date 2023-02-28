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
import {
  CAMERA_IP,
  CAMERA_NAME,
  CAMERA_PASSWORD,
  CAMERA_PORT,
} from '../Utils/Constants';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

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
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/list`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r.media))
      .catch(e => console.log('Camera State error', e));
  };

  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
  };

  const downloadFile = () => {
    const date = new Date();
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/turbo_transfer?p=1`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    RNFS.downloadFile({
      fromUrl: 'http://10.5.5.9:8080/videos/DCIM/100GOPRO/GH010958.MP4',
      toFile:
        RootDir +
        '/file_' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        '.MP4',
      background: true,
      discretionary: true,
      cacheable: true,
      begin: r => console.log('Downloading started', r),
      progress: r =>
        console.log('Downloading progress', r.bytesWritten / r.contentLength),
    });
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/turbo_transfer?p=0`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const downloadMedia = async url => {
    try {
      const response = await fetch(
        'http://10.5.5.9:8080/videos/DCIM/100GOPRO/GOPR0996.JPG',
      );

      const fileName = 'GOPR0996.JPG';
      const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;
      console.log('Fetch', path);
      await RNFS.write(path, 'blob', 1, 'base64');
      console.log('Media file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const __downloadMedia = _ => {
    downloadMedia();
    downloadFile();
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
      <Pressable onPress={downloadFile} style={styles.btn}>
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
