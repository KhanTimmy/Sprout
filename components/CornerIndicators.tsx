import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChildData } from '@/services/ChildService';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { auth } from '@/firebase.config';

interface CornerIndicatorsProps {
  selectedChild: ChildData | null;
  childrenList: ChildData[];
  onSelectChild: (child: ChildData) => void;
  onNavigateToAddChild: () => void;
}

const CornerIndicators: React.FC<CornerIndicatorsProps> = ({
  selectedChild,
  childrenList,
  onSelectChild,
  onNavigateToAddChild,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLeftDropdownVisible, setIsLeftDropdownVisible] = useState(false);
  const [isRightDropdownVisible, setIsRightDropdownVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
    setIsRightDropdownVisible(false);
  };

  const navigateToAccess = () => {
    router.push('/access');
    setIsRightDropdownVisible(false);
  };

  const handleSelectChildPress = (child: ChildData) => {
    const isNewChild = !selectedChild || selectedChild.id !== child.id;
    onSelectChild(child);
    setIsLeftDropdownVisible(false);
    return isNewChild;
  };

  const handleAddChildPress = () => {
    onNavigateToAddChild();
    setIsLeftDropdownVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.leftCornerIndicator, 
          { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            top: insets.top + 12
          }
        ]}
        onPress={() => setIsLeftDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cornerText, { color: theme.text }]} numberOfLines={1}>
          {selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : 'Select Child'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isLeftDropdownVisible}
        onRequestClose={() => setIsLeftDropdownVisible(false)}
      >
        <TouchableOpacity
          style={[
            styles.leftModalOverlay,
            { paddingTop: insets.top + 50 }
          ]}
          activeOpacity={1}
          onPressOut={() => setIsLeftDropdownVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleAddChildPress}>
              <Text style={[styles.dropdownItemText, { color: theme.text }]}>Add Child</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onSelectChild(null);
                setIsLeftDropdownVisible(false);
              }}
            >
              <Text style={[styles.dropdownItemText, { color: theme.text }]}>Clear Selected Child</Text>
            </TouchableOpacity>

            {childrenList.length > 0 && (
              <View style={[styles.separator, { backgroundColor: theme.placeholder }]} />
            )}

            {childrenList.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.dropdownItem}
                onPress={() => handleSelectChildPress(child)}
              >
                <View style={styles.dropdownRow}>
                  <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={[styles.childTypeText, { color: theme.text }]}>
                    {child.type === 'Parent' ? '👤 Parent' : '✓ Auth'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={[
          styles.rightCornerIndicator, 
          { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            top: insets.top + 12
          }
        ]}
        onPress={() => setIsRightDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cornerText, { color: theme.text }]} numberOfLines={1}>
          {selectedChild ? (selectedChild.type === 'Parent' ? '👤 Parent' : '✓ Auth') : 'User'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isRightDropdownVisible}
        onRequestClose={() => setIsRightDropdownVisible(false)}
      >
        <TouchableOpacity
          style={[
            styles.rightModalOverlay,
            { paddingTop: insets.top + 50 }
          ]}
          activeOpacity={1}
          onPressOut={() => setIsRightDropdownVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToAccess}>
              <Text style={[styles.dropdownItemText, { color: theme.text }]}>Access</Text>
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: theme.placeholder }]} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
              <Text style={[styles.dropdownItemText, { color: theme.text }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  leftCornerIndicator: {
    position: 'absolute',
    left: 12,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: '50%',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  rightCornerIndicator: {
    position: 'absolute',
    right: 12,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: '50%',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cornerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  leftModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingLeft: 12,
  },
  rightModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 12,
  },
  dropdownMenu: {
    borderRadius: 20,
    width: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childTypeText: {
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    width: '100%',
  },
});

export default CornerIndicators;