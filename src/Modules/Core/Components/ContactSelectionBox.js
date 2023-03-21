import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {removeSelectedContact, selectContact} from '../Redux/UserActions';

const ContactSelectionBox = props => {
  const {name, mobileNumber, batchId} = props;

  const [isSelected, setIsSelected] = useState(false);
  const dispatch = useDispatch();

  const toggleSelection = _ => {
    const obj = {
      fullName: name,
      firstName: name,
      batchId,
      phoneNumber: mobileNumber,
    };
    if (!isSelected) {
      dispatch(selectContact(obj));
    } else {
      dispatch(removeSelectedContact(obj));
    }
    setIsSelected(!isSelected);
  };
  return (
    <Pressable onPress={toggleSelection}>
      <View
        style={[
          styles.main,
          {backgroundColor: isSelected ? '#FFA366' : '#FFFFFF'},
        ]}>
        <Text
          style={[
            styles.displayName,
            {color: !isSelected ? '#000000' : '#FFFFFF'},
          ]}
          numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[
            styles.mobileNumber,
            {color: !isSelected ? '#000000' : '#FFFFFF'},
          ]}>
          {mobileNumber}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 2,
  },
  displayName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mobileNumber: {
    color: '#000000',
    fontSize: 16,
  },
});

export default ContactSelectionBox;
