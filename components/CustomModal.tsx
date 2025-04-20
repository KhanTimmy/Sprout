import React, { ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StyleProp, ViewStyle, DimensionValue } from 'react-native';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  maxHeight?: DimensionValue;
}

const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOutsideClick = false,
  maxHeight = '100%', // Default max height for the content area
}: CustomModalProps) => {
  // Create a dynamic style with the maxHeight
  const scrollViewStyle: StyleProp<ViewStyle> = {
    width: '100%',
    maxHeight: maxHeight as DimensionValue,
  };

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
        <SafeAreaView
          style={styles.modalView}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
         
          <ScrollView 
            style={scrollViewStyle}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.modalContent}>
              {children}
            </View>
          </ScrollView>
         
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
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
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalContent: {
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomModal;