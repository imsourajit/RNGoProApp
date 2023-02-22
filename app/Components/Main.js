import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

const Main = props => {
  const _handleWifiConnection = _ => {};

  return (
    <View style={styles.main}>
      <Pressable onPress={_handleWifiConnection}>
        <Text style={{fontSize: 24}}>Connect to GoProHero10</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Main;
