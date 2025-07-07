import React, { useState } from 'react';
import { StyleSheet, View, TextInput as RNTextInput } from 'react-native';
import ButtonSend from './ButtonSend';

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
      <ButtonSend onPress={handleSend} />
    </View>
  );
};

export default TextInput;
