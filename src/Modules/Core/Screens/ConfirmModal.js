import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';

const ConfirmModal = ({visible, message, onConfirm, onCancel}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.messageText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
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
  },
  messageText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3164F4',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ababab',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ConfirmModal;
