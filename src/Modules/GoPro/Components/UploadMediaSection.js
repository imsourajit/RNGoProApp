import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, ToastAndroid} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import {APP_DIR} from '../Utility/Constants';
import axios from 'axios';
import UploadFileAndProgress from './UploadFileAndProgress';
import {setUploadCompleted, setUploadingFile} from '../Redux/GoProActions';
import {backgroundUpload} from '@imsourajit/react-native-compressor';

const UploadMediaSection = props => {
  const {
    mediaList,
    downloadedMediaList,
    downloadedDirName,
    uploadedMediaList,
    uploadingFile,
    sessionDetails,
  } = useSelector(st => st.GoProReducer);

  const [filesToUpload, setFilesToUpload] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    let yetToUploadFiles = [];

    downloadedMediaList.map((item, index) => {
      const isDefined = _.find(
        uploadedMediaList,
        obj => obj.psuedoName == item.psuedoName,
      );
      if (isDefined == undefined) {
        yetToUploadFiles.push(item);
      }
    });

    console.log('Files', yetToUploadFiles);

    setFilesToUpload(yetToUploadFiles);
  }, [downloadedMediaList, uploadedMediaList]);

  useEffect(() => {
    if (Array.isArray(filesToUpload) && filesToUpload.length) {
      _uploadFilesSequentially(filesToUpload); //start uploading files
    }
  }, [filesToUpload]);

  const _uploadFilesSequentially = media => {
    if (media.length) {
      _getPreSignedUrlForGumlet(media, 0);
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
      data: {
        collection_id: '63fe06f5b4ade3692e1bb407',
        format: 'HLS',
        metadata: {
          session: sessionDetails?.id ?? 'DIRECT_CAMERA',
        },
      },
    };

    if (index < downloadedMedia.length) {
      axios
        .request(options)
        .then(function (response) {
          new Promise((resolve, reject) =>
            _compressAndUploadToGumlet(
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
      ToastAndroid.show('Successfully uploaded', ToastAndroid.CENTER);
    }
  };

  const _compressAndUploadToGumlet = async (
    uploadUrl,
    downloadedMedia,
    index,
  ) => {
    console.log(uploadUrl, downloadedMedia, index);

    try {
      // const dstUrl = await Video.compress(
      //   'file://' + APP_DIR + '/' + downloadedMedia[index].psuedoName,
      //   {
      //     compressionMethod: 'auto',
      //     minimumFileSizeForCompress: 0,
      //   },
      //   progress => {
      //     // console.log('Compression Progress: ', progress);
      //     dispatch(
      //       setUploadingFile({
      //         name: downloadedMedia[index].n,
      //         psuedoName: downloadedMedia.psuedoName,
      //         progress: 0,
      //         index: index,
      //       }),
      //     );
      //   },
      // );
      const dstUrl =
        'file://' + APP_DIR + '/' + downloadedMedia[index].psuedoName;
      const uploadResult = await backgroundUpload(
        uploadUrl,
        dstUrl,
        {
          httpMethod: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
          },
        },
        (written, total) => {
          // console.log(written, total);
          dispatch(
            setUploadingFile({
              name: downloadedMedia[index].n,
              psuedoName: downloadedMedia.psuedoName,
              progress: (written / total) * 100,
              index: index,
            }),
          );
          if (written / total == 1) {
            console.log(index < downloadedMedia.length - 1);
            if (index < downloadedMedia.length - 1) {
              _getPreSignedUrlForGumlet(downloadedMedia, index + 1);
            } else {
              dispatch(
                setUploadCompleted({
                  name: downloadedMedia[index].n,
                  psuedoName: downloadedMedia.psuedoName,
                  index,
                }),
              );
              props.completeUploadProcess();
            }
          }
        },
      );
    } catch (e) {
      console.log('Something went wrong', e);
    }
  };

  const _uploadDownloadedFilesToGumlet = (
    uploadUrl,
    downloadedMedia,
    index,
    compressUrl,
  ) => {
    let RootDir = APP_DIR;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      console.log('Xhr', xhr);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          dispatch(
            setUploadCompleted({
              name: downloadedMedia[index].n,
              psuedoName: downloadedMedia.psuedoName,
              index: index,
            }),
          );
          console.log('Upload success', index);
          if (index < downloadedMedia.length - 1) {
            _getPreSignedUrlForGumlet(downloadedMedia, index + 1);
          } else {
            props.completeUploadProcess();
          }
        } else {
          console.log('Upload failed', xhr.status);
        }
      }
    };
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        let percentComplete = (evt.loaded / evt.total) * 100;
        console.log('Upload percentage', percentageComplete);
        // dispatch(
        //   setUploadingFile({
        //     name: downloadedMedia[index].n,
        //     psuedoName: downloadedMedia.psuedoName,
        //     progress: percentComplete,
        //     index: index,
        //   }),
        // );
      }
    };
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', 'video/mp4');
    xhr.send({
      uri: compressUrl,
      type: 'video/mp4',
      name: downloadedMedia[index].psuedoName,
    });
  };

  const _renderUploading = ({item, index}) => {
    return (
      <UploadFileAndProgress
        data={item}
        index={index}
        totalFiles={filesToUpload}
      />
    );
  };

  const _listHeaderComponent = () => (
    <Text style={styles.header}>Uploading Files</Text>
  );

  if (Array.isArray(filesToUpload) && !filesToUpload.length) {
    return <Text>No files to download</Text>;
  }

  return (
    <FlatList
      data={filesToUpload}
      renderItem={_renderUploading}
      keyExtractor={item => item.n.toString()}
      // ListHeaderComponent={_listHeaderComponent}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
  },
});

export default UploadMediaSection;
