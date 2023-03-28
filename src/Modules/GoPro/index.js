import React, {useEffect, useState} from 'react';
import {
  Dimensions,
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
import {APP_DIR, GOPRO_BASE_URL} from './Utility/Constants';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDirectoryNameToDownload,
  storeGoProMediaFilesListLocally,
} from './Redux/GoProActions';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import QRCode from 'react-native-qrcode-svg';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';

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

  const testFFmpegCompression = _ => {
    // let RootDir = APP_DIR;
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = function () {
    //   if (xhr.readyState === 4) {
    //     if (xhr.status === 200) {
    //       console.log('Upload success');
    //     }
    //   }
    // };
    // xhr.upload.onprogress = function (evt) {
    //   if (evt.lengthComputable) {
    //     let percentComplete = (evt.loaded / evt.total) * 100;
    //     console.log('P co', percentComplete);
    //   }
    // };
    // xhr.open(
    //   'PUT',
    //   'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/641067b292827199f9781323/origin-641067b292827199f9781323?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230314%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230314T122523Z&X-Amz-Expires=3600&X-Amz-Signature=94fdd4bbd5ccc473969152cddc310c396f431a160178ed2bb4f4a2914f52a310&X-Amz-SignedHeaders=host&x-id=PutObject',
    // );
    // xhr.setRequestHeader('Content-Type', 'video/mp4');
    // xhr.send({
    //   uri: 'file://${APP_DIR}/jil2.MP4',
    //   type: 'video/mp4',
    //   name: 'jil.MP4',
    // });

    FFmpegKit.executeAsync(
      `-i file://${APP_DIR}/jil.MP4 -c:v mpeg4 file://${APP_DIR}/jil2.MP4`,
      async session => {
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log('Success Log');

          let RootDir = APP_DIR;
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                console.log('Upload success');
              }
            }
          };
          // xhr.upload.onprogress = function (evt) {
          //   if (evt.lengthComputable) {
          //     let percentComplete = (evt.loaded / evt.total) * 100;
          //     console.log('P co', percentComplete);
          //   }
          // };
          xhr.open(
            'PUT',
            'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/641067b292827199f9781323/origin-641067b292827199f9781323?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230314%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230314T122523Z&X-Amz-Expires=3600&X-Amz-Signature=94fdd4bbd5ccc473969152cddc310c396f431a160178ed2bb4f4a2914f52a310&X-Amz-SignedHeaders=host&x-id=PutObject',
          );
          xhr.setRequestHeader('Content-Type', 'video/mp4');
          xhr.send({
            uri: 'file://${APP_DIR}/jil2.MP4',
            type: 'video/mp4',
            name: 'jil.MP4',
          });
          // SUCCESS
        } else if (ReturnCode.isCancel(returnCode)) {
          // CANCEL
          console.log('Cancel Log');
        } else {
          // ERROR
          console.log('Error Log');
        }
      },
    );
  };

  // const testCompress = async () => {
  //   try {
  //     const dstUrl = await Video.compress(
  //       'file://' + APP_DIR + '/jil.MP4',
  //       {
  //         compressionMethod: 'auto',
  //         minimumFileSizeForCompress: 0,
  //         // maxSize: 1080,
  //       },
  //       progress => {
  //         console.log('Compression Progress: ', progress);
  //       },
  //     );
  //     console.log({dstUrl}, 'compression result');
  //
  //     const uploadResult = await backgroundUpload(
  //       'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/6410749e92827199f9782828/origin-6410749e92827199f9782828?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230314%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230314T132031Z&X-Amz-Expires=3600&X-Amz-Signature=54b1f46f8ce3618f5faf1f0f7b0d14a310e2f8fc8d94fc472859da1048cff46f&X-Amz-SignedHeaders=host&x-id=PutObject',
  //       dstUrl,
  //       {
  //         httpMethod: 'PUT',
  //         headers: {
  //           'Content-Type': 'video/mp4',
  //         },
  //       },
  //       (written, total) => {
  //         console.log(written, total);
  //       },
  //     );
  //
  //     let RootDir = APP_DIR;
  //     const xhr = new XMLHttpRequest();
  //     xhr.onreadystatechange = function () {
  //       if (xhr.readyState === 4) {
  //         if (xhr.status === 200) {
  //           console.log('Upload success');
  //         }
  //       }
  //     };
  //     // xhr.upload.onprogress = function (evt) {
  //     //   if (evt.lengthComputable) {
  //     //     let percentComplete = (evt.loaded / evt.total) * 100;
  //     //     console.log('P co', percentComplete);
  //     //   }
  //     // };
  //     xhr.open(
  //       'PUT',
  //       'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/6410707892827199f9781f03/origin-6410707892827199f9781f03?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230314%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230314T130248Z&X-Amz-Expires=3600&X-Amz-Signature=e19cf26153ade1861943f1fb9c81a581204b6422ba531c51b32402fcb80a641e&X-Amz-SignedHeaders=host&x-id=PutObject',
  //     );
  //     xhr.setRequestHeader('Content-Type', 'video/mp4');
  //     xhr.send({
  //       uri: dstUrl,
  //       type: 'video/mp4',
  //       name: 'jil.MP4',
  //     });
  //   } catch (error) {
  //     console.log({error}, 'compression error');
  //   }
  // };

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
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            // marginVertical: 60,
            backgroundColor: '#FFFFFF',
            padding: 20,
          }}>
          <QRCode
            value='!MRTMP="rtmp://broadcast.api.video/s/aade8f26-2ed7-4250-8beb-312475042e1f"'
            size={Dimensions.get('window').width - 200}
          />
          <View
            style={{
              margin: 50,
              backgroundColor: '#000000',
            }}
          />
          <QRCode
            value="oW1mVr1080!W!GLC"
            size={Dimensions.get('window').width - 200}
          />
        </View>
      </View>
      {/*<CustomBtn*/}
      {/*  data={''}*/}
      {/*  onPress={_scanForFootagesToUploadToServer}*/}
      {/*  btnTxt={'Scan for footages to upload'}*/}
      {/*/>*/}
      {/*{!isDownloading && !isUploading ? (*/}
      {/*  <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 100}}>*/}
      {/*    <CustomBtn*/}
      {/*      data={''}*/}
      {/*      onPress={_sessionFilesBackup}*/}
      {/*      btnTxt={'Take Backup'}*/}
      {/*    />*/}
      {/*  </View>*/}
      {/*) : null}*/}
      {/*{isDownloading ? (*/}
      {/*  <DownloadMediaSection startUploadingProcess={_startUploadingProcess} />*/}
      {/*) : null}*/}
      {/*{isUploading ? (*/}
      {/*  <UploadMediaSection completeUploadProcess={_completeUploadProcess} />*/}
      {/*) : null}*/}
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
