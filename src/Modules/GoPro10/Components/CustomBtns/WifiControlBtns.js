import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const WifiControlBtn = props => {
  const _pressed = _ => {
    props.onPress();
  };

  return (
    <TouchableOpacity onPress={_pressed}>
      <View style={styles.btn}>
        <Text style={styles.btnTxt}>{props.btnText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#22798F',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 30,
    minWidth: 220,
  },
  btnTxt: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default WifiControlBtn;
