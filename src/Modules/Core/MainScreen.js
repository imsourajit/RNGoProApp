import React, {useEffect} from 'react';
import {
  Dimensions,
  Image,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RightArrowBox from './Components/RightArrowBox';

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
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        // PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
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

  const _openSessionDetailsPage = () => {
    props.navigation.navigate('SessionListsScreen');
  };
  const _openBatchesPage = () => {
    props.navigation.navigate('BatchesListScreen');
  };

  const goToBackUpScreen = _ => {
    props.navigation.navigate('BackupScreen');
  };

  return (
    <View style={styles.main}>
      <View style={styles.arrowBoxes}>
        <RightArrowBox
          pressed={_openSessionDetailsPage}
          btnTitle={'Sessions'}
        />
        <RightArrowBox pressed={_openBatchesPage} btnTitle={'Batches'} />
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

        <Pressable onPress={goToBackUpScreen}>
          <View style={styles.box}>
            <Text style={styles.btnTxt}>Upload</Text>
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
    marginVertical: 20,
  },
  btnTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionBtnBoxesTitle: {
    fontSize: 33,
    fontWeight: 'bold',
    color: '#000000',
  },
  goProImage: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
});

export default MainScreen;
