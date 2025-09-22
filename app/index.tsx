import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView,
  Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, useColorScheme
 } from "react-native";
import React, { useState } from "react";
import { auth } from "@/firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { Image } from 'expo-image';
import CustomButton from "@/components/CustomButton";
import { Ionicons } from '@expo/vector-icons';
import Colors from "@/constants/Colors";

const index = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isInputValid = email.trim() !== '' && password.trim() !== '';

  const logIn = async () => {
    setError('');
    if (!email.includes('@')) {
      setError('Invalid email format.');
      return;
    }

    try {
      setLoading(true);
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/(tabs)/home');
    } catch (error: any){
      console.log(error);
      setError("Sign in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
                <Text style={[styles.title, { color: theme.text }]}>Swaddle</Text>
                <Image
                  style={styles.logo}
                  source={require('../assets/images/logo.png')}
                  contentFit="contain"
                />
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
                        backgroundColor: theme.secondaryBackground,
                        borderColor: theme.tint,
                        color: theme.text,
                      },
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
                        borderColor: theme.tint, 
                        backgroundColor: theme.secondaryBackground 
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
                      textContentType="password"
                    />
                    <TouchableOpacity 
                      onPress={() => setSecureText(!secureText)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={secureText ? "eye-off" : "eye"} 
                        size={24} 
                        color={theme.tint} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => router.push('/forgotpassword')}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={[styles.forgotPassword, { color: theme.tint }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
                      Signing in...
                    </Text>
                  </View>
                ) : (
                  <CustomButton
                    title="Sign In"
                    onPress={logIn}
                    variant={isInputValid ? "primary" : "secondary"}
                    style={!isInputValid ? styles.disabledButton : undefined}
                    disabled={!isInputValid}
                  />
                )}

                <CustomButton
                  title="Create Account"
                  onPress={() => router.push('/register')}
                  variant="secondary"
                  style={styles.registerButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    borderRadius: 60,
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
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
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
  registerButton: {
    marginTop: 16,
  },
});

export default index
