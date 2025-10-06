import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from "react-native"
import React, { useState } from "react"
import { auth } from "@/firebase.config"
import { sendPasswordResetEmail } from "firebase/auth"
import { router } from "expo-router"
import CustomButton from "@/components/CustomButton";
import { useColorScheme } from 'react-native';
import Colors from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isInputValid = email.trim() !== '';

  const forgotPassword = async() => {
    setError('');
    setSuccess(false);
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.log(error);
      setError("Failed to send reset email: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
      >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <View style={styles.headerSection}>
                <Text style={[styles.title, {color: theme.text}]}>Reset Password</Text>
                <Text style={[styles.subtitle, {color: theme.secondaryText}]}>
                  Enter your email address and we'll send you a link to reset your password
                </Text>
              </View>

              <View style={styles.formSection}>
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#DC3545" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {success ? (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                    <Text style={styles.successText}>
                      Password reset email sent! Check your inbox and follow the link to reset your password.
                    </Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.secondaryBackground,
                        borderColor: theme.tint,
                        color: theme.text,
                      }
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    editable={!success}
                  />
                </View>

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
                      Sending reset email...
                    </Text>
                  </View>
                ) : (
                  <CustomButton
                    title="Send Reset Email"
                    onPress={forgotPassword}
                    variant={isInputValid ? "primary" : "secondary"}
                    style={!isInputValid ? styles.disabledButton : undefined}
                    disabled={!isInputValid || success}
                  />
                )}

                <CustomButton
                  title="Back to Sign In"
                  onPress={() => router.back()}
                  variant="secondary"
                  style={styles.backToSignInButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 40,
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(92, 184, 228, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  successText: {
    color: '#28A745',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  backToSignInButton: {
    marginTop: 20,
  },
});

