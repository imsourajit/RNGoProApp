import React, {useEffect, useRef, useState} from 'react';
import {
  NativeAppEventEmitter,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from './Utility/Constants';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDirectoryNameToDownload,
  setLastSessionDetails,
  storeGoProMediaFilesListLocally,
} from './Redux/GoProActions';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import QRBoxes from './Components/QRBoxes';
import {
  getSessionIdToTagInLiveVideo,
  tagLiveUrlsToSession,
} from '../CameraAPI/Redux/CameraApiActions';

const isProd = false;

const BASE_URL = isProd ? 'https://ws.api.video' : 'https://sandbox.api.video';

const API_KEY = isProd
  ? 'b4nYqEu0r4AAYx22BHddr5bAAXWpMVyQaytYfP33xui'
  : '3Nir7GCG0LrfUtZ7ELghM51iaOv0m7yU2vryHyaOKca';

const getTwoDigits = digit => (digit >= 10 ? digit : '0' + digit);

const GoProRecordScreen = props => {
  const [devicesConnected, setDevicesConnected] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({});

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLastReached, setQRFlatListReachedEnd] = useState(false);
  const [isGeneratingQR, setGeneratingQR] = useState(true);

  const dispatch = useDispatch();
  const {mediaList, downloadedMediaList, downloadedDirName, uploadedMediaList} =
    useSelector(st => st.GoProReducer);

  const {
    user: {userId},
  } = useSelector(st => st.userReducer);

  const {sessionDetails} = useSelector(st => st.GoProReducer);

  const qrCodeFlatListRef = useRef(null);
  let currentRefIndex = useRef(null).current;

  const [QR_CODE_ARR, setQRCodeArr] = useState([]);

  // const QR_CODE_ARR = [
  //   '!MRTMP="rtmp://broadcast.api.video/s/aade8f26-2ed7-4250-8beb-312475042e1f"',
  //   'oW1mVr1080!W!GLC',
  // ];

  let sessionStartedTime = '';

  if (sessionDetails !== null) {
    const date = new Date(sessionDetails.startTime);
    sessionStartedTime =
      getTwoDigits(date.getHours() % 12 || 12) +
      ' : ' +
      getTwoDigits(date.getMinutes()) +
      ' ' +
      (date.getHours() > 12 ? 'pm' : 'am');
  }

  useEffect(() => {
    dispatch(
      getSessionIdToTagInLiveVideo(
        {
          batchId: props.route.params.batchId,
          coachId: userId,
        },
        res => {
          dispatch(setLastSessionDetails(res));
          setGeneratingQR(false);
          setQRCodeArr(['mVr1080p60fSq1oR1CSL01']);
        },
        err =>
          ToastAndroid.show(
            'Oops!!! Something went wrong.',
            ToastAndroid.CENTER,
          ),
      ),
    );
  }, []);

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

  const _scrollToNextItem = () => {
    currentRefIndex = 1;
    if (Math.abs(QR_CODE_ARR.length - currentRefIndex) === 1) {
      setQRFlatListReachedEnd(true);
    }
    if (currentRefIndex < QR_CODE_ARR.length) {
      qrCodeFlatListRef && qrCodeFlatListRef.current.scrollToIndex({index: 1});
      currentRefIndex++;
    }
  };

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
    8;
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

  const _renderQRImages = ({item, index}) => {
    return (
      <QRBoxes
        qrCommand={item}
        isLastIndex={QR_CODE_ARR.length - 1 === index}
        position={index + 1}
        toRecord={true}
      />
    );
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

  const handleAuthApi = async sessionId => {
    setGeneratingQR(true);
    const response = await fetch(BASE_URL + '/auth/api-key', {
      body: '{"apiKey": "' + API_KEY + '"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const resJson = await response.json();
    const response2nd = await fetch(BASE_URL + '/live-streams', {
      body: '{"record": true, "name": "My Live Stream","public": true}',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + resJson.access_token,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const streamDetailsJSON = await response2nd.json();
    dispatch(
      tagLiveUrlsToSession(
        {
          sessionId: sessionId,
          liveStreamUrl: streamDetailsJSON?.assets?.hls,
          ...streamDetailsJSON,
        },
        res => {
          setQRCodeArr([
            `!MRTMP="rtmp://broadcast.api.video/s/${streamDetailsJSON.streamKey}"`,
            'oW1mVr1080!W!GLC',
          ]);
        },
        err => {
          ToastAndroid.show(
            'Oops!!! Something went wrong',
            ToastAndroid.CENTER,
          );
        },
      ),
    );

    setGeneratingQR(false);
  };

  return (
    <View style={styles.main}>
      <GoProDeviceDetails
        deviceDetails={hotspotDetails}
        id={devicesConnected.id}
      />
      <View
        style={{
          flex: 1,
          marginTop: 40,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 32,
            color: '#FFFFFF',
            textAlign: 'center',
          }}>
          Session Has started at {'\n'}
          <Text
            style={{
              color: 'red',
            }}>
            {sessionStartedTime} {'\n'}
          </Text>
          Please start recording on the GoPro
        </Text>
        {/*{isGeneratingQR ? (*/}
        {/*  <ActivityIndicator size={'large'} color={'#FFFFFF'} />*/}
        {/*) : (*/}
        {/*  <FlatList*/}
        {/*    ref={qrCodeFlatListRef}*/}
        {/*    data={QR_CODE_ARR}*/}
        {/*    renderItem={_renderQRImages}*/}
        {/*    // keyExtractor={item => item.toString()}*/}
        {/*    horizontal={true}*/}
        {/*    scrollEnabled={false}*/}
        {/*    showsHorizontalScrollIndicator={false}*/}
        {/*    showsVerticalScrollIndicator={false}*/}
        {/*    style={{*/}
        {/*      // backgroundColor: 'red',*/}
        {/*      height: 400,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
});

export default GoProRecordScreen;
