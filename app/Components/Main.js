import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
  ToastAndroid,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {
  CAMERA_IP,
  CAMERA_NAME,
  CAMERA_PASSWORD,
  CAMERA_PORT,
} from '../Utils/Constants';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

const Main = props => {
  const [isWifiConnected, setWifiConnected] = useState(null);

  const _stopRecordingVideo = _ => {
    fetch(`http://${CAMERA_IP}/gopro/camera/shutter/stop`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };
  const _startRecordingVideo = _ => {
    fetch(`http://${CAMERA_IP}/gopro/camera/shutter/start`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _stopWebCam = _ => {
    fetch(`http://${CAMERA_IP}/gopro/webcam/stop`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };
  const _startWebCam = _ => {
    alert(`http://${CAMERA_IP}/gopro/webcam/start`);
    fetch(`http://${CAMERA_IP}/gopro/webcam/preview`)
      //   .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const _handleWifiConnection = async _ => {
    setWifiConnected(true);
    try {
      await WifiManager.connectToProtectedSSID(
        CAMERA_NAME,
        CAMERA_PASSWORD,
        false,
      );
      console.log('Wifi Successfully Connected');
    } catch (error) {
      console.log('Wifi failed Connecting');
    }
    setWifiConnected(false);
  };

  const _getMediaList = _ => {
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/list`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r.media))
      .catch(e => console.log('Camera State error', e));
  };

  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
  };

  const _uploadFile = _ => {
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    const upload_file_path = RootDir + 'file_1677591924520.mp4';
    const uploadUrl =
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63fe0827b4ade3692e1bba43/origin-63fe0827b4ade3692e1bba43?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ/20230228/us-west-2/s3/aws4_request&X-Amz-Date=20230228T135655Z&X-Amz-Expires=3600&X-Amz-Signature=7e5a736f58cab66ff931178766edf441f7e2c535b65fc40d6fa788d9ef3f6c50&X-Amz-SignedHeaders=host&x-id=PutObject';

    let files = [
      {
        name: 'GoPro1',
        filename: 'GoPro1,mp4',
        filepath: upload_file_path,
        filetype: 'json',
      },
    ];

    RNFS.uploadFiles({
      toUrl: uploadUrl,
      files: files,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
      fields: {
        hello: 'world',
      },
      begin: uploadBegin,
      progress: uploadProgress,
    })
      .promise.then(response => {
        if (response.statusCode == 200) {
          console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
        } else {
          console.log('SERVER ERROR');
        }
      })
      .catch(err => {
        if (err.description === 'cancelled') {
          // cancelled by user
        }
        console.log(err);
      });
  };

  const uploadVideo = async () => {
    // Linking.openURL('file:///storage/emulated/0/Pictures/m.mp4');
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    const upload_file_path = 'file://' + RootDir + '/m.mp4';
    console.log(upload_file_path);
    // Check if any file is selected or not
    if (upload_file_path != null) {
      // If file selected then create FormData
      const fileToUpload = upload_file_path;
      const data = new FormData();
      data.append('video', {
        type: 'video/mp4',
        uri: fileToUpload,
        name: 'souraj.mp4',
      });
      console.log(data);
      // Please change file upload URL
      let res = await fetch(
        'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63fe0c8339e457f74b4708f5/origin-63fe0c8339e457f74b4708f5?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ/20230228/us-west-2/s3/aws4_request&X-Amz-Date=20230228T141532Z&X-Amz-Expires=3600&X-Amz-Signature=8e42796c4af65d7012a016bcfd6c361804550b841bf6992036a7ec8729160c47&X-Amz-SignedHeaders=host&x-id=PutObject',
        {
          method: 'put',
          body: data,
          headers: {
            'Content-Type': 'video/mp4',
          },
        },
      );
      let responseJson = await res.json();
      if (responseJson.status == 1) {
        alert('Upload Successful');
      }
    } else {
      // If no file selected the show alert
      alert('Please Select File first');
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

  const downloadFile = () => {
    const date = new Date();
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/turbo_transfer?p=1`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    RNFS.downloadFile({
      fromUrl: 'http://10.5.5.9:8080/videos/DCIM/100GOPRO/GH010958.MP4',
      toFile:
        RootDir +
        '/file_' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        '.MP4',
      background: true,
      discretionary: true,
      cacheable: true,
      begin: r => console.log('Downloading started', r),
      progress: r =>
        console.log('Downloading progress', r.bytesWritten / r.contentLength),
    });
    fetch(`http://${CAMERA_IP}:${CAMERA_PORT}/gopro/media/turbo_transfer?p=0`)
      .then(r => r.json())
      .then(r => console.log('Camera State ====', r))
      .catch(e => console.log('Camera State error', e));
  };

  const downloadMedia = async url => {
    try {
      const response = await fetch(
        'http://10.5.5.9:8080/videos/DCIM/100GOPRO/GOPR0996.JPG',
      );

      const fileName = 'GOPR0996.JPG';
      const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;
      console.log('Fetch', path);
      await RNFS.write(path, 'blob', 1, 'base64');
      console.log('Media file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const __downloadMedia = _ => {
    downloadMedia();
    downloadFile();
  };

  const uploadVideoToGooglePreSignedUrl = async () => {
    const reqObj =
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63fe1475b4ade3692e1bf6aa/origin-63fe1475b4ade3692e1bf6aa?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230228%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230228T144925Z&X-Amz-Expires=3600&X-Amz-Signature=f871df7c9c192fb86420d5484e7b10304dd4a51593fcde57afafda3540a5b9aa&X-Amz-SignedHeaders=host&x-id=PutObject';
    const video = new FormData();
    video.append('file', {
      type: 'video',
      uri: 'file:///storage/emulated/0/Pictures/m.mp4',
      name: 'souraj.mp4',
    });
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('PUT', reqObj);
      xhr.setRequestHeader('Content-Type', 'video/mp4');
      xhr.timeout = 60000;
      xhr.send(video);
      xhr.upload.addEventListener('progress', e => {
        console.log('@progress', e);
        const {lengthComputable, loaded, total} = e;
        if (e.lengthComputable) {
          // setUploadPercentage(e.loaded / e.total);
        }
      });
      xhr.addEventListener('abort', e => {
        console.log('@abort', e);
      });
      xhr.addEventListener('load', () => {
        console.log('@onload');
        resolve();
      });
      xhr.addEventListener('timeout', e => {
        console.log('@timeout', e);
      });
      xhr.addEventListener('loadend', e => {
        console.log('Load End', e);
        // triggerApiToUpdateStatus(reqObj);
        ToastAndroid.show('Uploaded successfully', ToastAndroid.CENTER);
      });
    });
  };

  const uploadFileToGumlet = async _ => {
    const xhr = new XMLHttpRequest();
    const gumletUploadUrl =
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63fe1a6ab4ade3692e1c0e39/origin-63fe1a6ab4ade3692e1c0e39?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230228%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230228T151451Z&X-Amz-Expires=3600&X-Amz-Signature=9e5ea9ffe0efc5a8b751c014bacf1abe50fc90e42b19bfa82376b247ba1f2f77&X-Amz-SignedHeaders=host&x-id=PutObject';

    xhr.open('PUT', gumletUploadUrl);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    // xhr.setRequestHeader(
    //   'Authorization',
    //   'Bearer 244953dc1ad898aa48bd000856d4f879',
    // );

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('Upload successful!');
        } else {
          console.error('Upload failed:', xhr.responseText);
        }
      }
    };

    const formData = new FormData();
    formData.append('video', {
      uri: 'file:///storage/emulated/0/Pictures/m.mp4',
      type: 'video/mp4',
      name: 'video.mp4',
    });

    // const fileContent = await RNFS.readFile(
    //   'file:///storage/emulated/0/Pictures/m.mp4',
    //   'base64',
    // );

    // console.log(fileContent);

    xhr.send(formData);
  };

  const getBlob = async fileUri => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const upload_gumlet = async () => {
    const imageBody = await getBlob(
      'file:///storage/emulated/0/Pictures/m.mp4',
    );

    return fetch(
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod-deletable/63fe06f5b4ade3692e1bb407/63fe2484b4ade3692e1c33fe/origin-63fe2484b4ade3692e1c33fe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230228%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230228T155756Z&X-Amz-Expires=3600&X-Amz-Signature=c502447c8a9f8a7df1673c61f6ad46578b3ba687ce4b8b2a18a0dd35ed89a740&X-Amz-SignedHeaders=host&x-id=PutObject',
      {
        method: 'PUT',
        body: imageBody,
      },
    );
  };

  return (
    <View style={styles.main}>
      {isWifiConnected && <ActivityIndicator size={'large'} color={'blue'} />}
      <Pressable onPress={_handleWifiConnection} style={styles.btn}>
        <Text style={{fontSize: 24}}>Connect to GoProHero10</Text>
      </Pressable>
      <Pressable onPress={_startRecordingVideo} style={styles.btn}>
        <Text style={{fontSize: 24}}>Start Recording Video</Text>
      </Pressable>
      <Pressable onPress={_stopRecordingVideo} style={styles.btn}>
        <Text style={{fontSize: 24}}>Stop Recording Video</Text>
      </Pressable>
      <Pressable onPress={_startWebCam} style={styles.btn}>
        <Text style={{fontSize: 24}}>Start Webcam</Text>
      </Pressable>
      <Pressable onPress={_stopWebCam} style={styles.btn}>
        <Text style={{fontSize: 24}}>Stop Webcam</Text>
      </Pressable>
      <Pressable onPress={_getMediaList} style={styles.btn}>
        <Text style={{fontSize: 24}}>Get Media List</Text>
      </Pressable>
      <Pressable onPress={downloadFile} style={styles.btn}>
        <Text style={{fontSize: 24}}>Download Media</Text>
      </Pressable>
      <Pressable onPress={upload_gumlet} style={styles.btn}>
        <Text style={{fontSize: 24}}>Upload Media</Text>
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
  btn: {
    marginVertical: 20,
  },
});

export default Main;
