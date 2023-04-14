/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
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
  setBytesRead,
  setCompletedUploading,
  setDownloadingProgressOfMedia,
  setETagForAssetId,
  setFilePath,
  setGoProMedia,
  setPartUploadUrl,
  setUploadingAssetId,
  setUploadingProgressOfMedia,
  uploadedCompletedFile,
} from './Redux/GoProActions';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {backgroundUpload} from 'react-native-compressor';
import DownloadAndUploadProgressBar from './Components/DownloadAndUploadProgressBar';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';
import {CAMERA_DIR} from './Utility/Constants';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import NoDevicesConnectedScreen from './Screens/NoDevicesConnectedScreen';
import {useIsFocused} from '@react-navigation/native';
import ConfirmModal from '../Core/Screens/ConfirmModal';
import {
  logClickEvent,
  logEvent,
  logLoadEvent,
} from '../../Services/AnalyticsTools';

let CHUNK_SIZE = 10 * 1024 * 1024;

const SequentialBackupScreen = props => {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [hotspotDetails, setHotspotDetails] = useState({});
  const [mediaList, setMediaList] = useState(null);
  const [downloadDirectory, setDownloadDirectory] = useState(null);

  const [isPopupVisibile, setPopupVisibility] = useState(false);

  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  const {media, scheduledSessions, uploadedChunkMedia} = useSelector(
    st => st.GoProReducer,
  );
  const {user: {userId} = {}} = useSelector(st => st.userReducer);

  const {ssid, password} = hotspotDetails;

  let parts = [];

  useEffect(() => {
    logLoadEvent('app_backup_screen');
  }, []);

  useEffect(() => {
    if (isPopupVisibile) {
      logLoadEvent('app_backup_popup');
    }
  }, [isPopupVisibile]);

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
          // setConnectedDevice({});
          // ToastAndroid.show(
          //   'GoPro device is not connected',
          //   ToastAndroid.CENTER,
          // );
        }
      })
      .catch(e => {
        console.log('Unable to get connected peripheral details');
      });
  }, [isFocused]);

  useEffect(() => {
    if (connectedDevice !== null) {
      getHotspotDetailToConnect();
    }
  }, [connectedDevice]);

  useEffect(() => {
    if (Array.isArray(media) && media.length) {
      _startBackupProcess(media, 0, 0);
    }
  }, [_startBackupProcess, media]);

  const _startBackupProcess = async (media, mediaIndex, listIndex) => {
    if (mediaIndex < media.length) {
      const {fs, d: goProDirectory} = media[mediaIndex];
      const listOfFiles = _.orderBy(fs, ['mod'], ['desc']);

      const fileName = listOfFiles[listIndex].n;
      const date = new Date();
      const fileNamePrefix = date.getTime();

      if (listIndex < listOfFiles.length) {
        try {
          await RNFS.downloadFile({
            fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${goProDirectory}/${fileName}`,
            toFile: APP_DIR + '/' + fileNamePrefix + fileName,
            background: true,
            discretionary: true,
            cacheable: true,
            progressInterval: 2000,
            begin: () => {
              console.log('Directory : ', goProDirectory, ' File : ', fileName);
              logLoadEvent('app_backup_progress', {
                progress: 0,
                type: 'download',
              });
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
        } catch (error) {
          logEvent('FrontEnd', 'app_backup_error', {
            error: JSON.stringify(error),
          });
        }
        logLoadEvent('app_backup_progress', {
          progress: 100,
          type: 'download',
        });
        dispatch(downloadedCompletedFile(fileName));
        dispatch(setDownloadingProgressOfMedia(null));
        _disableTurboTransfer();

        await WifiManager.disconnect();

        setTimeout(() => {
          startUploadingFile(
            media,
            mediaIndex,
            listIndex,
            APP_DIR + '/' + fileNamePrefix + fileName,
            fileName,
          );
        }, 6000);
      } else {
        //   Go to next directory
        _startBackupProcess(media, mediaIndex + 1, 0);
      }
    } else {
      ToastAndroid.show('Successfully backup completed', ToastAndroid.SHORT);
    }
  };

  const setMetaDataForGumlet = file => {
    if (!file) {
      return;
    }

    const {mod = new Date().getTime()} = file;

    const filteredArray = scheduledSessions.filter(itm => itm <= mod);

    if (filteredArray.length) {
      return filteredArray[0];
    }
    return {};
  };

  const getLastString = (str, delimiter) => {
    // Split the input string by the specified delimiter
    const arr = str.split(delimiter);

    // Return the last element of the array
    return arr[arr.length - 1];
  };

  const _getPreSignedUrlForGumlet = async (
    media,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    const currentFile = media[mediaIndex]?.fs[listIndex];

    return;
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
          ...setMetaDataForGumlet(currentFile),
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
              deleteFile(filePath);
              _connectAgainAndDownload(media, mediaIndex, listIndex);
            }
          },
        );
      })
      .catch(err => console.error(err));
  };

  const deleteFile = filepath => {
    RNFS.exists(filepath)
      .then(result => {
        if (result) {
          return RNFS.unlink(filepath)
            .then(() => {
              console.log('FILE DELETED');
            })
            .catch(err => {
              console.log(err.message);
            });
        }
      })
      .catch(err => {
        console.log(err.message);
      });
  };
  const _connectAgainAndDownload = async (media, mediaIndex, listIndex) => {
    await WifiManager.connectToProtectedSSID(ssid, password, false);
    _enableTurboTransfer();
    _startBackupProcess(media, mediaIndex, listIndex + 1);
  };

  const _enableTurboTransfer = async () => {
    try {
      await fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=1`);
    } catch (e) {
      console.log('camera state error', e);
    }
  };

  const _disableTurboTransfer = async () => {
    try {
      await fetch(`${GOPRO_BASE_URL}gopro/media/turbo_transfer?p=0`);
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
    await WifiManager.connectToProtectedSSID(ssid, password, true);
    setTimeout(() => {
      // _enableTurboTransfer();
      _getMediaListToDownloadAndUpload();
    }, 3000);
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

  const getFileSize = async filePath => {
    try {
      const fileDetails = await RNFetchBlob.fs.stat(filePath);
      return fileDetails.size;
    } catch (error) {
      ToastAndroid.show('Unable to get file details', ToastAndroid.BOTTOM);
    }
  };

  const getAssetId = async () => {
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
          // ...setMetaDataForGumlet(currentFile),
        },
      },
    };

    const resp = await axios.request(options);
    return resp.data.asset_id;
  };

  const getPreSignedUrlForUpload = async (assetId, partNumber) => {
    const {partDetails} = uploadedChunkMedia;

    if (partDetails !== undefined && partDetails.partNumber === partNumber) {
      console.log('PrevUrl');
      return partDetails?.signedUrl;
    }

    let chunkUploadsOptions = {
      method: 'GET',
      url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/${partNumber}/sign`,
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
      },
    };
    const preSignedUrlData = await axios.request(chunkUploadsOptions);
    dispatch(
      setPartUploadUrl({
        partNumber: partNumber,
        signedUrl: preSignedUrlData.data.part_upload_url,
      }),
    );
    return preSignedUrlData.data.part_upload_url;
  };

  const uploadChunkToGumlet = async (
    assetId,
    filePath,
    totalNoOfChunks,
    bytesRead,
    partNumber,
  ) => {
    const {eTag} = uploadedChunkMedia ?? {};

    if (totalNoOfChunks <= 0) {
      const multipartCompleteOptions = {
        method: 'POST',
        url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/complete`,
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
        },
        data: {
          parts: eTag ? [...eTag, ...parts] : parts,
        },
      };

      axios
        .request(multipartCompleteOptions)
        .then(res => {
          dispatch(setPartUploadUrl(undefined));
          dispatch(setCompletedUploading());
          dispatch(setUploadingProgressOfMedia(null));
          console.log('Upload Completed');
        })
        .catch(err => console.log('Multipart upload error', err));
      return;
    }

    const chunkData = await RNFS.read(
      filePath,
      CHUNK_SIZE,
      bytesRead,
      'base64',
    );
    console.log('partNumber', partNumber);
    dispatch(setBytesRead(bytesRead));

    bytesRead += CHUNK_SIZE;

    const chunkFilePath = APP_DIR + `/fc${new Date().getTime()}.MP4`;

    console.log('Chunkfilepath', chunkFilePath);
    await RNFS.writeFile(chunkFilePath, chunkData, 'base64');
    const preSignedUrl = await getPreSignedUrlForUpload(assetId, partNumber);

    RNFetchBlob.config({
      fileCache: false,
    });

    await RNFetchBlob.fetch(
      'PUT',
      preSignedUrl,
      {
        'Content-Type': 'video/mp4',
      },
      RNFetchBlob.wrap(chunkFilePath),
    )
      .uploadProgress({interval: 550}, (written, total) => {
        const uploadProgressPercentage =
          ((partNumber - 1 + written / total) /
            (totalNoOfChunks - 1 + partNumber)) *
          100;
        dispatch(
          setUploadingProgressOfMedia({
            fileName: getLastString(filePath, '/'),
            percentile: uploadProgressPercentage,
          }),
        );
        console.log('Upload Progress Percentage', uploadProgressPercentage);
      })
      .then(async res => {
        const eTagPart = {
          PartNumber: partNumber,
          ETag: res.respInfo.headers.ETag,
        };

        parts.push(eTagPart);

        dispatch(setETagForAssetId(eTagPart));
        deleteFile(chunkFilePath);
        await uploadChunkToGumlet(
          assetId,
          filePath,
          totalNoOfChunks - 1,
          bytesRead,
          partNumber + 1,
        );
      })
      .catch(err => console.log('Unable to upload chunk', err));
  };

  const chunkWiseUploadToGumlet = async filePath => {
    const fileSize = await getFileSize(filePath);
    const totalNoOfChunks = Math.ceil(fileSize / CHUNK_SIZE);
    const assetId = await getAssetId();
    dispatch(setUploadingAssetId(assetId));
    dispatch(setFilePath(filePath));
    logLoadEvent('app_backup_progress', {
      progress: 0,
      type: 'upload',
    });
    await uploadChunkToGumlet(assetId, filePath, totalNoOfChunks, 0, 1);
    return;
  };

  const checkIfAnyUploadingIsPending = async () => {
    const {eTag, assetId, filePath, bytesRead = 0} = uploadedChunkMedia ?? {};

    if (connectedDevice == null) {
      setPopupVisibility(true);
      return;
    }

    console.log(
      'eTag, assetId, filePath, bytesRead',
      eTag,
      assetId,
      filePath,
      bytesRead,
    );

    if (assetId) {
      const fileSize = await getFileSize(filePath);
      const totalNoOfChunks = Math.ceil(fileSize / CHUNK_SIZE);
      await uploadChunkToGumlet(
        assetId,
        filePath,
        totalNoOfChunks - eTag.length,
        eTag.length * CHUNK_SIZE,
        eTag.length + 1,
      );
    } else {
      // takeBackupOfFiles();
      await chunkWiseUploadToGumlet(APP_DIR + '/' + 'ls.MP4');
    }
  };

  const startUploadingFile = async (
    media,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    await chunkWiseUploadToGumlet(filePath);
    logLoadEvent('app_backup_progress', {
      progress: 100,
      type: 'upload',
    });
    _connectAgainAndDownload(media, mediaIndex, listIndex);
  };

  const fetchVideosFromGallery = async () => {
    try {
      const galleryPath = CAMERA_DIR;
      const files = await RNFS.readDir(galleryPath);
      const ff = await RNFS.readDir(files[1].path);
      console.log('Fetched videos from gallery:', files);
      const videos = ff.filter(
        file => file.isFile() && file.name.endsWith('.mp4'),
      );
      await chunkWiseUploadToGumlet(videos.reverse()[0].path);
      console.log(
        'Fetched videos from gallery:',
        videos.reverse(),
        new Date(videos.reverse()[0].mtime).getTime(),
      );
      // You can now use the 'videos' array to access and display the videos
    } catch (error) {
      console.error('Error fetching videos from gallery:', error);
    }
  };

  const pickVideo = async () => {
    const options = {
      mediaType: 'video', // Only pick videos
      videoQuality: 'high', // Set video quality (high, medium, low)
      selectionLimit: 0,
    };

    const {eTag, assetId, filePath, bytesRead = 0} = uploadedChunkMedia ?? {};

    // if (connectedDevice == null) {
    //   setPopupVisibility(true);
    //   return;
    // }

    console.log(
      'eTag, assetId, filePath, bytesRead',
      eTag,
      assetId,
      filePath,
      bytesRead,
    );

    if (assetId) {
      const fileSize = await getFileSize(filePath);
      const totalNoOfChunks = Math.ceil(fileSize / CHUNK_SIZE);
      ToastAndroid.show(
        'Please wait there is pending upload',
        ToastAndroid.CENTER,
      );
      await uploadChunkToGumlet(
        assetId,
        filePath,
        totalNoOfChunks - eTag.length,
        eTag.length * CHUNK_SIZE,
        eTag.length + 1,
      );
      return;
    }

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.error) {
        console.log('Error while picking video:', response.error);
      } else {
        if (Array.isArray(response?.assets) && response?.assets?.length) {
          uploadSelectedAssetsToGumlet(response?.assets, 0);
        } else {
          ToastAndroid.show('Oops! Something went wrong!', ToastAndroid.BOTTOM);
        }

        // await Promise.all(
        //   response.assets.map(
        //     async item =>
        //       await chunkWiseUploadToGumlet(item.uri.replace('file://', '')),
        //   ),
        // );
        // Handle selected video here
        // console.log('Selected video:', response);
        // You can access the video file path using response.path
      }
    });
  };

  const uploadSelectedAssetsToGumlet = async (assets, assetIndex) => {
    if (assetIndex >= assets.length) {
      ToastAndroid.show(
        'Selected videos backup completed successfully',
        ToastAndroid.CENTER,
      );
      return;
    } else {
      await chunkWiseUploadToGumlet(
        assets[assetIndex].uri.replace('file://', ''),
      );
      await uploadSelectedAssetsToGumlet(assets, assetIndex + 1);
    }
  };

  const onConfirm = () => {
    logClickEvent('app_backup_popup_action', {
      action: 'confirm',
    });
    setPopupVisibility(false);
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.gopro.smarty',
    );

    props.navigation.goBack();
  };

  const onCancel = () => {
    logClickEvent('app_backup_popup_action', {
      action: 'cancel',
    });
    setPopupVisibility(false);
  };

  return (
    <View style={styles.container}>
      <ConfirmModal
        visible={isPopupVisibile}
        message="Please connect gopro and comeback"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <View style={{marginHorizontal: 16}}>
        <GoProDeviceDetails
          deviceDetails={hotspotDetails}
          id={connectedDevice?.id}
        />
      </View>
      <View
        style={{
          marginHorizontal: 16,
          marginVertical: 20,
        }}>
        <DownloadAndUploadProgressBar />
      </View>

      {/*<Pressable onPress={takeBackupOfFiles}>*/}
      {/*  <View style={styles.btn}>*/}
      {/*    <Text style={styles.btnTxt}>Back up</Text>*/}
      {/*  </View>*/}
      {/*</Pressable>*/}
      <View style={styles.sessionBtnBoxes}>
        <Text style={styles.sessionBtnBoxesTitle}>Backup Files</Text>

        <Image
          source={require('./Assets/goPro.png')}
          style={styles.goProImage}
        />

        <Pressable
          onPress={() => {
            logClickEvent('app_backup_click', {
              type: 'gopro',
            });
            checkIfAnyUploadingIsPending();
          }}>
          <View style={styles.box}>
            <Text style={[styles.btnTxt, {fontSize: 18}]}>Take Backup</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            // checkIfAnyUploadingIsPending();
            logClickEvent('app_backup_click', {
              type: 'gallery',
            });
            pickVideo();
          }}>
          <View style={styles.box}>
            <Text style={[styles.btnTxt, {fontSize: 18}]}>
              Take Backup from Gallery
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'space-between',
  },
  btn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
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
    width: 300,
    height: 200,
    resizeMode: 'cover',
  },
});

export default SequentialBackupScreen;
