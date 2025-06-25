import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from './Icon';

const BUTTON_SIZE = 90;

const ActionButton = ({
  backgroundColor = '#ffe5e5',
  iconName,
  iconColor = '#b91c1c',
  label = 'File a Claim',
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.container, { backgroundColor }, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name={iconName} color={iconColor} size={26} />
    <Text
      style={[styles.label, { color: iconColor }]}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default ActionButton;

const styles = StyleSheet.create({
  container: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  label: {
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
});
