import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { Send } from 'lucide-react-native';

const TextInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: 'white',
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: '#d1d5db',
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    input: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 6,
      fontSize: 13,
      color: '#111',
      marginRight: 6,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: '#3b82f6',
      padding: 8,
      borderRadius: 6,
    },
  });

  return (
    <View style={styles.inputContainer}>
      <RNTextInput
        placeholder="Type your insurance question here"
        placeholderTextColor="#999"
        style={styles.input}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Send size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default TextInput;
