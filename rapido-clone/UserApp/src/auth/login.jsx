import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import api from '@/api/axios';
import { saveTokens } from '@/storage/authStorage';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return; // prevent duplicate submissions

    if (!identifier.trim() || !password.trim()) {
      Alert.alert(
        'Login Required',
        'Please enter your mobile/email and password.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
        role: 'USER',
      });

      await saveTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      Alert.alert(
        'Login Successful',
        `Welcome ${response.data?.user?.name || 'to Sawaari'}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/main/home'),
          },
        ]
      );
    } catch (error) {
      // Do not log the error object — it may contain credentials in the request config.
      Alert.alert(
        'Login Failed',
        error?.response?.data?.message || 'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.title}>Welcome to Sawaari</Text>

          <Text style={styles.subtitle}>
            Login to book your ride
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Mobile Number or Email</Text>

            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter mobile number or email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#999"
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Logging in…' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.signupLink}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },

  logoText: {
    color: '#FACC15',
    fontSize: 32,
    fontWeight: '800',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },

  form: {
    marginTop: 36,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111111',
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  loginButtonDisabled: {
    opacity: 0.5,
  },

  loginButtonText: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: '800',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  signupText: {
    fontSize: 14,
    color: '#666666',
  },

  signupLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    marginLeft: 5,
  },
});