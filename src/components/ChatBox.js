import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { sendAIMessage } from '../services/sendAIMessage';
import TextInput from './TextInput';

const ChatBox = forwardRef((_props, ref) => {
  const scrollRef = useRef();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI Insurance Assistant. I'm here to help you with claims, quotes, policy information, and answer any insurance questions you might have. How can I assist you today?",
    },
  ]);

  const handleSend = async text => {
    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const aiReply = await sendAIMessage(text);

    setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
  };

  useImperativeHandle(ref, () => ({
    sendMessage: text => {
      handleSend(text);
    },
  }));

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
    chatBubble: {
      borderRadius: 12,
      padding: 12,
      maxWidth: '80%',
    },
    assistantBubble: {
      backgroundColor: '#f1f5f9',
      alignSelf: 'flex-start',
    },
    userBubble: {
      backgroundColor: '#dbeafe',
      alignSelf: 'flex-end',
    },
    chatText: {
      fontSize: 13,
      color: '#111',
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

      {/* Map User Message yang terkirim */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.chatContainer}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.chatBubble,
              msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.chatText}>{msg.content}</Text>
          </View>
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
});

export default ChatBox;
