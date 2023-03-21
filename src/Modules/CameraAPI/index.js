import {LiveStreamView} from '@api.video/react-native-livestream';
import React, {useEffect, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Orientation, {
  LANDSCAPE,
  OrientationLocker,
} from 'react-native-orientation-locker';
import {useIsFocused} from '@react-navigation/native';
import LiveTimer from './Components/LiveTimer';
import {useDispatch, useSelector} from 'react-redux';
import {
  getSessionIdToTagInLiveVideo,
  setLiveTime,
  tagLiveUrlsToSession,
} from './Redux/CameraApiActions';

const CameraAPI = props => {
  const ref = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const {
    user: {userId},
  } = useSelector(st => st.userReducer);

  const styles = appStyles(streaming);

  const isProd = false;

  const BASE_URL = isProd
    ? 'https://ws.api.video'
    : 'https://sandbox.api.video';

  const API_KEY = isProd
    ? 'b4nYqEu0r4AAYx22BHddr5bAAXWpMVyQaytYfP33xui'
    : '3Nir7GCG0LrfUtZ7ELghM51iaOv0m7yU2vryHyaOKca';

  useEffect(() => {
    if (isFocused) {
      Orientation.lockToLandscape();
    }
    return () => {
      dispatch(setLiveTime(0));
      Orientation.lockToPortrait();
    };
  }, [isFocused]);

  useEffect(() => {
    dispatch(
      getSessionIdToTagInLiveVideo(
        {
          batchId: props.route.params.batchId,
          coachId: userId,
        },
        res => {
          setSessionDetails(res);
        },
        err => console.log(err),
      ),
    );
  }, []);

  useEffect(() => {
    handleAuthApi();
  }, []);

  const handleAuthApi = async () => {
    const response = await fetch(BASE_URL + '/auth/api-key', {
      body: '{"apiKey": "' + API_KEY + '"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const resJson = await response.json();
    setAccessToken(resJson.access_token);
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
    if (streaming) {
      ref.current?.stopStreaming();
      setStreaming(false);
      props.navigation.goBack();
    } else {
      dispatch(setLiveTime(0));
      ref.current?.startStreaming(resJSON.streamKey);
      setStreaming(true);
      dispatch(
        tagLiveUrlsToSession(
          {
            sessionId: sessionDetails.id,
            liveStreamUrl: resJSON.assets.hls,
            thumbnail: resJSON.assets.thumbnail,
          },
          res => console.log('Session Details updated', res),
          err => console.log('Session update failed', err),
        ),
      );
    }
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

      <View
        style={[
          buttonContainer({top: 20}).container,
          {backgroundColor: 'red'},
        ]}>
        <LiveTimer toStart={streaming} />
      </View>

      <View
        style={[
          buttonContainer({bottom: 40}).container,
          {backgroundColor: 'red'},
        ]}>
        <TouchableOpacity style={styles.streamingButton} onPress={handleStream}>
          <Text style={styles.btnTxt}>
            {!streaming ? 'Go Live' : 'End Session'}
          </Text>
        </TouchableOpacity>
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
      borderRadius: 5,
      backgroundColor: streaming ? 'red' : 'white',
      padding: 10,
      // width: ,
      // height: 50,
    },
    btnTxt: {
      color: streaming ? 'white' : 'black',
      fontSize: 16,
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
