import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RightArrowBox = props => {
  const {pressed, btnTitle} = props;

  return (
    <Pressable onPress={pressed}>
      <View style={styles.btn}>
        <Text style={styles.btnTxt}>{btnTitle}</Text>
        <MaterialIcons name={'arrow-forward-ios'} size={28} color={'#000000'} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  btnTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    alignItems: 'center',
  },
});

export default RightArrowBox;
