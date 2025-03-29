import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  labelPosition?: 'left' | 'right';
}

export default function RadioButton({ 
  label, 
  selected, 
  onPress, 
  labelPosition = 'left' 
}: RadioButtonProps) {
  return (
    <TouchableOpacity
      style={styles.radioButton}
      onPress={onPress}
    >
      {labelPosition === 'left' && (
        <Text style={styles.radioButtonLabel}>{label}</Text>
      )}
      <View style={styles.radioCircle}>
        {selected && <View style={styles.radioSelected} />}
      </View>
      {labelPosition === 'right' && (
        <Text style={styles.radioButtonLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioButtonLabel: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
});