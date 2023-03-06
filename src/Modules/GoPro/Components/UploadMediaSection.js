import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, ToastAndroid} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import {APP_DIR} from '../Utility/Constants';
import axios from 'axios';
import UploadFileAndProgress from './UploadFileAndProgress';
import {setUploadCompleted, setUploadingFile} from '../Redux/GoProActions';

const UploadMediaSection = props => {
  const {
    mediaList,
    downloadedMediaList,
    downloadedDirName,
    uploadedMediaList,
    uploadingFile,
  } = useSelector(st => st.GoProReducer);

  const [filesToUpload, setFilesToUpload] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    let yetToUploadFiles = [];

    downloadedMediaList.map((item, index) => {
      const isDefined = _.find(uploadedMediaList, obj => obj.n == item.n);
      if (isDefined == undefined) {
        yetToUploadFiles.push(item);
      }
    });

    setFilesToUpload(yetToUploadFiles);
  }, [downloadedMediaList]);

  useEffect(() => {
    if (Array.isArray(filesToUpload) && filesToUpload.length) {
      _uploadFilesSequentially(filesToUpload); //start uploading files
    }
  }, [filesToUpload]);

  const _uploadFilesSequentially = media => {
    _getPreSignedUrlForGumlet(media, 0);
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
      ToastAndroid.show('Successfully uploaded', ToastAndroid.CENTER);
    }
  };

  const _uploadDownloadedFilesToGumlet = (
    uploadUrl,
    downloadedMedia,
    index,
  ) => {
    let RootDir = APP_DIR;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
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
        } else {
          console.log('Upload failed', xhr);
        }
        if (index < downloadedMedia.length) {
          _getPreSignedUrlForGumlet(downloadedMedia, index + 1);
        } else {
          props.completeUploadProcess();
        }
      }
    };
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        let percentComplete = (evt.loaded / evt.total) * 100;
        dispatch(
          setUploadingFile({
            name: downloadedMedia[index].n,
            psuedoName: downloadedMedia.psuedoName,
            progress: percentComplete,
            index: index,
          }),
        );
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

  const _renderDownloading = ({item, index}) => {
    return <UploadFileAndProgress data={item} index={index} />;
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
      renderItem={_renderDownloading}
      keyExtractor={item => item.n.toString()}
      ListHeaderComponent={_listHeaderComponent}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
  },
});

export default UploadMediaSection;
