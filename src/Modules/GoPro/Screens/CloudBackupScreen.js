import React, {useEffect} from 'react';
import {BackHandler, Pressable, StyleSheet, Text, View} from 'react-native';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';
import DocumentPicker from 'react-native-document-picker';

const CloudBackupScreen = props => {
  useEffect(() => {
    // hardware backpress for events
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

  const openDocumentPicker = async () => {
    logClickEvent('app_backup_click', {
      type: 'gallery',
    });
    DocumentPicker.pickMultiple().then(async files => {
      files.forEach((file, index) => {});
    });
  };

  return (
    <View styles={styles.container}>
      <Text> Cloud backup screen</Text>

      <Pressable onPress={openDocumentPicker}>
        <Text> Open Document Picker </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default CloudBackupScreen;
