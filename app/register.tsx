import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from "react-native"
import { View as SafeAreaView } from 'react-native';
import React, { useState } from "react"
import { auth } from "@/firebase.config"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"
import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCloudBackground from '@/components/AnimatedCloudBackground';
import BackButton from '@/components/BackButton';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [confirmSecureText, setConfirmSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isInputValid = email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';
  const passwordsMatch = password === confirmPassword;

  const register = async () => {
    setError('');
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      router.push('/(tabs)/home');
    } catch (error: any) {
      console.log(error);
      setError("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const { theme } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedCloudBackground>
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
                <BackButton onPress={() => router.back()} style={styles.backButton} />
                <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                  Join Swaddle to track your baby's first steps
                </Text>
              </View>

              <View style={styles.formSection}>
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#DC3545" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.primary,
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
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
                  <View
                    style={[
                      styles.passwordContainer,
                      { 
                        borderColor: theme.primary, 
                        backgroundColor: theme.cardBackground 
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.passwordInput, { color: theme.text }]}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureText}
                      autoCapitalize="none"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity 
                      onPress={() => setSecureText(!secureText)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={secureText ? "eye-off" : "eye"} 
                        size={24} 
                        color={theme.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
                  <View
                    style={[
                      styles.passwordContainer,
                      { 
                        borderColor: passwordsMatch ? theme.primary : theme.error, 
                        backgroundColor: theme.cardBackground 
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.passwordInput, { color: theme.text }]}
                      placeholder="Confirm your password"
                      placeholderTextColor={theme.placeholder}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={confirmSecureText}
                      autoCapitalize="none"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity 
                      onPress={() => setConfirmSecureText(!confirmSecureText)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={confirmSecureText ? "eye-off" : "eye"} 
                        size={24} 
                        color={theme.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <Text style={styles.passwordMismatchText}>
                      Passwords do not match
                    </Text>
                  )}
                </View>

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <LoadingAnimation text="Creating account..." size="large" />
                  </View>
                ) : (
                  <CustomButton
                    title="Create Account"
                    onPress={register}
                    variant={isInputValid && passwordsMatch ? "gradient" : "secondary"}
                    style={!isInputValid || !passwordsMatch ? styles.disabledButton : undefined}
                    disabled={!isInputValid || !passwordsMatch}
                  />
                )}

                <CustomButton
                  title="Back to Sign In"
                  onPress={() => router.back()}
                  variant="primary"
                  style={styles.backToSignInButton}
                />
              </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </AnimatedCloudBackground>
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
    marginBottom: 30,
    marginTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    height: 60,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  passwordMismatchText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    marginTop: 16,
  },
});
