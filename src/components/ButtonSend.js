import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Send } from 'lucide-react-native';

const ButtonSend = ({ onPress }) => {
  const styles = StyleSheet.create({
    sendButton: {
      backgroundColor: '#3b82f6',
      padding: 8,
      borderRadius: 6,
    },
  });
  return (
    <TouchableOpacity style={styles.sendButton} onPress={onPress}>
      <Send size={18} color="white" />
    </TouchableOpacity>
  );
};

export default ButtonSend;
