import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
import DownloadAndUploadProgressBar from './Components/DownloadAndUploadProgressBar';
import GoProDeviceDetails from './Components/GoProDeviceDetails';
import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';

const SequentialBackupScreen = (callback, deps) => {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [hotspotDetails, setHotspotDetails] = useState({});
  const [mediaList, setMediaList] = useState(null);
  const [downloadDirectory, setDownloadDirectory] = useState(null);

  const dispatch = useDispatch();
  const {media, scheduledSessions} = useSelector(st => st.GoProReducer);
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

  useEffect(() => {
    if (Array.isArray(media) && media.length) {
      _startBackupProcess(media, 0, 0);
    }
  }, [_startBackupProcess, media]);

  const uploadChunkedVideo = async (filePath, uploadUrl) => {
    try {
      // Get the file size
      const {size} = await RNFetchBlob.fs.stat(filePath);

      // Calculate the total number of chunks
      const totalChunks = Math.ceil(size / CHUNK_SIZE);

      // Loop through each chunk and upload it
      for (let i = 0; i < totalChunks; i++) {
        // Calculate the start and end positions of the chunk
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, size);

        // Read the chunk data from the file
        const chunkData = await RNFetchBlob.fs.readStream(
          filePath,
          start,
          end - start,
        );

        // Convert the chunk data to base64
        const base64ChunkData = chunkData.toString('base64');

        // Create the payload for the chunk upload
        const payload = {
          chunkData: base64ChunkData,
          totalChunks,
          currentChunk: i + 1,
          fileName: 'video.mp4', // Update with your actual file name
        };

        // Send the chunk payload to the server for upload
        await RNFetchBlob.fetch(
          'POST',
          uploadUrl,
          {
            'Content-Type': 'application/json',
          },
          JSON.stringify(payload),
        );

        // Update progress or do other operations related to chunk upload
      }

      // All chunks uploaded successfully
      console.log('Chunked video upload complete');
    } catch (error) {
      console.error('Error uploading chunked video:', error);
    }
  };

  const _startBackupProcess = async (media, mediaIndex, listIndex) => {
    if (mediaIndex < media.length) {
      const {fs, d: goProDirectory} = media[mediaIndex];
      const listOfFiles = _.orderBy(fs, ['mod'], ['desc']);

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
        _disableTurboTransfer();

        await WifiManager.disconnect();

        setTimeout(() => {
          _uploadLargeFileToGumlet(
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
    const {mod = new Date().getTime()} = file;

    const filteredArray = scheduledSessions.filter(itm => itm <= mod);

    if (filteredArray.length) {
      return filteredArray[0];
    }
    return {};
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
        console.log('file exists: ', result);
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

  const splitVideoIntoChunks = async (videoFilePath, chunkSizeInBytes) => {
    console.log('__CHUNK__  video file path', videoFilePath);
    try {
      // Read the video file
      const videoData = await RNFS.readFile(videoFilePath, 'base64');

      // Calculate the total number of chunks
      const totalChunks = Math.ceil(videoData.length / chunkSizeInBytes);

      // Create an array to hold the chunk file paths
      const chunkFilePaths = [];

      // Loop through each chunk
      for (let i = 0; i < totalChunks; i++) {
        // Calculate the start and end indices for the chunk
        const start = i * chunkSizeInBytes;
        const end = Math.min((i + 1) * chunkSizeInBytes, videoData.length);

        // Extract the chunk data from the video data
        const chunkData = videoData.substring(start, end);

        // Create a temporary file path for the chunk
        const chunkFilePath = APP_DIR + `/video_chunk_${i}.mp4`;

        // Write the chunk data to the temporary file
        await RNFS.writeFile(chunkFilePath, chunkData, 'base64');

        // Add the chunk file path to the array
        chunkFilePaths.push(chunkFilePath);
      }

      console.log('Video split into chunks successfully:', chunkFilePaths);
      return chunkFilePaths;
    } catch (error) {
      console.error('Error splitting video into chunks:', error);
    }
  };

  const _uploadLargeFileToGumlet = async (
    media,
    mediaIndex,
    listIndex,
    filePath,
    fileName,
  ) => {
    // let filePath = APP_DIR + '/' + 'GX011108.MP4';
    const currentFile = media[mediaIndex]?.fs[listIndex];

    console.log('__GUMLET__', filePath);
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
    // const signedInurl = resp.data.upload_url;
    const assetId = resp.data.asset_id;
    console.log('__GUMLET__ asset id created');
    // dispatch(
    //   setUploadingProgressOfMedia({
    //     fileName: fileName,
    //     percentile: 0,
    //   }),
    // );
    try {
      const chunkSize = 300 * 1024 * 1024; // Chunk size in bytes (e.g., 10 MB)

      // Read file data

      const videoData = await RNFS.readFile(filePath, 'base64');
      console.log('__GUMLET video data chunk', videoData);

      const totalChunks = Math.ceil(videoData.length / chunkSize);

      const chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        // Calculate the start and end indices for the chunk
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, videoData.length);

        // Extract the chunk data from the video data
        const chunkData = videoData.substring(start, end);

        chunks.push(chunkData);
      }

      // const chunks = await splitVideoIntoChunks(filePath, chunkSize);

      console.log('__GUMLET__ chunks', chunks);
      // Iterate through the chunks and upload them one by one
      const uploadPromises = chunks.map(async (chunk, index) => {
        // Generate a unique part number for each chunk
        const partNumber = index + 1;

        // Create a temporary file path for the chunk
        const chunkFilePath = APP_DIR + `/video_chunkkkk${index}.mp4`;

        // Write the chunk data to the temporary file
        await RNFS.writeFile(chunkFilePath, chunk, 'base64');

        // upload chunks

        let chunkUploadsOptions = {
          method: 'GET',
          url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/${
            index + 1
          }/sign`,
          headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
          },
        };

        return axios
          .request(chunkUploadsOptions)
          .then(res => {
            console.log(
              '__GUMLET__  Blob put request started',
              res,
              res.data.part_upload_url,
            );
            console.log('__GUMLET__ chunk going null', chunk);

            return RNFetchBlob.fetch(
              'PUT',
              res.data.part_upload_url, // S3 upload URL
              {
                'Content-Type': 'video/mp4',
              },
              RNFetchBlob.wrap(chunkFilePath),
            )
              .uploadProgress({interval: 250}, (written, total) => {
                const percentile =
                  (index * 100 +
                    ((written / total) * 100) / (chunks.length * 100)) *
                  100;

                dispatch(
                  setUploadingProgressOfMedia({
                    fileName: fileName,
                    percentile: percentile,
                  }),
                );
              })
              .then(async response => {
                // Dispatch action to store the uploaded part number
                console.log('__GUMLET__  Put request success', response);
                // await RNFS.unlink(chunkFilePath);
                dispatch(setUploadingProgressOfMedia(null));
                deleteFile(chunkFilePath);

                return response;
              })
              .catch(err =>
                console.log(
                  '__GUMLET__ Error in put request',
                  JSON.stringify(err),
                ),
              );
          })
          .catch(err =>
            console.log(
              '__GUMLET__ error in getting pre signed url for part',
              partNumber,
              JSON.stringify(err),
            ),
          );
      });

      // Wait for all uploads to complete
      const responses = await Promise.all(uploadPromises);

      console.log('__GUMLET__ responses of each part upload', responses);

      let finalCompleteParams = [];

      const etags = responses.map((response, index) => {
        console.log('__GUMLET__ Etag response', response);
        finalCompleteParams = [
          ...finalCompleteParams,
          {
            PartNumber: (index + 1).toString(),
            ETag: response.respInfo.headers.ETag,
            // '""' + response.respInfo.headers.ETag.replaceAll('"', '') + '""',
          },
        ];

        // return response.info().headers.etag;
      });
      console.log('__GUMLET__ ETagParams', finalCompleteParams);
      const options2 = {
        method: 'POST',
        url: `https://api.gumlet.com/v1/video/assets/${assetId}/multipartupload/complete`,
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
        },
        data: {
          parts: finalCompleteParams,
        },
      };

      axios
        .request(options2)
        .then(res => {
          dispatch(uploadedCompletedFile(fileName));
          deleteFile(filePath);
          _connectAgainAndDownload(media, mediaIndex, listIndex);
          console.log('__GUMLET__  multipart complete api res', res);
        })
        .catch(err =>
          console.log(
            '__GUMLET__ multipart complete api error',
            JSON.stringify(err),
            err.message,
          ),
        );
    } catch (error) {
      // Handle error and dispatch failure action if needed
      // dispatch({type: UPLOAD_VIDEO_CHUNKS_FAILURE, payload: error});
      console.log('__GUMLET__ catch error', error.message);
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
      <View style={{marginHorizontal: 16}}>
        <GoProDeviceDetails
          deviceDetails={hotspotDetails}
          id={connectedDevice.id}
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

        <Pressable onPress={takeBackupOfFiles}>
          <View style={styles.box}>
            <Text style={[styles.btnTxt, {fontSize: 18}]}>Take Backup</Text>
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
