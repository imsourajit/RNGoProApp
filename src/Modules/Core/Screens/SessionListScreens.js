import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {listSessionsByCoachId} from '../Redux/UserActions';
import BleManager from 'react-native-ble-manager';
import NoDevicesConnectedScreen from '../../GoPro/Screens/NoDevicesConnectedScreen';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from '../../GoPro/Utility/Constants';
import RightArrowBoxesWithDescription from '../Components/RightArrowBoxesWithDescription';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';
import {isEmpty} from 'lodash';

const SessionListScreens = props => {
  const [sessionsList, setSessionsList] = useState([]);
  const [isHotspotConnected, setHotspotConnection] = useState(false);

  const [isDeviceConnected, setDeviceConnected] = useState(null);

  const dispatch = useDispatch();

  function getDayMonthNameFromMillis(millis) {
    const date = new Date(millis);
    const day = date.toLocaleString('en-US', {day: '2-digit'});
    const month = date.toLocaleString('en-US', {month: 'long'});
    return `${day} ${month}`;
  }

  useEffect(() => {
    const backAction = () => {
      logClickEvent('app_back', {
        screen: 'session',
        type: 'soft',
      });
      props.navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    logLoadEvent('app_session_screen');
  }, []);

  useEffect(() => {
    dispatch(
      listSessionsByCoachId(
        {
          startTime: new Date().getTime(),
          start: 0,
          size: 20,
        },
        suc => {
          setSessionsList(suc.filter(itm => itm.liveStreamUrl !== null));
        },
        err =>
          ToastAndroid.show('Oops!! Something went wrong', ToastAndroid.SHORT),
      ),
    );
  }, []);

  // useEffect(() => {
  //   //connect GoPro Hotspot
  //   _connectToHotspot();
  // }, []);
  //
  // useEffect(() => {
  //   if (isDeviceConnected) {
  //     _getDeviceDetailsAndConnectHotspot()
  //       .then(r => {})
  //       .catch(e => {});
  //   }
  // }, [isDeviceConnected]);
  //
  // useEffect(() => {
  //   _setTurboTransfer(1);
  //
  //   setTimeout(() => {
  //     _getMediaList().then().catch();
  //   }, 5000);
  //
  //   if (isHotspotConnected) {
  //   }
  // }, [isHotspotConnected]);

  const _getMediaList = async () => {
    try {
      const mediaJson = await fetch(`${GOPRO_BASE_URL}gopro/media/list`);
      const res = await mediaJson.json();
      // const [{fs, d}, ...rest] = res.media;
      console.log(res);
    } catch (e) {
      console.log('Unable to fetch media list', e);
    }
  };

  const _connectToHotspot = () => {
    _enableAndStartBluetooth()
      .then(() => {
        BleManager.getConnectedPeripherals([])
          .then(peripheralsArr => {
            let goProDevices = peripheralsArr.filter(peripheral =>
              peripheral.name.includes('GoPro'),
            );
            if (goProDevices.length) {
              setDeviceConnected(goProDevices[0]);
            }
          })
          .catch(e => console.log('Unable to get connected peripherals'));
      })
      .catch(e => console.log('Unable to enable bluetooth', e));
  };

  const _enableAndStartBluetooth = async () => {
    await BleManager.enableBluetooth();
    await BleManager.start({showAlert: true, forceLegacy: true}).then(() => {
      console.log('Module initialized');
    });
  };

  const _getDeviceDetailsAndConnectHotspot = async () => {
    const deviceId = isDeviceConnected.id;

    try {
      await BleManager.connect(deviceId);
      await BleManager.retrieveServices(deviceId, []);
      const ssid = await BleManager.read(
        deviceId,
        'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        'b5f90002-aa8d-11e3-9046-0002a5d5c51b',
      );

      const password = await BleManager.read(
        deviceId,
        'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        'b5f90003-aa8d-11e3-9046-0002a5d5c51b',
      );

      // await BleManager.write(
      //   deviceId,
      //   'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
      //   'b5f90004-aa8d-11e3-9046-0002a5d5c51b',
      //   [0x03, 0x17, 0x01, 0x01],
      // );

      console.log(
        String.fromCharCode(...ssid),
        String.fromCharCode(...password),
      );

      await WifiManager.connectToProtectedSSID(
        String.fromCharCode(...ssid).trim(),
        String.fromCharCode(...password).trim(),
        false,
      );
      setHotspotConnection(true);
    } catch (e) {
      console.log('Unable to fetch bluetooth details');
    }
  };

  const _setTurboTransfer = flag => {
    fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=${flag}`)
      .then(r => {
        ToastAndroid.show('Turbotransfer on', ToastAndroid.CENTER);
      })
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _goToSessionWebview = url => {
    if (isEmpty(url)) {
      ToastAndroid.show('unable to find the session url');
      return;
    }

    logClickEvent('app_session_select', {
      url,
    });
    try {
      Linking.openURL(url);
    } catch (error) {
      ToastAndroid.show('unable to find the session url');
    }
  };

  const _renderListOfSessions = ({item, index}) => {
    return (
      <RightArrowBoxesWithDescription
        pressed={_goToSessionWebview}
        btnTitle={getDayMonthNameFromMillis(item.startTime)}
        btnDesc={item.centreTitle ?? ''}
        data={item.liveStreamUrl}
      />
    );
  };

  // if (isDeviceConnected == null) {
  //   return <NoDevicesConnectedScreen />;
  // }

  if (Array.isArray(sessionsList) && !sessionsList.length) {
    return (
      <View
        style={{
          backgroundColor: '#000000',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size={'large'} color={'#FFFFFF'} />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
          }}>
          Please wait while we fetch all sessions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <FlatList
        data={sessionsList}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.startTime.toString() + index}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
});

export default SessionListScreens;
