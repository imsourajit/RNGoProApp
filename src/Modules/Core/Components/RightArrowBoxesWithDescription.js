import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RightArrowBoxesWithDescription = props => {
  const {pressed, btnTitle, btnDesc, data, isIconShow} = props;

  const onPress = () => {
    pressed(data);
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.btn}>
        <View>
          <Text style={styles.btnTxt}>{btnTitle}</Text>
          <Text style={styles.btnDesc}>{btnDesc}</Text>
        </View>
        {isIconShow === false ? null : (
          <MaterialIcons
            name={'arrow-forward-ios'}
            size={28}
            color={'#000000'}
          />
        )}
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
});

export default RightArrowBoxesWithDescription;
