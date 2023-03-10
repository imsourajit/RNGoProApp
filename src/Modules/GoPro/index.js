import React, {useEffect, useState} from 'react';
import {
  NativeAppEventEmitter,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ToastAndroid,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import NoDevicesConnectedScreen from './Screens/NoDevicesConnectedScreen';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from './Utility/Constants';
import DownloadMediaSection from './Components/DownloadMediaSection';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDirectoryNameToDownload,
  storeGoProMediaFilesListLocally,
} from './Redux/GoProActions';
import UploadMediaSection from './Components/UploadMediaSection';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import CustomBtn from './Components/CustomBtn';
import QRCode from 'react-native-qrcode-svg';

const GoPro = props => {
  const [devicesConnected, setDevicesConnected] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({});

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useDispatch();
  const {mediaList, downloadedMediaList, downloadedDirName, uploadedMediaList} =
    useSelector(st => st.GoProReducer);

  useEffect(() => {
    async function GetAllPermissions() {
      try {
        if (Platform.OS === 'android') {
          const userResponse = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ]);
          return userResponse;
        }
      } catch (err) {
        // Warning(err);
      }
    }

    GetAllPermissions();
  }, []);

  useEffect(() => {
    const subscribe = NativeAppEventEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      data => {
        console.log(data);
      },
    );

    return subscribe && subscribe.remove();
  }, []);

  useEffect(() => {
    const enableAndStartBluetooth = () => {
      BleManager.enableBluetooth();
      BleManager.start({showAlert: true, forceLegacy: true}).then(() => {
        console.log('Module initialized');
      });
    };
    enableAndStartBluetooth();
  }, []);

  useEffect(() => {
    const startScanningBluetoothDevices = () => {
      BleManager.scan([], 5, false).then(devices => {
        console.log('Scan started', devices);
      });
    };
    startScanningBluetoothDevices();
  }, []);

  useEffect(() => {
    BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
      let goProDevices = peripheralsArray.filter(peripheral =>
        peripheral.name.includes('GoPro'),
      );
      if (goProDevices.length) {
        setDevicesConnected(goProDevices[0]);
      }
    });
  }, []);

  useEffect(() => {
    // Get GoPro Name and Password for wifi connection
    const getHotspotDetails = async _ => {
      const deviceId = devicesConnected.id;
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

        setHotspotDetails({
          ssid: String.fromCharCode(...ssid),
          password: String.fromCharCode(...password),
        });
      } catch (e) {
        console.log('Oops!!! Unable to fetch device hotspot details', e);
      }
    };

    if (Object.keys(devicesConnected).length) {
      getHotspotDetails();
    }
  }, [devicesConnected]);

  const _getMediaList = async () => {
    try {
      const mediaJson = await fetch(`${GOPRO_BASE_URL}gopro/media/list`);
      const res = await mediaJson.json();
      const [{fs, d}, ...rest] = res.media;
      if (Array.isArray(fs) && fs.length) {
        const orderedArray = _.orderBy(fs, ['mod'], ['desc']);
        dispatch(storeGoProMediaFilesListLocally(orderedArray));
        dispatch(setDirectoryNameToDownload(d));
        setIsDownloading(true);
      } else {
        ToastAndroid.show('No media files found', ToastAndroid.CENTER);
      }
    } catch (e) {
      console.log('Unable to fetch media', e);
    }
  };

  // const checkForPendingUploads = () => {
  //   let yetFileToUpload = [];
  //   downloadedMediaList.map((item, index) => {
  //     const isDefined = _.find(downloadedMediaList, obj => obj.n == item.n);
  //     if (isDefined == undefined) {
  //       yetFileToUpload.push(item);
  //     }
  //   });
  //   setFilesToDownload(yetFileToUpload);
  // };

  const _startUploadingProcess = async () => {
    // await _setTurboTransfer(0);
    await WifiManager.disconnect();
    setTimeout(() => {
      setIsDownloading(false);
      setIsUploading(true);
    }, 5000);
  };

  // Start download process
  const _startDownloadingProcess = () => {
    _getMediaList();
  };

  // Turn hotspot and connect to gopro
  const _goProHttpConnection = async () => {
    console.log('Hotspot details', hotspotDetails);

    await WifiManager.connectToProtectedSSID(
      hotspotDetails.ssid,
      hotspotDetails.password,
      false,
    );
    // await _setTurboTransfer(1); //Turn on turbo transfer for faster download
    _startDownloadingProcess();
  };

  const _setTurboTransfer = async flag => {
    await fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=${flag}`);
    ToastAndroid.show(`Turbo transfer ${flag ? 'off' : 'on'}`);
  };

  const _sessionFilesBackup = async () => {
    await _goProHttpConnection();
  };

  const _completeUploadProcess = () => {
    setIsUploading(false);
    ToastAndroid.show('Backup completed', ToastAndroid.CENTER);
  };

  // To make sure on load the take backup button should be visible even if there are pending uploads
  const _scanForFootagesToUploadToServer = () => {
    let yetToUploadFiles = [];

    downloadedMediaList.map((item, index) => {
      const isDefined = _.find(uploadedMediaList, obj => obj.n == item.n);
      if (isDefined == undefined) {
        yetToUploadFiles.push(item);
      }
    });

    if (yetToUploadFiles.length) {
      setIsDownloading(false);
      setIsUploading(true);
    } else {
      ToastAndroid.show('No media files found to upload', ToastAndroid.CENTER);
    }
  };

  if (!Object.keys(devicesConnected).length) {
    return <NoDevicesConnectedScreen />;
  }

  return (
    <View style={styles.main}>
      <GoProDeviceDetails
        deviceDetails={hotspotDetails}
        id={devicesConnected.id}
      />
      <View
        style={{marginVertical: 60, backgroundColor: '#FFFFFF', padding: 30}}>
        <QRCode value="oW1mVr1080!W!GLC" size={200} />
      </View>
      <CustomBtn
        data={''}
        onPress={_scanForFootagesToUploadToServer}
        btnTxt={'Scan for footages to upload'}
      />
      {!isDownloading && !isUploading ? (
        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 100}}>
          <CustomBtn
            data={''}
            onPress={_sessionFilesBackup}
            btnTxt={'Take Backup'}
          />
        </View>
      ) : null}
      {isDownloading ? (
        <DownloadMediaSection startUploadingProcess={_startUploadingProcess} />
      ) : null}
      {isUploading ? (
        <UploadMediaSection completeUploadProcess={_completeUploadProcess} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#141414',
  },
});

export default GoPro;
