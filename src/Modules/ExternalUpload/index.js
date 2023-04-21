import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

const ExternalUpload = props => {
  useEffect(() => {
    const externalPath = RNFS.ExternalStorageDirectoryPath;
    getFileContent(externalPath);
    console.log(RNFS.ExternalStorageDirectoryPath);
  }, []);

  const getFileContent = async path => {
    console.log(await RNFS.exists('/storage/emulated/'));

    const reader = await RNFS.readDir('/storage/emulated/');
    console.log('reader', reader);
  };

  const open = async () => {
    const uploadUrl =
      'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/64400631fac3f5d6b7bdc574/origin-64400631fac3f5d6b7bdc574?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230419%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230419T151810Z&X-Amz-Expires=3600&X-Amz-Signature=296eebe324dea062cfb780754a292c7026ca2a37e1da5f75f1d8158d7f2ada6a&X-Amz-SignedHeaders=host&x-id=PutObject';

    DocumentPicker.pickMultiple({
      type: [DocumentPicker.types.video],
    })
      .then(async res => {
        console.log(res);

        const stat = await RNFetchBlob.fs.stat(res[0].uri);
        const fileUri = await RNFS.readFile(res[0].uri);

        console.log(stat);

        // RNFS.readFile(res[0].uri, 'base64')
        //   .then(async fileUri => {
        //     // const filePath = fileUri.replace('file://', '');
        //     // console.log(fileUri);
        //     //
        //     // const chunkFilePath = APP_DIR + `/fc${new Date().getTime()}.MP4`;
        //     //
        //     // console.log('Chunkfilepath', chunkFilePath);
        //     // await RNFS.writeFile(chunkFilePath, filePath, 'base64');
        //     //
        //     // RNFetchBlob.config({
        //     //   fileCache: false,
        //     // });
        //
        //     // await RNFetchBlob.fetch(
        //     //   'PUT',
        //     //   uploadUrl,
        //     //   {
        //     //     'Content-Type': 'video/mp4',
        //     //   },
        //     //   RNFetchBlob.wrap(chunkFilePath),
        //     // )
        //     //   .uploadProgress({interval: 550}, (written, total) => {
        //     //     console.log('Upload Progress Percentage', written, total);
        //     //   })
        //     //   .then(async res => {
        //     //     console.log('res', res);
        //     //   })
        //     //   .catch(err => console.log('Unable to upload chunk', err));
        //   })
        //   .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  };
  //
  // const openDocumentPicker = async () => {
  //   DocumentPicker.pickMultiple().then(async res => {
  //    RNFS.readFile(res[0].uri, "base64")
  //       .then(async fileUri => {
  //         const filePath = fileUri.replace("file://", "");
  //         console.log(fileUri);
  //
  //         const chunkFilePath = APP_DIR + `/fc${new Date().getTime()}.MP4`;
  //
  //         console.log("Chunkfilepath", chunkFilePath);
  //         await RNFS.writeFile(chunkFilePath, filePath, "base64");
  //
  //         RNFetchBlob.config({
  //           fileCache: false,
  //         });
  //
  //         await RNFetchBlob.fetch(
  //           "PUT",
  //           uploadUrl,
  //           {
  //             "Content-Type": "video/mp4",
  //           },
  //           RNFetchBlob.wrap(chunkFilePath),
  //         )
  //           .uploadProgress({ interval: 550 }, (written, total) => {
  //             console.log("Upload Progress Percentage", written, total);
  //           })
  //           .then(async res => {
  //             console.log("res", res);
  //           })
  //           .catch(err => console.log("Unable to upload chunk", err));
  //
  //
  //         // Use the filePath for further processing, such as uploading
  //     // await backgroundUpload(
  //     //   'https://vod-ingest.gumlet.com/gumlet-user-uploads-prod/63fe06f5b4ade3692e1bb407/64400631fac3f5d6b7bdc574/origin-64400631fac3f5d6b7bdc574?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDOHE3WKEQ%2F20230419%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230419T151810Z&X-Amz-Expires=3600&X-Amz-Signature=296eebe324dea062cfb780754a292c7026ca2a37e1da5f75f1d8158d7f2ada6a&X-Amz-SignedHeaders=host&x-id=PutObject',
  //     //   res[0].uri,
  //     //   {
  //     //     httpMethod: 'PUT',
  //     //     headers: {
  //     //       'Content-Type': 'video/mp4',
  //     //     },
  //     //   },
  //     //   (written, total) => {
  //     //     console.log('Uploading ', written, total);
  //     //   },
  //     // );
  //   // });
  // }
  // }
  //
  // }

  return (
    <View style={styles.container}>
      <Text>Flex1</Text>
      <Pressable onPress={open}>
        <Text
          style={{
            fontSize: 20,
          }}>
          Hellos
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default ExternalUpload;
