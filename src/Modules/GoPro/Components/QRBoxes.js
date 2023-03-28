import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QRBoxes = props => {
  const {qrCommand, isLastIndex, position} = props;

  const positionTxt =
    position === 1 ? 'Set your LIVE-Stream address' : 'Launch Your LIVE-Stream';

  return (
    <View style={styles.main}>
      <View
        style={{
          // backgroundColor: '#000000',
          // padding: 10,
          borderRadius: 100,
          // height: 35,
          // width: 35,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Text style={styles.positionTxt}>{position + '. ' + positionTxt}</Text>
      </View>

      <View
        style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
        }}>
        <QRCode value={qrCommand} size={Dimensions.get('window').width - 80} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    width: Dimensions.get('window').width - 32,
    height: 400,
    // backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionTxt: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default QRBoxes;
