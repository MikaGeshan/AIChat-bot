import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';

const ItemBox = ({ icon, iconColor = '#2563eb', title, data }) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      borderColor: '#e5e7eb',
      borderWidth: 0.5,
      marginBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    icon: {
      marginRight: 6,
    },
    title: {
      fontWeight: '600',
      fontSize: 13,
      color: '#111',
    },
    itemText: {
      color: '#4b5563',
      marginBottom: 1,
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Icon name={icon} size={20} color={iconColor} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {data.map((item, index) => (
        <Text key={index} style={styles.itemText}>
          • {item}
        </Text>
      ))}
    </View>
  );
};

export default ItemBox;
