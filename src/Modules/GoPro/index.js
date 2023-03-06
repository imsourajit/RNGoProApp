import React, {useEffect, useState} from 'react';
import {
  NativeAppEventEmitter,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import NoDevicesConnectedScreen from './Screens/NoDevicesConnectedScreen';
import CustomBtn from './Components/CustomBtn';
import WifiManager from 'react-native-wifi-reborn';
import {APP_DIR, GOPRO_BASE_URL} from './Utility/Constants';
import DownloadMediaSection from './Components/DownloadMediaSection';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDirectoryNameToDownload,
  storeGoProMediaFilesListLocally,
} from './Redux/GoProActions';
import UploadMediaSection from './Components/UploadMediaSection';
import Upload from 'react-native-background-upload';

const GoPro = props => {
  const [devicesConnected, setDevicesConnected] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({});

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useDispatch();
  const {mediaList, downloadedMediaList, downloadedDirName, uploadedMediaList} =
    useSelector(st => st.GoProReducer);

  useEffect(() => {
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
    }
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

  const checkForPendingUploads = () => {
    let yetFileToUpload = [];
    downloadedMediaList.map((item, index) => {
      const isDefined = _.find(downloadedMediaList, obj => obj.n == item.n);
      if (isDefined == undefined) {
        yetFileToUpload.push(item);
      }
    });
    setFilesToDownload(yetFileToUpload);
  };

  const _startUploadingProcess = async () => {
    _setTurboTransfer(0);
    await WifiManager.disconnect();
    setTimeout(() => {
      setIsDownloading(false);
      setIsUploading(true);
    }, 5000);
  };

  // Start download process
  const _startDownloadingProcess = () => {
    _getMediaList();

    // 1. Set Reducer that download has started
    // 2. Get all the downloaded files of this session
    // 3. Get the progress of downloding files
  };

  // Turn hotspot and connect to gopro
  const _goProHttpConnection = async () => {
    console.log('Hotspot details', hotspotDetails);

    await WifiManager.connectToProtectedSSID(
      hotspotDetails.ssid,
      hotspotDetails.password,
      false,
    );
    _setTurboTransfer(1); //Turn on turbo transfer for faster download
    _startDownloadingProcess();
  };

  const _setTurboTransfer = flag => {
    fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=${flag}`)
      .then(r => {
        ToastAndroid.show('Turbotransfer on', ToastAndroid.CENTER);
      })
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _sessionFilesBackup = async () => {
    await _goProHttpConnection();
  };

  const _completeUploadProcess = () => {
    setIsUploading(false);
    ToastAndroid.show('Backup completed', ToastAndroid.CENTER);
  };

  const testForUpload = _ => {
    const options = {
      url: 'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/6405df0502583615ede9e74f/origin-6405df0502583615ede9e74f?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230306%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230306T123934Z&X-Amz-Expires=3600&X-Amz-Signature=18815efcec41ff99a7bfc6c2212bc5c59f066bb62f8a95497f0c04ec5cfaa1d3&X-Amz-SignedHeaders=host&x-id=PutObject',
      path: APP_DIR + '/m.MP4',
      method: 'PUT',
      type: 'multipart',
      maxRetries: 2, // set retry count (Android only). Default 2
      headers: {
        'content-type': 'application/json',
      },
      notification: {
        enabled: true,
      },
      useUtf8Charset: true,
    };

    const {startUpload} = Upload;

    startUpload(options)
      .then(uploadId => {
        console.log('Upload started');
        Upload.addListener('progress', uploadId, data => {
          console.log(`Progress: ${data.progress}%`);
        });
        Upload.addListener('error', uploadId, data => {
          console.log(`Error: ${data.error}%`);
        });
        Upload.addListener('cancelled', uploadId, data => {
          console.log('Cancelled!');
        });
        Upload.addListener('completed', uploadId, data => {
          // data includes responseCode: number and responseBody: Object
          console.log('Completed!');
        });
      })
      .catch(err => {
        console.log('Upload error!', err);
      });
  };

  if (!Object.keys(devicesConnected).length) {
    return <NoDevicesConnectedScreen />;
  }

  return (
    <View style={styles.main}>
      <Text>Device Connected: {devicesConnected.name}</Text>
      <CustomBtn data={''} onPress={testForUpload} btnTxt={'Take Backup'} />
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
  },
});

export default GoPro;
