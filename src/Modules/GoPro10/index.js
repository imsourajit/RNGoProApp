import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, ToastAndroid, View} from 'react-native';
import BleManager from 'react-native-ble-manager';
import GoProImage from './Components/GoProImage';
import WifiControlBtn from './Components/CustomBtns/WifiControlBtns';
import WifiManager from 'react-native-wifi-reborn';
import {GOPRO_BASE_URL} from './Utility/Constants';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';

const GoPro10 = props => {
  const [isScanning, setScanning] = useState(false);
  const [{id: deviceId, name}, setConnectedDevice] = useState({});
  const [hotspotDetails, setHotspotDetails] = useState({
    ssid: '',
    password: '',
  });
  const [orderedMedia, setMedia] = useState([]);
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
      await WifiManager.connectToProtectedSSID(
        String.fromCharCode(...ssid),
        String.fromCharCode(...password),
        false,
      );
      _turnOnTurboTransfer();
      _getMediaListandDownload();
    } catch (e) {
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
          for (let i = 0, downloadPromise = Promise.resolve(); i < 1; i++) {
            downloadPromise.then(() => {
              new Promise(resolve => {
                const {config, fs} = RNFetchBlob;
                let RootDir = fs.dirs.PictureDir;
                RNFS.downloadFile({
                  fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${d}/${orderedArray[i].n}`,
                  toFile: RootDir + '/gg_' + orderedArray[i].n,
                  background: true,
                  discretionary: true,
                  cacheable: true,
                  begin: r => console.log('Downloading started', r),
                  progress: r =>
                    console.log(
                      'Downloading progress',
                      (r.bytesWritten / r.contentLength) * 100,
                    ),
                });
                resolve();
              });
            });
          }
          _turnOffTurboTransfer();
        }
      })
      .catch(e => console.log('Camera State error', e));
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

  const _getPreSignedUrlForGumlet = _ => {
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
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const _uploadDownloadedFilesToGumlet = async _ => {
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('Upload success');
        } else {
          console.log('Upload failed', xhr);
        }
      }
    };
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        let percentComplete = (evt.loaded / evt.total) * 100;
        console.log('Percentage Complete onprogress', percentComplete);
      }
    };
    xhr.addEventListener('progress', evt => {
      if (evt.lengthComputable) {
        percentComplete = (evt.loaded / evt.total) * 100;
      }
      console.log('Percentage Complete', evt);
    });
    xhr.open(
      'PUT',
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63ff39035f5f1d24bbbc82f2/origin-63ff39035f5f1d24bbbc82f2?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230301%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230301T113740Z&X-Amz-Expires=3600&X-Amz-Signature=e338d789f0c2d2dc270eb26175f9aa739c0f59376b2e390fd1f81772543148fc&X-Amz-SignedHeaders=host&x-id=PutObject',
    );
    xhr.setRequestHeader('Content-Type', 'video/mp4');
    xhr.send({
      uri: 'file://' + RootDir + '/gg_GX011078.MP4',
      type: 'video/mp4',
      name: 'GX011078',
    });
  };

  if (!deviceId && false) {
    return (
      <View style={styles.main}>
        <Text style={styles.noDevice}>
          No device connected. Please connect device using GoPro Quik App
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <GoProImage name={name} id={deviceId} />
      <WifiControlBtn onPress={_connectHotspot} />
      <WifiControlBtn onPress={_getPreSignedUrlForGumlet} />
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
