import React from 'react';
import { StyleSheet, Text, View, Platform, StatusBar } from 'react-native';
import { ShieldPlus } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: '#1f59f3',
    borderRadius: 4,
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  textSponsor: {
    fontWeight: 'bold',
  },
});

const Header = () => {
  const topPadding = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 16;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <ShieldPlus size={32} color="white" />
        </View>
        <Text style={styles.title}>AI Assistant</Text>
      </View>
      <Text style={styles.subTitle}>Here to help all your insurance needs</Text>
      <View>
        <Text>
          Powered by <Text style={styles.textSponsor}>Groq</Text>
        </Text>
      </View>
    </View>
  );
};

export default Header;
