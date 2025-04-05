import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  fullWidth?: boolean;
  style?: object;
  disabled?: boolean;
}

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  fullWidth = true, 
  style = {},
  disabled = false 
}: ButtonProps) {
  const buttonStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
    success: styles.successButton,
  };
  
  const textStyles = {
    primary: styles.primaryButtonText,
    secondary: styles.secondaryButtonText,
    danger: styles.dangerButtonText,
    success: styles.successButtonText,
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles[variant],
        fullWidth ? styles.fullWidth : null,
        disabled ? styles.disabledButton : null,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText, 
        textStyles[variant],
        disabled ? styles.disabledButtonText : null
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#007BFF',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: '#DC3545',
  },
  dangerButtonText: {
    color: '#fff',
  },
  successButton: {
    backgroundColor: '#28A745',
  },
  successButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#E9ECEF',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#6C757D',
  },
});