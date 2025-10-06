import React, { ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, DimensionValue } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  maxHeight?: DimensionValue;
  minHeight?: number;
}

const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOutsideClick = false,
  maxHeight = '80%',
  minHeight = 550,
}: CustomModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPress={() => {
          if (closeOnOutsideClick) onClose();
        }}
      >
        <View
          style={[
            styles.modalView, 
            { 
              backgroundColor: theme.secondaryBackground,
              maxHeight: maxHeight,
              minHeight: minHeight,
            }
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity
              style={[styles.closeIconButton, { backgroundColor: theme.secondaryBackground }]}
              onPress={onClose}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>
          </View>
         
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {children}
          </ScrollView>
         
          {showCloseButton && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.tint }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.background }]}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    minHeight: 550,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeIconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  closeButton: {
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CustomModal;