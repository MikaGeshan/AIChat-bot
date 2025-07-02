import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Button,
} from 'react-native';
import React, { useRef } from 'react';
import ItemBox from '../components/ItemBox';
import ChatBox from '../components/ChatBox';
import { fetchContents } from '../services/fetchContents';
import ActionButton from '../components/ActionButton';

const HomeScreen = () => {
  const handleFetch = async () => {
    const content = await fetchContents();
    if (content) {
      console.log('PDF Parsed');
      console.log(content);
    } else {
      console.log('Error fetching PDF Content');
    }
  };

  // properti data untuk item box
  const serviceData = [
    {
      icon: 'Car',
      iconColor: '#1483df',
      title: 'Auto Insurance',
      data: [
        'Collision Coverage',
        'Liability Protection',
        'Comprehensive Coverage',
        'Roadside Assistance',
      ],
    },
    {
      icon: 'House',
      iconColor: '#1ddd0d',
      title: 'Property Insurance',
      data: [
        'Property Coverage',
        'Liability Protection',
        'Personal Property',
        'Additional Living Expenses',
      ],
    },
    {
      icon: 'Heart',
      iconColor: 'red',
      title: 'Health Insurance',
      data: [
        'Medical Coverage',
        'Prescription Drugs',
        'Preventive Care',
        'Emergency Services',
      ],
    },
    {
      icon: 'Briefcase',
      iconColor: '#680eea',
      title: 'Business Insurance',
      data: [
        'General Liability',
        'Property Insurance',
        'Workers Compensation',
        'Professional Liability',
      ],
    },
  ];

  // properti data untuk action button
  const actionButtons = [
    {
      iconName: 'FileText',
      label: 'File a Claim',
      backgroundColor: '#ffe5e5',
      iconColor: '#b91c1c',
    },
    {
      iconName: 'Phone',
      label: 'Contact Agent',
      backgroundColor: '#e0f2fe',
      iconColor: '#2563eb',
    },
    {
      iconName: 'CreditCard',
      label: 'Pay Bill',
      backgroundColor: '#fef9c3',
      iconColor: '#eab308',
    },
    {
      iconName: 'Info',
      label: 'Policy Info',
      backgroundColor: '#e0ffe5',
      iconColor: '#059669',
    },
  ];

  const chatBoxRef = useRef();

  // Untuk mengirim label ke input chatbox
  const handleActionButtonPress = label => {
    if (chatBoxRef.current && chatBoxRef.current.sendMessage) {
      chatBoxRef.current.sendMessage(label);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e8eefc',
    },
    scrollContent: {
      paddingVertical: 24,
      paddingHorizontal: 0,
    },
    serviceContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      marginHorizontal: 18,
      paddingVertical: 20,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    itemBoxWrapper: {
      marginBottom: 16,
    },
    actionButtonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
      marginBottom: 4,
      gap: 12,
    },
    actionButton: {
      width: '48%',
      marginBottom: 12,
    },
    chatBoxWrapper: {
      marginTop: 28,
      marginHorizontal: 18,
      marginBottom: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.serviceContainer}>
            {serviceData.map((item, idx) => (
              <View style={styles.itemBoxWrapper} key={idx}>
                <ItemBox
                  icon={item.icon}
                  iconColor={item.iconColor}
                  title={item.title}
                  data={item.data}
                />
              </View>
            ))}
            <View style={styles.actionButtonRow}>
              {actionButtons.map((btn, idx) => (
                <ActionButton
                  key={idx}
                  iconName={btn.iconName}
                  label={btn.label}
                  backgroundColor={btn.backgroundColor}
                  iconColor={btn.iconColor}
                  style={styles.actionButton}
                  onPress={() => handleActionButtonPress(btn.label)}
                />
              ))}
            </View>
          </View>
          <View style={styles.chatBoxWrapper}>
            <ChatBox ref={chatBoxRef} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;
