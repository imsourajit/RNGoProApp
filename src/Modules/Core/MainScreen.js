import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
import {useDispatch} from 'react-redux';
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

const deviceList = [
  {
    type: 'GO_PRO',
    label: 'GoPro',
  },
  {
    type: 'CAMERA',
    label: 'Camera',
  },
];

const MainScreen = props => {
  const dispatch = useDispatch();

  const [deviceSelectionPopup, setDeviceSelectionPopup] = useState(false);
  const [isConfirmationModalVisible, setConfirmationModalVisibility] =
    useState(false);

  const [device, selectedDevice] = useState(null);

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
    props.navigation.navigate('SessionListsScreen');
  };
  const _openBatchesPage = () => {
    props.navigation.navigate('BatchesListScreen');
  };

  const goToBackUpScreen = _ => {
    dispatch(setDownloadingProgressOfMedia(null));
    dispatch(setUploadingProgressOfMedia(null));
    props.navigation.navigate('SequentialBackupScreen');
  };

  const onPopupEvent = (eventName, index) => {
    if (eventName !== 'itemSelected') {
      return;
    }
    if (index == 1) {
      props.navigation.navigate('NetworkLogRequestsScreen');
      return;
    }
    onLogout();
  };

  const onLogout = () => {
    dispatch(logoutUser());
  };

  const openDeviceSelectionPopup = () => {
    setDeviceSelectionPopup(true);
  };

  const closeDeviceSelectionPopup = () => {
    setDeviceSelectionPopup(false);
  };

  const selectedItem = item => {
    selectedDevice(item);

    closeDeviceSelectionPopup();
    setConfirmationModalVisibility(true);
  };

  const onConfirm = () => {
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
    setConfirmationModalVisibility(false);
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
          onCancel={closeDeviceSelectionPopup}
        />
      </View>
      <View style={styles.subContainer}>
        <Image source={require('./Assets/logo.png')} style={styles.img} />
        <View style={styles.childContainer}>
          <PopupMenu
            actions={['Logout', 'Network Logs']}
            onPress={onPopupEvent}
          />
        </View>
      </View>
      <View style={styles.arrowBoxes}>
        {/*<RightArrowBox*/}
        {/*  pressed={_openSessionDetailsPage}*/}
        {/*  btnTitle={'Sessions'}*/}
        {/*/>*/}
        <RightArrowBox pressed={goToBackUpScreen} btnTitle={'Backup Files'} />

        <RightArrowBox pressed={_openBatchesPage} btnTitle={'Batches'} />
        <RightArrowBox
          pressed={_openSessionDetailsPage}
          btnTitle={'Session Listing'}
        />
      </View>

      <View style={styles.sessionBtnBoxes}>
        <Text style={styles.sessionBtnBoxesTitle}>Start Session</Text>

        <Image
          source={require('../GoPro/Assets/goPro.png')}
          style={styles.goProImage}
        />
        {/*<Pressable onPress={goToCamera}>*/}
        {/*  <View style={styles.box}>*/}
        {/*    <Text style={styles.btnTxt}>Camera</Text>*/}
        {/*  </View>*/}
        {/*</Pressable>*/}
        <Pressable onPress={goToGoPro}>
          <View style={styles.box}>
            <Text style={styles.btnTxt}>Go LIVE</Text>
          </View>
        </Pressable>

        <Text style={styles.txtStyles}>or</Text>

        <Pressable onPress={openDeviceSelectionPopup}>
          <View style={styles.box}>
            <Text style={styles.btnTxt}>Record Session</Text>
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
    justifyContent: 'space-between',
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
  subContainer: {alignItems: 'center', justifyContent: 'center'},
});

export default MainScreen;
