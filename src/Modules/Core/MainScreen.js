import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import RightArrowBox from './Components/RightArrowBox';
import PopupMenu from './Components/PopupMenu';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from './Redux/UserActions';
import {
  getScheduledSessions,
  setDownloadingProgressOfMedia,
  setScheduledSessions,
  setUploadingProgressOfMedia,
} from '../GoPro/Redux/GoProActions';
import RNFS from 'react-native-fs';
import {getFreeSpaceInGB} from '../../Utility/helpers';
import SelectionPopupModal from './Screens/SelectionPopupModal';
import ConfirmModal from './Screens/ConfirmModal';
import {logClickEvent, logLoadEvent} from '../../Services/AnalyticsTools';
import AnalyticsServices from '../../Services/AnalyticsTools/AnalyticsService';
import {btnBgColor} from '../../Config';

const deviceList = [
  {
    type: 'GO_PRO',
    label: 'GoPro',
    analytics: 'gopro',
  },
  {
    type: 'CAMERA',
    label: 'Camera',
    analytics: 'camera',
  },
];

const MainScreen = props => {
  const dispatch = useDispatch();

  const [deviceSelectionPopup, setDeviceSelectionPopup] = useState(false);
  const [isConfirmationModalVisible, setConfirmationModalVisibility] =
    useState(false);

  const {
    user: {firstName},
  } = useSelector(st => st.userReducer);

  const [device, selectedDevice] = useState(null);

  useEffect(() => {
    if (deviceSelectionPopup) {
      logLoadEvent('app_record_popup');
    }
  }, [deviceSelectionPopup]);

  useEffect(() => {
    if (isConfirmationModalVisible) {
      logLoadEvent('app_record_confirm_popup');
    }
  }, [isConfirmationModalVisible]);

  useEffect(() => {
    logLoadEvent('app_screen_open', {});
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    dispatch(
      getScheduledSessions(
        {
          startTime: new Date().getTime(),
          size: 20,
          start: 0,
        },
        resp => {
          console.log(resp);
          dispatch(setScheduledSessions(resp));
        },
        () => {
          ToastAndroid.show(
            'Unable to fetch scheduled sessions',
            ToastAndroid.CENTER,
          );
        },
      ),
    );
  }, [dispatch]);

  const requestCameraPermission = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        // PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        // PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    } catch (err) {
      console.warn(err);
    }
  };

  const goToCamera = () => {
    props.navigation.navigate('BatchSelectionScreen', {
      selectedDevice: 'CAMERA',
    });
  };

  const goToGoPro = () => {
    props.navigation.navigate('BatchSelectionScreen', {
      selectedDevice: 'GO_PRO',
    });
  };

  const goToGoProToRecordSession = () => {
    console.log(getFreeSpaceInGB());
    const {CameraModule} = NativeModules;

    NativeModules.CameraModule.openCamera();
    // props.navigation.navigate('BatchSelectionScreen', {
    //   selectedDevice: 'GO_PRO',
    //   toRecord: true,
    // });
  };

  const _openSessionDetailsPage = () => {
    logClickEvent('app_session');
    props.navigation.navigate('SessionListsScreen');
  };
  const _openBatchesPage = () => {
    logClickEvent('app_batch');
    props.navigation.navigate('BatchesListScreen');
  };

  const goToBackUpScreen = _ => {
    logClickEvent('app_backup', {});
    dispatch(setDownloadingProgressOfMedia(null));
    dispatch(setUploadingProgressOfMedia(null));
    props.navigation.navigate('SequentialBackupScreen');
  };

  const onPopupEvent = (eventName, index) => {
    if (eventName !== 'itemSelected') {
      return;
    }

    switch (index) {
      case 0:
        logClickEvent('app_support_click', {
          screen: 'home',
        });
        try {
          Linking.openURL(
            'https://api.whatsapp.com/send/?phone=%2B919987840055&text=Hello%2C+I+am+reaching+you+out+from+the+FC.ONE+App',
          );
        } catch (error) {
          ToastAndroid.show('Unable to find whatsapp in your phone');
        }
        break;
      case 1:
        logClickEvent('app_logout');
        onLogout();
        break;
      case 2:
        props.navigation.navigate('NetworkLogRequestsScreen');
        break;
    }
  };

  const onLogout = () => {
    dispatch(logoutUser());
  };

  const openDeviceSelectionPopup = () => {
    logClickEvent('app_record');
    setDeviceSelectionPopup(true);
  };

  const onCancelPress = () => {
    logClickEvent('app_record_popup_action', {
      action: 'cancel',
    });
    closeDeviceSelectionPopup();
  };

  const closeDeviceSelectionPopup = () => {
    setDeviceSelectionPopup(false);
  };

  const selectedItem = item => {
    selectedDevice(item);

    logClickEvent('app_record_popup_action', {
      action: item?.analytics ?? '',
    });

    closeDeviceSelectionPopup();
    setConfirmationModalVisibility(true);
  };

  const onConfirm = () => {
    // logClickEvent('app_record_confirm_popup_action', {
    //   action: 'confirm',
    // });

    // closeDeviceSelectionPopup();
    // setConfirmationModalVisibility(false);
    switch (device.type) {
      case 'GO_PRO': {
        goToGoPro();
        break;
      }
      case 'CAMERA': {
        goToCamera();
        break;
      }
    }
  };

  const onCancel = () => {
    logClickEvent('app_record_confirm_popup_action', {
      action: 'cancel',
    });
    setConfirmationModalVisibility(false);
  };

  const startGoProRecording = () => {
    selectedItem(deviceList[0]);
    // setTimeout()
    // setConfirmationModalVisibility(true);
  };

  return (
    <View style={styles.main}>
      <View>
        <ConfirmModal
          visible={isConfirmationModalVisible}
          message="Shall we proceed to start recording"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
        <SelectionPopupModal
          visible={deviceSelectionPopup}
          data={deviceList}
          onSelect={selectedItem}
          onCancel={onCancelPress}
        />
      </View>
      <View style={styles.subContainer}>
        <Image source={require('./Assets/logo.png')} style={styles.img} />
        <View style={styles.childContainer}>
          <PopupMenu
            actions={['Support', 'Logout', 'Network Logs']}
            onPress={onPopupEvent}
          />
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 16,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
          marginBottom: 20,
        }}>
        <Text style={styles.fullName}>Hey {firstName}</Text>
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          flex: 1,
          // backgroundColor: 'red',
        }}>
        <View style={styles.arrowBoxes}>
          <RightArrowBox pressed={goToBackUpScreen} btnTitle={'Cloud Backup'} />

          <RightArrowBox pressed={_openBatchesPage} btnTitle={'Batches'} />
          <RightArrowBox
            pressed={_openSessionDetailsPage}
            btnTitle={'Sessions'}
          />
        </View>

        <View style={styles.sessionBtnBoxes}>
          <Text style={styles.sessionBtnBoxesTitle}>Start Session</Text>

          <Image
            source={require('../GoPro/Assets/goPro.png')}
            style={styles.goProImage}
          />

          <Pressable onPress={goToGoPro}>
            <View style={styles.box}>
              <Text style={styles.btnTxt}>Record Session</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#000000',
    flex: 1,
    // justifyContent: 'space-between',
  },
  arrowBoxes: {
    paddingHorizontal: 32,
  },
  txtStyles: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  sessionBtnBoxes: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    alignItems: 'center',
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
    width: Dimensions.get('window').width - 120,
    // height: 100,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    padding: 10,
    // marginVertical: 20,
  },
  btnTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionBtnBoxesTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  goProImage: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
  },
  childContainer: {
    position: 'absolute',
    right: 20,
    bottom: 10,
  },
  img: {
    width: 180,
    height: 50,
    marginTop: 20,
  },
  subContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fullName: {
    fontSize: 24,
    color: btnBgColor,
    fontWeight: '500',
    justifyContent: 'center',
  },
});

export default MainScreen;
