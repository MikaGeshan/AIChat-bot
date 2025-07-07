import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TextInput from './TextInput';
import { groqResponse } from '../services/groqResponse';
import BubbleChat from './BubbleChat';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello! I'm your AI Insurance Assistant. I'm here to help you with claims, quotes, policy information, and answer any insurance questions you might have. How can I assist you today?",
      },
    ]);
  }, []);

  const handleSend = async userMessage => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '...' },
    ]);

    try {
      const aiReply = await groqResponse(userMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: aiReply };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Terjadi kesalahan saat memproses jawaban.',
        };
        return updated;
      });
    }
  };

  const styles = StyleSheet.create({
    wrapper: {
      backgroundColor: '#eef3fe',
      borderRadius: 12,
      padding: 16,
      margin: 16,
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      color: 'white',
      fontWeight: 'bold',
    },
    agentName: {
      fontWeight: '600',
      fontSize: 15,
      color: '#111',
    },
    agentSub: {
      color: '#6b7280',
      fontSize: 12,
    },
    scrollArea: {
      flex: 1,
      marginBottom: 12,
    },
    chatContainer: {
      paddingVertical: 10,
      gap: 10,
    },
    inputWrapper: {
      marginTop: 4,
    },
    footerInfo: {
      fontSize: 11,
      color: '#6b7280',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
        <View>
          <Text style={styles.agentName}>AI Insurance Agent</Text>
          <Text style={styles.agentSub}>Always ready to help</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <BubbleChat
            key={idx}
            message={msg.content}
            isUserChat={msg.role === 'user'}
          />
        ))}
      </ScrollView>

      <View style={styles.inputWrapper}>
        <TextInput onSend={handleSend} />
      </View>

      <Text style={styles.footerInfo}>
        Our AI agent is here 24/7 to help with claims, quotes, and policy
        questions
      </Text>
    </KeyboardAvoidingView>
  );
};

export default ChatBox;
