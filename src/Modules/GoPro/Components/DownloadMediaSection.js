import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import FileAndProgress from './FileAndProgress';
import RNFS from 'react-native-fs';
import {APP_DIR, GOPRO_BASE_URL} from '../Utility/Constants';
import {setDownloadCompleted, setDownloadingFile} from '../Redux/GoProActions';

const DownloadMediaSection = props => {
  const {mediaList, downloadedMediaList, downloadedDirName} = useSelector(
    st => st.GoProReducer,
  );

  const [filesToDownload, setFilesToDownload] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    let yetToDownloadFiles = [];

    mediaList.map((item, index) => {
      const isDefined = _.find(downloadedMediaList, obj => obj.n == item.n);
      if (isDefined == undefined) {
        yetToDownloadFiles.push(item);
      }
    });

    setFilesToDownload(yetToDownloadFiles);
  }, [mediaList]);

  useEffect(() => {
    if (Array.isArray(filesToDownload) && filesToDownload.length) {
      _downloadFilesSequentially(filesToDownload, 0); //start downloading files
    }
  }, [filesToDownload]);

  const _downloadFilesSequentially = async (filesToDownload, index) => {
    const date = new Date();
    const fileNamePrefix = date.getTime();

    await RNFS.downloadFile({
      fromUrl: `${GOPRO_BASE_URL}videos/DCIM/${downloadedDirName}/${filesToDownload[index].n}`,
      toFile: APP_DIR + '/' + fileNamePrefix + filesToDownload[index].n,
      background: true,
      discretionary: true,
      cacheable: true,
      begin: r => {
        dispatch(
          setDownloadingFile({
            name: filesToDownload[index].n,
            psuedoName: fileNamePrefix + filesToDownload[index].n,
            progress: 0,
            index: index,
            ...filesToDownload[index],
          }),
        );
      },
      progress: r => {
        const percentile = (r.bytesWritten / r.contentLength) * 100;
        // console.log(percentile, index);

        dispatch(
          setDownloadingFile({
            name: filesToDownload[index].n,
            psuedoName: fileNamePrefix + filesToDownload[index].n,
            progress: percentile,
            index: index,
            ...filesToDownload[index],
          }),
        );

        // if (percentile / 100 == 1) {
        //   dispatch(
        //     setDownloadCompleted({
        //       name: filesToDownload[index].n,
        //       psuedoName: fileNamePrefix + filesToDownload[index].n,
        //       index: index,
        //       ...filesToDownload[index],
        //     }),
        //   );
        // }
      },
    }).promise;
    dispatch(
      setDownloadCompleted({
        name: filesToDownload[index].n,
        psuedoName: fileNamePrefix + filesToDownload[index].n,
        index: index,
        ...filesToDownload[index],
      }),
    );
    if (index < filesToDownload.length - 1) {
      await _downloadFilesSequentially(filesToDownload, index + 1);
    } else {
      props.startUploadingProcess(); //start uploading process
    }
  };

  const _renderDownloading = ({item, index}) => {
    return <FileAndProgress data={item} index={index} />;
  };

  const _listHeaderComponent = () => (
    <Text style={styles.header}>Downloading Files</Text>
  );

  console.log(filesToDownload);

  if (Array.isArray(filesToDownload) && !filesToDownload.length) {
    return <Text>No files to download</Text>;
  }

  return (
    <FlatList
      data={filesToDownload}
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

export default DownloadMediaSection;
