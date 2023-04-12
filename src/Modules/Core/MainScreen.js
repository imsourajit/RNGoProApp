import React, {useEffect} from 'react';
import {
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

const MainScreen = props => {
  const dispatch = useDispatch();

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
        err => {
          ToastAndroid.show(
            'Unable to fetch scheduled sessions',
            ToastAndroid.CENTER,
          );
        },
      ),
    );
  }, []);

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
    const {CameraModule} = NativeModules;
    console.log('__MUNNA__', NativeModules);
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

  return (
    <View style={styles.main}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={require('./Assets/logo.png')}
          style={{
            width: 180,
            height: 50,
            marginTop: 20,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 20,
            bottom: 10,
          }}>
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

        <Text
          style={{
            color: '#000000',
            fontSize: 20,
            fontWeight: 'bold',
            marginVertical: 10,
          }}>
          or
        </Text>

        <Pressable onPress={goToGoProToRecordSession}>
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
});

export default MainScreen;
