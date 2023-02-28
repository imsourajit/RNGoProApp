import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const HttpCommandsTest = () => {
  const _getMediaList = _ => {};

  return (
    <View style={styles.main}>
      <TouchableOpacity onPress={_getMediaList} style={styles.btn}>
        <Text style={styles.btnTxt}>Get Media</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  btn: {
    padding: 5,
    margin: 5,
    backgroundColor: '#ababab',
    // width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#000000',
  },
});
export default HttpCommandsTest;
