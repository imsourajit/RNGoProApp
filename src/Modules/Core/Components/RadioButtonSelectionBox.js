import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

const RadioButtonSelectionBox = props => {
  const {pressed, btnTitle, btnDesc, batchSelected, index} = props;

  const onPress = _ => {
    pressed(index);
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.btn}>
        <View>
          <Text style={styles.btnTxt}>{btnTitle}</Text>
          <Text style={styles.btnDesc}>{btnDesc}</Text>
        </View>
        {batchSelected === index ? (
          <View style={styles.selectionBoxBorder}>
            <View style={styles.innerBox} />
          </View>
        ) : null}
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
  },
  btnDesc: {
    fontSize: 18,
    color: '#030303',
  },
  selectionBoxBorder: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 50,
    height: 30,
    width: 30,
    borderColor: '#3164F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBox: {
    height: 20,
    width: 20,
    borderRadiuswidth: 30,
    borderRadius: 30,
    backgroundColor: '#000000',
  },
});

export default RadioButtonSelectionBox;
