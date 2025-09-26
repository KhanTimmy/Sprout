import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemedDropdownProps {
  data: Array<{ label: string; value: string | number }>;
  value: string | number | null;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  search?: boolean;
  maxHeight?: number;
  style?: any;
}

const ThemedDropdown: React.FC<ThemedDropdownProps> = ({
  data,
  value,
  onValueChange,
  placeholder = "Select item",
  searchPlaceholder = "Search...",
  search = false,
  maxHeight = 300,
  style,
}) => {
  const { theme } = useTheme();
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Dropdown
      style={[
        styles.dropdown,
        {
          backgroundColor: theme.secondaryBackground,
          borderColor: isFocus ? theme.tint : theme.placeholder,
        },
        style
      ]}
      placeholderStyle={[
        styles.placeholderStyle,
        { color: theme.placeholder }
      ]}
      selectedTextStyle={[
        styles.selectedTextStyle,
        { color: theme.text }
      ]}
      inputSearchStyle={[
        styles.inputSearchStyle,
        {
          backgroundColor: theme.secondaryBackground,
          color: theme.text,
          borderColor: theme.placeholder,
        }
      ]}
      iconStyle={[
        styles.iconStyle,
        { tintColor: theme.text }
      ]}
      data={data}
      search={search}
      maxHeight={maxHeight}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={item => {
        onValueChange(item.value);
        setIsFocus(false);
      }}
      renderLeftIcon={() => (
        <MaterialCommunityIcons
          style={styles.icon}
          color={theme.text}
          name="chevron-down"
          size={20}
        />
      )}
      activeColor={theme.slider}
      itemContainerStyle={{
        backgroundColor: theme.secondaryBackground,
      }}
      itemTextStyle={{
        color: theme.text,
      }}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});

export default ThemedDropdown; 