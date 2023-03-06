import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const CustomBtn = props => {
  const {btnTxt = '', onPress = () => {}, data = undefined} = props;

  const _pressed = () => {
    onPress(data);
  };

  if (btnTxt.length < 1) {
    return null;
  }

  return (
    <TouchableOpacity onPress={_pressed}>
      <View style={styles.btn}>
        <Text style={styles.btnTxt}>{btnTxt}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'darkblue',
    padding: 10,
    margin: 10,
    borderRadius: 15,
  },
  btnTxt: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CustomBtn;
