import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

const OtpInputScreen = props => {
  const [otpCode, setOtpCode] = useState('');
  const validateOtp = () => {};

  return (
    <View style={styles.main}>
      <View>
        <Text>Enter otp</Text>
        <TextInput
          style={styles.otpCodeContainer}
          value={otpCode}
          onChangeText={setOtpCode}
          maxLength={4}
          keyboardType={'phone-pad'}
        />
      </View>

      <Pressable onPress={validateOtp}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>Proceed</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#000000',
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  otpCodeContainer: {
    borderWidth: 0.3,
    borderColor: '#F0F0F0',
    borderRadius: 3,
    color: '#FFFFFF',
    marginVertical: 10,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  btn: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#303030',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btnBorder: {
    marginBottom: 100,
  },
});

export default OtpInputScreen;
