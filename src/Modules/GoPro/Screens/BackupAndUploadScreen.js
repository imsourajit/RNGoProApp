import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {APP_DIR, CAMERA_DIR} from '../Utility/Constants';
import RNFS, {unlink} from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';

const CHUNK_SIZE = 10 * 1024 * 1024;
let bytesRead = 0;
let parts = [];

const BackupAndUploadScreen = props => {
  useEffect(() => {
    fetchVideosFromGallery();
  }, []);

  const fetchVideosFromGallery = async () => {
    try {
      const galleryPath = CAMERA_DIR;
      const files = await RNFS.readDir(galleryPath);
      const ff = await RNFS.readDir(files[1].path);
      console.log('Fetched videos from gallery:', files);
      const videos = ff.filter(
        file => file.isFile() && file.name.endsWith('.mp4'),
      );
      console.log(
        'Fetched videos from gallery:',
        new Date(videos.reverse()[0].mtime).getTime(),
      );
      // You can now use the 'videos' array to access and display the videos
    } catch (error) {
      console.error('Error fetching videos from gallery:', error);
    }
  };

  const createChunk = async (i, chunkData) => {};

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

  const getFileSize = async filePath => {
    const fileDetails = await RNFetchBlob.fs.stat(filePath);
    return fileDetails.size;
  };

  const readFileintoChunks = async filePath => {
    let video = '';
    let i = 0;

    let totalChunks = Math.ceil(getFileSize(filePath) / CHUNK_SIZE);

    let chunkData = [];

    while (totalChunks) {
      const videoData = await RNFS.read(
        filePath,
        CHUNK_SIZE,
        bytesRead,
        'base64',
      );

      chunkData.push(videoData);
      //  video = video + videoData;
      bytesRead += CHUNK_SIZE;
      i++;
      totalChunks--;
      console.log('__GUMLET totalchunks', totalChunks);
    }
  };

  const readVideoFileInChunks = async videoFilePath => {
    try {
      console.log(videoFilePath);
      // await unlink('/storage/emulated/0/Pictures/fconee/video_chunkkkk3.mp4');
      // return;
      // const fileDetails = await RNFetchBlob.fs.stat(videoFilePath);

      const fileSize = await getFileSize(videoFilePath);

      let video = '';
      let i = 0;
      // const options = {
      //   method: 'POST',
      //   url: 'https://api.gumlet.com/v1/video/assets/upload',
      //   headers: {
      //     accept: 'application/json',
      //     'content-type': 'application/json',
      //     Authorization: 'Bearer 244953dc1ad898aa48bd000856d4f879',
      //   },
      //   data: {
      //     collection_id: '63fe06f5b4ade3692e1bb407',
      //     format: 'HLS',
      //     metadata: {
      //       // userId: userId ?? 'Anonymous',
      //     },
      //   },
      // };

      // const resp = await axios.request(options);

      let assetId = '643546d0490c3a5017f08c19'; //resp.data.asset_id;
      let totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

      let chunkData = [];

      while (totalChunks) {
        const videoData = await RNFS.read(
          videoFilePath,
          CHUNK_SIZE,
          bytesRead,
          'base64',
        );

        chunkData.push(videoData);
        //  video = video + videoData;
        bytesRead += CHUNK_SIZE;
        i++;
        totalChunks--;
        console.log('__GUMLET totalchunks', totalChunks);
      }

      const uploadPromises = chunkData.map(async (chunk, index) => {
        // Generate a unique part number for each chunk
        const partNumber = index + 1;

        // Create a temporary file path for the chunk
        const chunkFilePath = APP_DIR + `/fconee/vide_fc${index}.mp4`;

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
              .uploadProgress({interval: 250}, (written, total) => {})
              .then(async response => {
                // Dispatch action to store the uploaded part number
                console.log('__GUMLET__  Put request success', response);
                // await RNFS.unlink(chunkFilePath);

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

      const responses = await Promise.all(uploadPromises);
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

      console.log(chunkData);

      axios
        .request(options2)
        .then(res => {
          // deleteFile(videoFilePath);

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
      console.log('error', error);
    }
  };

  return (
    <View style={styles.main}>
      <Pressable
        onPress={() => readVideoFileInChunks(APP_DIR + '/lg.MP4', CHUNK_SIZE)}>
        <Text>Upload</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackupAndUploadScreen;
