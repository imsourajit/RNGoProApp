import {LiveStreamView} from '@api.video/react-native-livestream';
import React, {useEffect, useRef, useState} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import Orientation, {
  LANDSCAPE,
  OrientationLocker,
} from 'react-native-orientation-locker';
import {useIsFocused} from '@react-navigation/native';

const CameraAPI = () => {
  const ref = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const isFocused = useIsFocused();

  const styles = appStyles(streaming);

  const isProd = false;

  const BASE_URL = isProd
    ? 'https://ws.api.video'
    : 'https://sandbox.api.video';

  const API_KEY = isProd
    ? 'b4nYqEu0r4AAYx22BHddr5bAAXWpMVyQaytYfP33xui'
    : '3Nir7GCG0LrfUtZ7ELghM51iaOv0m7yU2vryHyaOKca';

  useEffect(() => {
    if (!isFocused) {
      Orientation.unlockAllOrientations();
    }
  }, [isFocused]);

  useEffect(() => {
    handleAuthApi();
  }, []);

  const handleAuthApi = async () => {
    const response = await fetch(BASE_URL + '/auth/api-key', {
      body: '{"apiKey": "b4nYqEu0r4AAYx22BHddr5bAAXWpMVyQaytYfP33xui"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const resJson = await response.json();
    setAccessToken(resJson.access_token);
    console.log(resJson);
  };

  const handleStream = async () => {
    const response = await fetch(BASE_URL + '/live-streams', {
      body: '{"record": true, "name": "My Live Stream","public": true}',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const resJSON = await response.json();
    console.log('@streamkey resp', resJSON);
    if (streaming) {
      ref.current?.stopStreaming();
      setStreaming(false);
    } else {
      ref.current?.startStreaming(resJSON.streamKey);
      setStreaming(true);
    }
    console.log(ref);
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar hidden={true} />
      <OrientationLocker
        orientation={LANDSCAPE}
        onChange={orientation => console.log('onChange', orientation)}
        onDeviceChange={orientation =>
          console.log('onDeviceChange', orientation)
        }
      />
      <LiveStreamView
        style={styles.livestreamView}
        ref={ref}
        camera="back"
        video={{
          fps: 30,
          resolution: '2160p',
          bitrate: 4 * 1024 * 1024, // # 2 Mbps
          orientation: 'landscape',
        }}
        audio={{
          bitrate: 128000,
          sampleRate: 44100,
          isStereo: true,
        }}
        isMuted={false}
        onConnectionSuccess={() => {
          //do what you want
          console.log('CONNECTED');
        }}
        onConnectionFailed={e => {
          //do what you want
          console.log('ERROR', e);
        }}
        onDisconnect={() => {
          //do what you want
          console.log('DISCONNECTED');
        }}
        enablePinchedZoom
      />

      <View style={buttonContainer({bottom: 40}).container}>
        <TouchableOpacity
          style={styles.streamingButton}
          onPress={handleStream}
        />
      </View>
    </View>
  );
};

const appStyles = streaming =>
  StyleSheet.create({
    appContainer: {
      flex: 1,
      alignItems: 'center',
    },
    livestreamView: {
      flex: 1,
      alignSelf: 'stretch',
    },
    streamingButton: {
      borderRadius: 50,
      backgroundColor: streaming ? 'red' : 'white',
      width: 50,
      height: 50,
    },
  });

const buttonContainer = params =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: params.top,
      bottom: params.bottom,
      left: params.left,
      right: params.right,
    },
  });

export default CameraAPI;
