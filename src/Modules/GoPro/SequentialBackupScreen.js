import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {APP_DIR, GOPRO_BASE_URL} from './Utility/Constants';
import BleManager from 'react-native-ble-manager';
import {useDispatch, useSelector} from 'react-redux';
import {
  downloadedCompletedFile,
  setDownloadingProgressOfMedia,
  setGoProMedia,
  setUploadingProgressOfMedia,
  uploadedCompletedFile,
} from './Redux/GoProActions';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {backgroundUpload} from 'react-native-compressor';

const SequentialBackupScreen = () => {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [hotspotDetails, setHotspotDetails] = useState({});
  const [mediaList, setMediaList] = useState(null);
  const [downloadDirectory, setDownloadDirectory] = useState(null);

  const dispatch = useDispatch();
  const {media} = useSelector(st => st.GoProReducer);
  const {user: {userId} = {}} = useSelector(st => st.userReducer);

  const {ssid, password} = hotspotDetails;

  useEffect(() => {
    BleManager.enableBluetooth();
    BleManager.getConnectedPeripherals([])
      .then(pArr => {
        const goProDevices = pArr.filter(device =>
          device?.name?.includes('GoPro'),
        );

        if (goProDevices.length) {
          setConnectedDevice(goProDevices[0]);
        } else {
          setConnectedDevice({});
          ToastAndroid.show(
            'GoPro device is not connected',
            ToastAndroid.CENTER,
          );
        }
      })
      .catch(e => {
        console.log('Unable to get connected peripheral details');
      });
  }, []);

  useEffect(() => {
    if (connectedDevice !== null) {
      getHotspotDetailToConnect();
    }
  }, [connectedDevice]);

  // useEffect(() => {
  //   if (Array.isArray(mediaList)) {
  //     startBackupProcess();
  //   }
  // }, [mediaList]);
  //

  useEffect(() => {
    if (Array.isArray(media) && media.length) {
      _startBackupProcess(media, 0, 0);
    }
  }, [media]);

  const _startBackupProcess = async (media, mediaIndex, listIndex) => {
    if (mediaIndex < media.length) {
      const {fs: listOfFiles, d: goProDirectory} = media[mediaIndex];

      const fileName = listOfFiles[listIndex].n;
      const date = new Date();
      const fileNamePrefix = date.getTime();

      if (listIndex < listOfFiles.length) {
        await RNFS.downloadFile({
          fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${goProDirectory}/${fileName}`,
          toFile: APP_DIR + '/' + fileNamePrefix + fileName,
          background: true,
          discretionary: true,
          cacheable: true,
          progressInterval: 2000,
          begin: r => {
            console.log('Directory : ', goProDirectory, ' File : ', fileName);
            dispatch(
              setDownloadingProgressOfMedia({
                fileName: fileName,
                percentile: 0,
              }),
            );
          },
          progress: r => {
            const percentile = (r.bytesWritten / r.contentLength) * 100;
            // console.log(percentile, index, r.bytesWritten, r.contentLength);
            console.log(
              'Directory : ',
              goProDirectory,
              ' File : ',
              fileName,
              percentile,
            );
            dispatch(
              setDownloadingProgressOfMedia({
                fileName: fileName,
                percentile: percentile,
              }),
            );
          },
        }).promise;
        dispatch(downloadedCompletedFile(fileName));
        dispatch(setDownloadingProgressOfMedia(null));
        _startUploadingProcess(
          media,
          mediaIndex,
          listIndex,
          APP_DIR + '/' + fileNamePrefix + fileName,
          fileName,
        );
      } else {
        //   Go to next directory
        _startBackupProcess(media, mediaIndex + 1, 0);
      }
    } else {
      ToastAndroid.show('Successfully backup completed', ToastAndroid.SHORT);
    }
  };

  const _startUploadingProcess = async (
    media,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    await WifiManager.disconnect();

    setTimeout(() => {
      _getPreSignedUrlForGumlet(
        media,
        mediaIndex,
        listIndex,
        filePath,
        fileName,
      );
    }, 5000);
  };

  const _getPreSignedUrlForGumlet = async (
    media,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    const options = {
      method: 'POST',
      url: 'https://api.gumlet.com/v1/video/assets/upload',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
      },
      data: {
        collection_id: '63fe06f5b4ade3692e1bb407',
        format: 'HLS',
        metadata: {
          userId: userId ?? 'Anonymous',
        },
      },
    };
    dispatch(
      setUploadingProgressOfMedia({
        fileName: fileName,
        percentile: 0,
      }),
    );
    axios
      .request(options)
      .then(async resp => {
        const signedUrl = resp.data.upload_url;
        await backgroundUpload(
          signedUrl,
          filePath,
          {
            httpMethod: 'PUT',
            headers: {
              'Content-Type': 'video/mp4',
            },
          },
          (written, total) => {
            console.log('Uploading ', filePath, written, total);
            dispatch(
              setUploadingProgressOfMedia({
                fileName: fileName,
                percentile: (written / total) * 100,
              }),
            );

            if (written == total) {
              dispatch(setUploadingProgressOfMedia(null));
              dispatch(uploadedCompletedFile(fileName));
              _connectAgainAndDownload(media, mediaIndex, listIndex);
            }
          },
        );
      })
      .catch(err => console.error(err));
  };

  const _connectAgainAndDownload = async (media, mediaIndex, listIndex) => {
    await WifiManager.connectToProtectedSSID(ssid, password, false);
    _enableTurboTransfer();
    _startBackupProcess(media, mediaIndex, listIndex + 1);
  };

  const _startDownloadFromGoPro = async index => {
    if (mediaList.length <= index) {
      return;
    }
    const date = new Date();
    const fileNamePrefix = date.getTime();
  };

  const _enableTurboTransfer = async () => {
    try {
      await fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=1`);
    } catch (e) {
      console.log('camera state error', e);
    }
  };
  const getHotspotDetailToConnect = async () => {
    const deviceId = connectedDevice.id;
    try {
      await BleManager.connect(deviceId);
      await BleManager.retrieveServices(deviceId, []);
      const _ssid = await BleManager.read(
        deviceId,
        'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        'b5f90002-aa8d-11e3-9046-0002a5d5c51b',
      );

      const _password = await BleManager.read(
        deviceId,
        'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        'b5f90003-aa8d-11e3-9046-0002a5d5c51b',
      );

      setHotspotDetails({
        ssid: String.fromCharCode(..._ssid),
        password: String.fromCharCode(..._password),
      });
    } catch (e) {
      console.log('Unable to get hotspot details', e);
    }
  };

  const takeBackupOfFiles = () => {
    connectToWifiAndGetMediaLists();
  };

  const connectToWifiAndGetMediaLists = async () => {
    // let list = await WifiManager.reScanAndLoadWifiList();
    // await WifiManager.disconnect();
    await WifiManager.connectToProtectedSSID(ssid, password, true);
    _enableTurboTransfer();
    _getMediaListToDownloadAndUpload();
  };

  const _getMediaListToDownloadAndUpload = async () => {
    try {
      const mediaJson = await fetch(`${GOPRO_BASE_URL}gopro/media/list`);
      const res = await mediaJson.json();
      const [{fs, d}, ...rest] = res.media;
      if (Array.isArray(res.media) && res.media.length) {
        dispatch(setGoProMedia(res.media));
        // const orderedArray = _.orderBy(fs, ['mod'], ['desc']);
        // setMediaList(orderedArray);
        console.log('Media list', res.media);
      } else {
        ToastAndroid.show('No media files found', ToastAndroid.CENTER);
      }
    } catch (e) {
      console.log('Unable to get media list', e);
    }
  };

  if (connectedDevice == null && !Object.keys(hotspotDetails).length) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} color={'#FFFFFF'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={takeBackupOfFiles}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>Back up</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
  },
  btn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
  },
  btnTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default SequentialBackupScreen;
