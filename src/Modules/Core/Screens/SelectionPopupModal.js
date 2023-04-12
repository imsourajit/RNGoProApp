import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';

const SelectionPopupModal = ({visible, data, onSelect, onCancel}) => {
  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => onSelect(item)}>
      <Text style={styles.itemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Choose Device</Text>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.type}
          />
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '80%',
    maxHeight: '70%',
  },
  itemText: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#000000',
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SelectionPopupModal;
