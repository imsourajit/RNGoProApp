/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  AppState,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {APP_DIR, CAMERA_DIR, GOPRO_BASE_URL} from './Utility/Constants';
import BleManager from 'react-native-ble-manager';
import {useDispatch, useSelector} from 'react-redux';
import {
  downloadedCompletedFile,
  setBytesRead,
  setCompletedUploading,
  setCurrentBackFile,
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
import {
  backgroundUpload,
  getRealPath,
  Video,
  generateFilePath,
} from 'react-native-compressor';
import DownloadAndUploadProgressBar from './Components/DownloadAndUploadProgressBar';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import RNFetchBlob from 'rn-fetch-blob';
import _, {result, set} from 'lodash';
import {launchImageLibrary} from 'react-native-image-picker';
import {useIsFocused} from '@react-navigation/native';
import ConfirmModal from '../Core/Screens/ConfirmModal';
import {
  logClickEvent,
  logEvent,
  logLoadEvent,
} from '../../Services/AnalyticsTools';
import DocumentPicker from '@imsourajit/react-native-document-picker';

import Upload from 'react-native-background-upload';
var Buffer = require('@craftzdog/react-native-buffer').Buffer;

let CHUNK_SIZE = 10 * 1024 * 1024;

const SequentialBackupScreen = props => {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [hotspotDetails, setHotspotDetails] = useState({});
  const [mediaList, setMediaList] = useState(null);
  const [downloadDirectory, setDownloadDirectory] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  const [isPopupVisibile, setPopupVisibility] = useState(false);

  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  const {media, scheduledSessions, uploadedChunkMedia} = useSelector(
    st => st.GoProReducer,
  );

  const {
    eTag: localETag = [],
    assetId: localAssetId,
    filePath: localFilePath,
    bytesRead: localBytesRead = 0,
    size: localFileSize,
  } = uploadedChunkMedia ?? {};
  const {user: {userId} = {}} = useSelector(st => st.userReducer);

  const {ssid, password} = hotspotDetails;

  let parts = [];

  useEffect(() => {
    const backAction = () => {
      logClickEvent('app_back', {
        screen: 'backup',
        type: 'soft',
      });
      props.navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    logLoadEvent('app_backup_screen');
  }, []);

  useEffect(() => {
    if (isPopupVisibile) {
      logLoadEvent('app_backup_popup');
    }
  }, [isPopupVisibile]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = nextAppState => {
    console.log(nextAppState);

    if (nextAppState == 'active') {
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
    }
    setAppState(nextAppState);
  };

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
                filename: fileName,
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
              // console.log(
              //   'Directory : ',
              //   goProDirectory,
              //   ' File : ',
              //   fileName,
              //   percentile,
              // );
              dispatch(
                setDownloadingProgressOfMedia({
                  fileName: fileName,
                  percentile: percentile,
                }),
              );
            },
          }).promise;
          logLoadEvent('app_backup_progress', {
            progress: 100,
            type: 'download',
            filename: fileName,
          });
        } catch (error) {
          logEvent('FrontEnd', 'app_backup_error', {
            error: JSON.stringify(error),
          });
        }

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

    console.log('_GUMLET', scheduledSessions);

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

  const getAssetId = async (med, mediaIndex, listIndex, fileName) => {
    const currentFile = med[mediaIndex]?.fs[listIndex];

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

    const resp = await axios.request(options);
    return resp.data.asset_id;
  };

  const getPreSignedUrlForUpload = async (assetId, partNumber) => {
    const {partDetails} = uploadedChunkMedia;

    // if (partDetails !== undefined && partDetails.partNumber === partNumber) {
    //   console.log('PrevUrl');
    //   return partDetails?.signedUrl;
    // }

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

  const _getParts = () => {
    const {eTag} = uploadedChunkMedia ?? {};
    let eTagTemp = [];
    console.log('ETags and Parts', eTag, parts);

    Array.isArray(eTag) &&
      eTag.map(tag => {
        let found = _.findIndex(
          parts,
          part => part.PartNumber == tag.PartNumber,
        );

        if (found < 0) {
          eTagTemp.push(tag);
        }
      });

    return [...eTagTemp, ...parts];
  };

  const uploadChunkToGumlet = async (
    assetId,
    filePath,
    totalNoOfChunks,
    bytesRead,
    partNumber,
  ) => {
    // const {eTag} = uploadedChunkMedia ?? {};

    console.log(
      '__GUMLET_UPLOAD',
      assetId,
      filePath,
      totalNoOfChunks,
      bytesRead,
      partNumber,
    );

    if (totalNoOfChunks <= 0) {
      const multipartCompleteOptions = {
        method: 'POST',
        url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/complete`,
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
        },
        data: {
          parts: _getParts(),
        },
      };

      axios
        .request(multipartCompleteOptions)
        .then(res => {
          dispatch(setPartUploadUrl(undefined));
          dispatch(setCompletedUploading());
          dispatch(setUploadingProgressOfMedia(null));
          deleteFile(filePath);
          console.log('Upload Completed');
        })
        .catch(err => {
          dispatch(setPartUploadUrl(undefined));
          dispatch(setCompletedUploading());
          dispatch(setUploadingProgressOfMedia(null));
          console.log('Multipart upload error', err);
        });
      deleteFile(filePath);
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

    const chunkFilePath = APP_DIR + '/fc_.mp4';

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
        // deleteFile(chunkFilePath);
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

  const chunkWiseUploadToGumlet = async (
    filePath,
    med,
    mediaIndex,
    listIndex,
    fileName,
  ) => {
    console.log('Chunkwise upload', filePath, med, mediaIndex, listIndex);
    const fileSize = await getFileSize(filePath);
    const totalNoOfChunks = Math.ceil(fileSize / CHUNK_SIZE);
    const assetId = await getAssetId(med, mediaIndex, listIndex, fileName);
    dispatch(setUploadingAssetId(assetId));
    dispatch(setFilePath(filePath));
    logLoadEvent('app_backup_progress', {
      progress: 0,
      type: 'upload',
      filename: fileName,
    });
    await uploadChunkToGumlet(assetId, filePath, totalNoOfChunks, 0, 1);
  };

  const checkIfAnyUploadingIsPending = async (isGallery = false) => {
    const {eTag, assetId, filePath, bytesRead = 0} = uploadedChunkMedia ?? {};

    if (connectedDevice == null && !isGallery) {
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
      if (isGallery) {
        pickVideo();
        return;
      }
      takeBackupOfFiles();
      // await chunkWiseUploadToGumlet(APP_DIR + '/' + 'ls.MP4');
    }
  };

  const startUploadingFile = async (
    med,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    await chunkWiseUploadToGumlet(
      filePath,
      med,
      mediaIndex,
      listIndex,
      fileName,
    );
    logLoadEvent('app_backup_progress', {
      progress: 100,
      type: 'upload',
      filename: fileName,
    });
    _connectAgainAndDownload(med, mediaIndex, listIndex);
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
      console.log('@response', response?.assets);

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

    // props.navigation.goBack();
  };

  const onCancel = () => {
    logClickEvent('app_backup_popup_action', {
      action: 'cancel',
    });
    setPopupVisibility(false);
  };

  const deleteFileUsingUri = uri => {
    console.log('Uri', uri);
    try {
      NativeModules.RNDocumentPicker.deleteFile(uri);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadUriToGumlet = async (
    assetId,
    filePath,
    totalNoOfChunks,
    bytesRead,
    partNumber,
    files,
    filePosition,
  ) => {
    if (totalNoOfChunks === 0) {
      const multipartCompleteOptions = {
        method: 'POST',
        url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/complete`,
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
        },
        data: {
          parts: parts,
        },
      };

      await axios
        .request(multipartCompleteOptions)
        .then(res => {
          dispatch(setCompletedUploading());
          dispatch(setUploadingProgressOfMedia(null));
          console.log('Upload Completed');
          logLoadEvent('app_backup_progress', {
            progress: 100,
            type: 'upload',
            filename: files[filePosition].name,
          });
          deleteFileUsingUri(files[filePosition].uri);
          parts = []; //empty all the tag response once file is uploaded

          // delete temp folder
          RNFetchBlob.fs.unlink(
            APP_DIR + `/${files[filePosition--].name.replaceAll('.', '_')}`,
          );

          // start uploading next file
          filePosition++;
          if (files.length > filePosition) {
            console.log(
              APP_DIR +
                `/${files[filePosition--].name.replaceAll('.', '_')}
            `,
            );

            startChunkUpload(files, filePosition);
          } else {
            ToastAndroid.show('Cloud back completed', ToastAndroid.BOTTOM);
          }
        })
        .catch(err => {
          dispatch(setCompletedUploading());

          console.log('__Error Multipart upload error', err);
        });

      deleteFile(filePath);
      return;
    }

    let chunkFilePath = '';
    let tempPath = '';
    try {
      const chunkData = await RNFS.read(
        filePath,
        CHUNK_SIZE,
        bytesRead,
        'base64',
      );

      bytesRead += CHUNK_SIZE;

      const time = new Date();

      const fileName = files[filePosition]?.name;
      console.log(fileName, files, filePosition);

      chunkFilePath = await createChunkDirectory(files[filePosition]?.name);
      tempPath = chunkFilePath;
      chunkFilePath = chunkFilePath + `/chunk_${time.getTime()}.mp4`;

      console.log('Chunkfilepath', chunkFilePath);
      await RNFS.writeFile(chunkFilePath, chunkData, 'base64');
    } catch (error) {
      console.log('__Error in create chunkfile path', error);
    }

    const preSignedUrl = await getPreSignedUrlForUpload(assetId, partNumber);

    const options = {
      url: preSignedUrl,
      path: chunkFilePath,
      method: 'PUT',
      type: 'raw',
      maxRetries: 10,
      headers: {
        'Content-Type': 'video/mp4',
      },
      notification: {
        enabled: true,
      },
    };

    Upload.startUpload(options)
      .then(uploadId => {
        console.log('Upload started');
        Upload.addListener('progress', uploadId, data => {
          let eachPartMaxSize = 100 / (totalNoOfChunks - 1 + partNumber);

          let percentage =
            (partNumber - 1) * eachPartMaxSize +
            (data.progress / 100) * eachPartMaxSize;

          // const uploadProgressPercentage =
          //   ((partNumber - 1 + data / 100) /
          //     (totalNoOfChunks - 1 + partNumber)) *
          //   100;
          dispatch(
            setUploadingProgressOfMedia({
              fileName: getLastString(filePath, '/'),
              percentile: percentage,
            }),
          );
          console.log(`Progress: ${data.progress}%`);
        });
        Upload.addListener('error', uploadId, data => {
          console.log(`Error: ${data.error}%`);
        });
        Upload.addListener('cancelled', uploadId, data => {
          console.log('Cancelled!');
        });
        Upload.addListener('completed', uploadId, async data => {
          console.log(data);
          const eTagPart = {
            PartNumber: partNumber,
            ETag: data.responseHeaders.ETag,
          };

          parts.push(eTagPart);
          await RNFetchBlob.fs.unlink(chunkFilePath);
          // data.flush();
          await uploadUriToGumlet(
            assetId,
            filePath,
            totalNoOfChunks - 1,
            bytesRead,
            partNumber + 1,
            files,
            filePosition,
          );
        });
      })
      .catch(async err => {
        await RNFetchBlob.fs.unlink(tempPath);
        console.log('Upload error!', err);
      });

    // RNFetchBlob.config({
    //   fileCache: false,
    // });

    // await RNFetchBlob.fetch(
    //   'PUT',
    //   preSignedUrl,
    //   {
    //     'Content-Type': 'video/mp4',
    //   },
    //   RNFetchBlob.wrap(chunkFilePath),
    // )
    //   .uploadProgress({interval: 550}, (written, total) => {
    //     const uploadProgressPercentage =
    //       ((partNumber - 1 + written / total) /
    //         (totalNoOfChunks - 1 + partNumber)) *
    //       100;
    //     dispatch(
    //       setUploadingProgressOfMedia({
    //         fileName: getLastString(filePath, '/'),
    //         percentile: uploadProgressPercentage,
    //       }),
    //     );
    //     console.log('Upload Progress Percentage', uploadProgressPercentage);
    //   })
    //   .then(async res => {
    //     const eTagPart = {
    //       PartNumber: partNumber,
    //       ETag: res.respInfo.headers.ETag,
    //     };

    //     parts.push(eTagPart);
    //     await RNFetchBlob.fs.unlink(chunkFilePath);
    //     res.flush();
    //     await uploadUriToGumlet(
    //       assetId,
    //       filePath,
    //       totalNoOfChunks - 1,
    //       bytesRead,
    //       partNumber + 1,
    //       files,
    //       filePosition,
    //     );
    //   })
    //   .catch(async err => {
    //     console.log('Unable to upload chunk', err);
    //     await RNFetchBlob.fs.unlink(tempPath);
    //   });
  };

  const createChunkDirectory = async dir => {
    const {config, fs} = RNFetchBlob;

    let tempPath = APP_DIR + `/${dir.replaceAll('.', '_')}`;
    console.log('tempPath', tempPath);

    // eslint-disable-next-line prettier/prettier
   return new Promise(async (resolve) => {
      try {
        RNFS.exists(tempPath)
          .then(async result => {
            if (result) {
              // await RNFetchBlob.fs.mkdir(tempPath);
            } else {
              await RNFetchBlob.fs.mkdir(tempPath);
            }
            resolve(tempPath);
          })
          .catch(err => {});
      } catch (error) {
        console.log('tempPath error', error);
        resolve(APP_DIR);
      }
    });
  };

  const generateAssetId = async (fileName, creationTime) => {
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
          creationTime: creationTime,
        },
      },
    };

    const resp = await axios.request(options);
    return resp.data.asset_id;
  };

  const startChunkUpload = async (files, filePosition) => {
    if (files.length < filePosition) {
      ToastAndroid.show('Cloud backup completed', ToastAndroid.BOTTOM);
      return;
    }

    const file = files[filePosition];

    dispatch(
      setCurrentBackFile({
        filesSelected: files.length,
        backupFilePos: filePosition + 1,
      }),
    );

    const assetId = await generateAssetId(
      file.name,
      // eslint-disable-next-line radix
      parseInt(file.creationTime),
    );

    await uploadUriToGumlet(
      assetId,
      file.uri,
      Math.ceil(file.size / CHUNK_SIZE),
      0,
      1,
      files,
      filePosition,
    );
  };

  const takeBackUpFromStorage = async () => {
    DocumentPicker.pickMultiple({
      type: 'video/mp4',
    }).then(async files => {
      // deleteFileUsingUri(files[0].uri);
      console.log(files);

      await _startParallelUpload(files[0]);

      // await compressVideoWithProcessor(files[0].uri);

      // await startChunkUpload(files, 0);
    });
  };

  // const compressVideoWithProcessor = async fileUri => {
  //   const realPath = await getRealPath(fileUri, 'video');
  //   const uploadUrl =
  //     'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/6452727356ecc7951d78cdbc/origin-6452727356ecc7951d78cdbc?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230503%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230503T144052Z&X-Amz-Expires=3600&X-Amz-Signature=0ae3b9bccbd53ee9d8e4112428492e81f84bb5361fd473f58df1fcee719574b6&X-Amz-SignedHeaders=host&x-id=PutObject';
  //   console.log('@RealPath', realPath);
  //   const options = {
  //     width: 1920,
  //     height: 1080,
  //     bitrateMultiplier: 3,
  //     saveToCameraRoll: true, // default is false, iOS only
  //     saveWithCurrentDate: true, // default is false, iOS only
  //     minimumBitrate: 300000,
  //     removeAudio: false, // default is false
  //   };
  //   ProcessingManager.getVideoInfo(realPath).then(k => console.log(k));
  //   console.log('@Item compress started', new Date().getTime());
  //   ProcessingManager.compress(realPath, options)
  //     .then(async newSource => {
  //       console.log(
  //         '@Item upload started',
  //         newSource.source,
  //         new Date().getTime(),
  //       );
  //       await backgroundUpload(
  //         uploadUrl,
  //         newSource.source,
  //         {
  //           httpMethod: 'PUT',
  //           headers: {
  //             'Content-Type': 'video/mp4',
  //           },
  //         },
  //         (written, total) => {
  //           console.log('Uploading ', written, total, new Date().getTime());
  //         },
  //       ).catch(err => console.log('Error', err));
  //       console.log('@Item uploaded', new Date().getTime());
  //     })
  //     .catch(console.warn);
  // };

  const compressVideo = async fileUri => {
    const realPath = await getRealPath(fileUri, 'video');

    console.log('@Item upload started', new Date().getTime());

    const uploadUrl =
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/6452547d5336a60e6227099e/origin-6452547d5336a60e6227099e?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230503%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230503T123302Z&X-Amz-Expires=3600&X-Amz-Signature=6bd2067be9fa0be97fc28dea1f45d4151768b216cfbcf3bebcc23e67d08a091e&X-Amz-SignedHeaders=host&x-id=PutObject';

    // const m = await generateFilePath(
    //   'file:///data/user/0/coach.fc.one/cache/e7238a00-6e1a-478b-a565-62008645fbe6.mp4',
    // );
    console.log('@RealPath', realPath);

    const result = await Video.compress(
      fileUri,
      {
        compressionMethod: 'manual',
        maxSize: 2704,
        bitrate: 12,
        getCancellationId: cancellationId => {},
      },
      progress => {
        console.log('Compression Progress: ', progress);
      },
    );
    console.log('@Item compression ended', new Date().getTime());

    await backgroundUpload(
      uploadUrl,
      result,
      {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
        },
      },
      (written, total) => {
        console.log('Uploading ', written, total, new Date().getTime());
      },
    ).catch(err => console.log('Error', err));
    console.log('@Item uploaded', new Date().getTime());

    const size = RNFetchBlob.fs.stat(result);
    console.log('Video Progress', size);
  };

  const _startParallelUpload = async file => {
    const fileUri = file.uri;
    // const realPath = await getRealPath(fileUri, 'video');

    const assetId = await generateAssetId(
      file.name,
      // eslint-disable-next-line radix
      parseInt(file.creationTime),
    );

    let bytesRead = 0;
    let CHUNKED_DATA_ARRAY = [];

    // RNFS.readFile(realPath, 'base64')
    //   .then(r => console.log('read', r))
    //   .catch(e => console.log('Error', e));

    console.log('__MUNNA @File read started', new Date().getTime());

    for (; bytesRead <= file.size; ) {
      const chunkData = await RNFS.read(
        fileUri,
        CHUNK_SIZE,
        bytesRead,
        'base64',
      );

      CHUNKED_DATA_ARRAY.push(chunkData);
      bytesRead += CHUNK_SIZE;
    }

    console.log('__MUNNA @File read ended', new Date().getTime());

    let uploadPromises = CHUNKED_DATA_ARRAY.map(async (chunkData, index) => {
      // console.log('__MUNNA chunk', chunkData);

      return getPreSignedUrlForUpload(assetId, index + 1).then(async res => {
        // console.log('__MUNNA res', chunkData);
        // const blob = new Blob([chunkData], {type: 'video/mp4'});

        // // const formData = new FormData();
        const data = Buffer.from(chunkData, 'base64');
        // // // console.log(data);
        // // formData.append('video', blob, `video${index}.mp4`);

        return axios.put(res, data, {
          headers: {
            'Content-Type': 'video/mp4',
            // 'Content-Type': 'multipart/form-data',
          },
        });

        return RNFetchBlob.fetch(
          'PUT',
          res,
          {
            'Content-Type': 'video/mp4',
          },
          [
            {
              name: `part${index + 1}`,
              filename: `part${index + 1}.mp4`,
              type: 'video/mp4',
              data: 'RNFetchBlob-file://' + chunkData,
            },
          ],
        );
      });

      // return await RNFetchBlob.fetch(
      //   'PUT',
      //   partUrl,
      //   {
      //     'Content-Type': 'video/mp4',
      //   },
      //   'RNFetchBlob-file://' + JSON.parse(chunkData),
      // );
    });

    console.log('__MUNNA Upload Promises ended', new Date().getTime());

    const eTagResponses = await Promise.all(uploadPromises);

    console.log('__MUNNA eTagResponses received', new Date().getTime());

    const completeReqParam = eTagResponses.map((res, index) => {
      return {
        PartNumber: (index + 1).toString(),
        ETag: res.headers.etag,
        // ETag: res.respInfo.headers.ETag,
      };
    });

    console.log(
      '__MUNNA eTagResponses manipulations',
      new Date().getTime(),
      completeReqParam,
    );

    const options = {
      method: 'POST',
      url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/complete`,
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
      },
      data: {
        parts: completeReqParam,
      },
    };

    axios
      .request(options)
      .then(res => {
        console.log('__GUMLET__  multipart complete api res', res);
      })
      .catch(err =>
        console.log(
          '__GUMLET__ multipart complete api error',
          JSON.stringify(err),
          err.message,
        ),
      );
  };

  return (
    <View style={styles.container}>
      <ConfirmModal
        visible={isPopupVisibile}
        message="Please Open GoPro Quik App to Connect GoPro & Continue"
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
            <Text style={[styles.btnTxt, {fontSize: 18}]}>Start Backup</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            logClickEvent('app_backup_click', {
              type: 'gallery',
            });
            takeBackUpFromStorage();
          }}>
          <View style={styles.box}>
            <Text style={[styles.btnTxt, {fontSize: 18}]}>
              Backup from storage
            </Text>
          </View>
        </Pressable>

        {/* <Pressable
          onPress={() => {
            checkIfAnyUploadingIsPending(true);
            logClickEvent('app_backup_click', {
              type: 'gallery',
            });
          }}>
          <View style={styles.box}>
            <Text style={[styles.btnTxt, {fontSize: 18}]}>
              Take Backup from Gallery
            </Text>
          </View>
        </Pressable> */}
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
