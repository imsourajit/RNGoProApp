import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const StudentListsScreen = props => {
  return (
    <View style={styles.main}>
      <Text>StudentsListsScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default StudentListsScreen;
