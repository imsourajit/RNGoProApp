import React, {useEffect, useState} from 'react';
import {Linking, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import BleManager from 'react-native-ble-manager';
import GoProImage from './Components/GoProImage';
import WifiControlBtn from './Components/CustomBtns/WifiControlBtns';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from './Utility/Constants';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {useDispatch} from 'react-redux';
import {setDownloadingProgress} from './Redux/GoPro10Actions';
import DownloadedMediaBox from './Components/DownloadedMediaBox';

const GoPro10 = props => {
  const [isScanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({
    ssid: '',
    password: '',
  });
  const [orderedMedia, setMedia] = useState([]);
  const [currentDownloads, setCurrentDownloads] = useState([]);

  const dispatch = useDispatch();

  const {id: deviceId, name} = connectedDevice;

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
          setConnectedDevice(d[0]);
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
      _getMediaListandDownload();
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
    setTimeout(() => {
      // console.log('Upload Process Started');
      // _startServerUploadProcess();
    }, 5000);
  };

  const _startServerUploadProcess = () => {
    for (let i = 0, uploadPromise = Promise.resolve(); i < 2; i++) {
      uploadPromise.then(() => {
        new Promise(resolve => {
          _getPreSignedUrlForGumlet(i, resolve);
        });
      });
    }
  };

  const _getMediaListandDownload = () => {
    fetch(`${GOPRO_BASE_URL}gopro/media/list`)
      .then(r => r.json())
      .then(r => {
        const [{fs, d}, ...rest] = r.media;
        console.log('Media List', r.media, fs);
        if (Array.isArray(fs)) {
          const orderedArray = _.orderBy(fs, ['mod'], ['desc']);
          setMedia(orderedArray);
          for (
            let i = 0, downloadPromise = Promise.resolve();
            i < orderedArray.length;
            i++
          ) {
            const date = new Date();
            const fileExif = date.getTime();
            downloadPromise.then(() => {
              new Promise(resolve => {
                const {config, fs} = RNFetchBlob;
                let RootDir = fs.dirs.PictureDir;
                RNFS.downloadFile({
                  fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${d}/${orderedArray[i].n}`,
                  toFile: RootDir + '/' + fileExif + orderedArray[i].n,
                  background: true,
                  discretionary: true,
                  cacheable: true,
                  begin: r => {
                    dispatch(
                      setDownloadingProgress({
                        name: orderedArray[i].n,
                        psuedoName: fileExif + orderedArray[i].n,
                        progress: 0,
                      }),
                    );
                  },
                  progress: r => {
                    const percentile = (r.bytesWritten / r.contentLength) * 100;
                    console.log(percentile);
                    if (i == 1 && percentile == 100) {
                      _turnOffTurboTransfer();
                    }

                    dispatch(
                      setDownloadingProgress({
                        name: orderedArray[i].n,
                        psuedoName: fileExif + orderedArray[i].n,
                        progress: percentile,
                      }),
                    );

                    if (percentile / 100 == 1) {
                      dispatch(setDownloadingProgress({}));
                    }
                  },
                });
                resolve();
              });
            });
          }
        }
      })
      .catch(e => console.log('Camera State error', e))
      .finally(() => {});
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

  const _getPreSignedUrlForGumlet = (index, parentResolve) => {
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

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data.upload_url);
        new Promise((resolve, reject) =>
          _uploadDownloadedFilesToGumlet(
            resolve,
            reject,
            response.data.upload_url,
            index,
            parentResolve,
          ),
        );
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const _uploadDownloadedFilesToGumlet = (
    resolve,
    reject,
    uploadUrl,
    index,
    parentResolve,
  ) => {
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('Upload success', index);
          resolve();
        } else {
          console.log('Upload failed', xhr);
          resolve();
        }
      }
      parentResolve();
    };
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        let percentComplete = (evt.loaded / evt.total) * 100;
        console.log('Percentage Complete onprogress', index, percentComplete);
      }
    };
    xhr.addEventListener('progress', evt => {
      if (evt.lengthComputable) {
        percentComplete = (evt.loaded / evt.total) * 100;
      }
      console.log('Percentage Complete', index, evt);
    });
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', 'video/mp4');
    xhr.send({
      uri: 'file://' + RootDir + '/' + orderedMedia[index].n,
      type: 'video/mp4',
      name: orderedMedia[index].n,
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
    <View style={styles.main}>
      <GoProImage name={name} id={deviceId} />
      <WifiControlBtn onPress={_connectHotspot} btnText={'Backup Media'} />
      <DownloadedMediaBox data={orderedMedia} />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDevice: {
    fontFamily: 'Roboto',
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
  },
});

export default GoPro10;
