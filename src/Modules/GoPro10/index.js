import React, {useEffect, useState} from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import GoProImage from './Components/GoProImage';
import WifiControlBtn from './Components/CustomBtns/WifiControlBtns';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from './Utility/Constants';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDownloadCompletedMedia,
  setDownloadingProgress,
  setUploadedCompletedMedia,
  setUploadingProgress,
} from './Redux/GoPro10Actions';
import DownloadedMediaBox from './Components/DownloadedMediaBox';
import UploadedMediaBox from './Components/UploadedMediaBox';

const GoPro10 = props => {
  const [isScanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({
    ssid: '',
    password: '',
  });
  const [orderedMedia, setMedia] = useState([]);
  const [currentDownloads, setCurrentDownloads] = useState([]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useDispatch();

  const {id: deviceId, name, deviceName} = connectedDevice;

  const downloadedMedia = useSelector(st => st.GoPro10Reducer.downloadedMedia);

  useEffect(() => {
    _scanAndConnectToGoPro();
  }, []);

  /**
   * Scan for connected Go Pro device
   * @param _
   * @private
   */
  const _scanAndConnectToGoPro = _ => {
    try {
      BleManager.scan([], 5, true)
        .then(devices => {
          console.log('Scanning for go pro device', devices);
        })
        .catch(err => console.log(err));

      BleManager.getConnectedPeripherals([]).then(d => {
        console.log('Scanned devices', d);

        if (Array.isArray(d) && d.length) {
          const ssid = BleManager.read(
            d[0].id,
            'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
            'b5f90002-aa8d-11e3-9046-0002a5d5c51b',
          );
          setConnectedDevice({
            ...d[0],
            deviceName: String.fromCharCode(...ssid),
          });
        }

        console.log('Connected go pro device details', d[0].id);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const _connectHotspot = async _ => {
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

      console.log('Hotspot details', {
        ssid: String.fromCharCode(...ssid),
        password: String.fromCharCode(...password),
      });

      await WifiManager.connectToProtectedSSID(
        String.fromCharCode(...ssid),
        String.fromCharCode(...password),
        false,
      );
      _turnOnTurboTransfer();
      _downloadMediaFromGoPro();
    } catch (e) {
      console.log('Error connecting hotspot', e);
      ToastAndroid.show('Something went wrong', ToastAndroid.CENTER);
    }
  };

  const _turnOnTurboTransfer = _ => {
    fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=1`)
      .then(r => {
        ToastAndroid.show('Turbotransfer on', ToastAndroid.CENTER);
      })
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _turnOffTurboTransfer = async () => {
    fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=0`)
      .then(r => {
        ToastAndroid.show('Turbotransfer off', ToastAndroid.CENTER);
      })
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
    await WifiManager.disconnect();
    setIsDownloading(false);
    setIsUploading(true);
    setTimeout(() => {
      console.log('Upload Process Started');

      _startServerUploadProcess();
    }, 5000);
  };

  const _downloadSingleFile = async (orderedArray, index, directoryName) => {
    const date = new Date();
    const fileNamePrefix = date.getTime();
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    await RNFS.downloadFile({
      fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${directoryName}/${orderedArray[index].n}`,
      toFile: RootDir + '/' + fileNamePrefix + orderedArray[index].n,
      background: true,
      discretionary: true,
      cacheable: true,
      begin: r => {
        dispatch(
          setDownloadingProgress({
            name: orderedArray[index].n,
            psuedoName: fileNamePrefix + orderedArray[index].n,
            progress: 0,
            index: index,
          }),
        );
      },
      progress: r => {
        const percentile = (r.bytesWritten / r.contentLength) * 100;
        // console.log(percentile, index);

        dispatch(
          setDownloadingProgress({
            name: orderedArray[index].n,
            psuedoName: fileNamePrefix + orderedArray[index].n,
            progress: percentile,
            index: index,
          }),
        );

        if (percentile / 100 == 1) {
          dispatch(setDownloadingProgress({}));
          dispatch(
            setDownloadCompletedMedia({
              name: orderedArray[index].n,
              psuedoName: fileNamePrefix + orderedArray[index].n,
              index: index,
            }),
          );
        }
      },
    }).promise;
    if (index < orderedArray.length - 1) {
      await _downloadSingleFile(orderedArray, index + 1, directoryName);
    } else {
      _turnOffTurboTransfer();
    }
  };

  const _downloadMediaFromGoPro = async () => {
    try {
      const mediaJson = await fetch(`${GOPRO_BASE_URL}gopro/media/list`);
      const res = await mediaJson.json();
      const [{fs, d}, ...rest] = res.media;

      if (Array.isArray(fs)) {
        const orderedArray = _.orderBy(fs, ['mod'], ['desc']);
        setMedia(orderedArray);
        setIsDownloading(true);
        _downloadSingleFile(orderedArray, 0, d);
      } else {
        ToastAndroid.show('No media files found', ToastAndroid.CENTER);
      }
    } catch (e) {
      ToastAndroid.show('Something went wrong', ToastAndroid.CENTER);
    }
  };

  const uploadBegin = response => {
    let jobId = response.jobId;
    console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
  };

  const uploadProgress = response => {
    let percentage = Math.floor(
      (response.totalBytesSent / response.totalBytesExpectedToSend) * 100,
    );
    console.log('UPLOAD IS ' + percentage + '% DONE!');
  };

  const getBlob = async fileUri => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const _startServerUploadProcess = () => {
    // TODO : DownloadedMedia should be the thing thar are not present in uploadedmedia
    _getPreSignedUrlForGumlet(downloadedMedia, 0);

    for (let i = 0, uploadPromise = Promise.resolve(); i < 2; i++) {
      uploadPromise.then(() => {
        new Promise(resolve => {
          _getPreSignedUrlForGumlet(i, resolve);
        });
      });
    }
  };

  const _getPreSignedUrlForGumlet = (downloadedMedia, index) => {
    const options = {
      method: 'POST',
      url: 'https://api.gumlet.com/v1/video/assets/upload',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
      },
      data: {collection_id: '63fe06f5b4ade3692e1bb407', format: 'HLS'},
    };

    if (index < downloadedMedia.length) {
      axios
        .request(options)
        .then(function (response) {
          new Promise((resolve, reject) =>
            _uploadDownloadedFilesToGumlet(
              response.data.upload_url,
              downloadedMedia,
              index,
            ),
          );
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      setIsUploading(false);
      ToastAndroid.show('Successfully uploaded', ToastAndroid.CENTER);
    }
  };

  const _uploadDownloadedFilesToGumlet = (
    uploadUrl,
    downloadedMedia,
    index,
  ) => {
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          dispatch(
            setUploadedCompletedMedia({
              name: downloadedMedia[index].n,
              psuedoName: downloadedMedia.psuedoName,
              index: index,
            }),
          );
          console.log('Upload success', index);
        } else {
          console.log('Upload failed', xhr);
        }
        _getPreSignedUrlForGumlet(downloadedMedia, index + 1);
      }
    };
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        let percentComplete = (evt.loaded / evt.total) * 100;
        dispatch(
          setUploadingProgress({
            name: downloadedMedia[index].n,
            psuedoName: downloadedMedia.psuedoName,
            progress: percentComplete,
            index: index,
          }),
        );
        dispatch(
          setUploadedCompletedMedia({
            name: downloadedMedia[index].n,
            psuedoName: downloadedMedia.psuedoName,
            index: index,
          }),
        );
        console.log('Percentage Complete onprogress', index, percentComplete);
      }
    };
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', 'video/mp4');
    xhr.send({
      uri: 'file://' + RootDir + '/' + downloadedMedia[index].psuedoName,
      type: 'video/mp4',
      name: downloadedMedia[index].psuedoName,
    });
  };

  const _openGoProApp = () => {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.gopro.smarty',
    );
  };

  if (!deviceId) {
    return (
      <View style={styles.main}>
        <Text style={styles.noDevice}>
          No device connected. Please connect device using GoPro Quik App
        </Text>
        <WifiControlBtn onPress={_openGoProApp} btnText={'Open Go Pro App'} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.main}>
      <GoProImage name={deviceName} id={deviceId} />
      <WifiControlBtn onPress={_connectHotspot} btnText={'Backup Media'} />
      {isDownloading ? <DownloadedMediaBox data={orderedMedia} /> : null}
      {isUploading ? <UploadedMediaBox data={downloadedMedia} /> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  noDevice: {
    fontFamily: 'Roboto',
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
  },
});

export default GoPro10;
