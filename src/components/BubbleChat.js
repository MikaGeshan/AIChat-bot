import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const BubbleChat = ({ message, isUserChat }) => {
  const styles = StyleSheet.create({
    chatBubble: {
      borderRadius: 12,
      padding: 12,
      maxWidth: '80%',
      marginVertical: 4,
    },
    aiBubble: {
      backgroundColor: '#f1f5f9',
      alignSelf: 'flex-start',
    },
    userBubble: {
      backgroundColor: '#dbeafe',
      alignSelf: 'flex-end',
    },
    chatText: {
      fontSize: 15,
      color: '#111',
    },
  });
  return (
    <View
      style={[
        styles.chatBubble,
        isUserChat ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.chatText}>{message}</Text>
    </View>
  );
};

export default BubbleChat;
