import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, type ComponentProps } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants';
import api from '@/api/axios';
import { saveTokens, getAccessToken, wasExplicitlySignedOut } from '@/storage/authStorage';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const [token, signedOut] = await Promise.all([getAccessToken(), wasExplicitlySignedOut()]);
      if (token && !signedOut) {
        try {
          await api.get('/driver/profile');
          router.replace('/dashboard');
          return;
        } catch { /* fall through to login */ }
      }
      setChecking(false);
    })();
  }, []);

const submit = async () => {
  if (busy) return;

  const value = identifier.trim();

  if (!value || password.length < 6) {
    Alert.alert(
      'Check your details',
      'Enter your email/mobile number and a password of at least 6 characters.'
    );
    return;
  }

  setBusy(true);

  try {
    console.log('LOGIN REQUEST:', {
      identifier: value,
      role: 'DRIVER',
    });

    const res = await api.post('/auth/login', {
      identifier: value,
      password,
      role: 'DRIVER',
    });

    console.log('LOGIN RESPONSE:', res.data);

    const {
      accessToken,
      refreshToken,
      user,
    } = res.data;

    if (user?.role !== 'DRIVER') {
      Alert.alert(
        'Wrong app',
        'This account is not a captain account.'
      );
      return;
    }

    await saveTokens(
      accessToken,
      refreshToken
    );

    router.replace('/dashboard');

  } catch (e: any) {
    console.log(
      'LOGIN ERROR:',
      e?.response?.data || e
    );


    Alert.alert(
      'Login failed',
      e?.response?.data?.message ||
      'Please try again.'
    );

  } finally {
    setBusy(false);
  }
};

  if (checking) {
    return <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator color={COLORS.yellow} size="large" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.logo}><Ionicons name="flash" size={24} color={COLORS.ink} /></View>
            <Text style={styles.brand}>SAWAARI <Text style={styles.brandAccent}>CAPTAIN</Text></Text>
          </View>
          <View style={styles.heroShape}><Ionicons name="bicycle" size={92} color={COLORS.yellow} /></View>
          <Text style={styles.eyebrow}>EARN ON YOUR TERMS</Text>
          <Text style={styles.title}>Ready to ride?</Text>
          <Text style={styles.subtitle}>Sign in to start earning with every trip.</Text>

          <View style={styles.form}>
           <Field
  icon="person-outline"
  placeholder="Email or mobile number"
  value={identifier}
  onChangeText={setIdentifier}
  autoCapitalize="none"
  autoCorrect={false}
/>
            <Field icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Pressable style={[styles.primaryButton, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
              {busy ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.primaryText}>Sign in</Text>}
              {!busy && <Ionicons name="arrow-forward" size={19} color={COLORS.ink} />}
            </Pressable>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New to Sawaari?</Text>
            <Pressable onPress={() => router.push('/signup')}><Text style={styles.switchLink}> Create account</Text></Pressable>
          </View>
          <View style={styles.trustRow}><Ionicons name="shield-checkmark" size={17} color={COLORS.green} /><Text style={styles.trust}>Your data is encrypted and secure</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Ionicons name={icon} size={19} color={COLORS.muted} /><TextInput {...props} placeholderTextColor="#9A9E9B" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ink }, flex: { flex: 1 }, content: { flexGrow: 1, padding: 24, paddingTop: 26, paddingBottom: 30 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logo: { width: 42, height: 42, borderRadius: 13, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center' }, brand: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 1 }, brandAccent: { color: COLORS.yellow, fontSize: 10, letterSpacing: 1.4 },
  heroShape: { height: 150, marginTop: 34, marginBottom: 24, borderRadius: 28, backgroundColor: COLORS.inkSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2C3130' }, eyebrow: { color: COLORS.yellow, fontSize: 11, fontWeight: '800', letterSpacing: 2 }, title: { color: '#fff', fontSize: 38, lineHeight: 43, fontWeight: '900', marginTop: 8 }, subtitle: { color: '#A9AEAB', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 300 }, form: { marginTop: 28, gap: 12 }, field: { height: 56, borderRadius: 15, backgroundColor: '#202526', borderWidth: 1, borderColor: '#303636', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }, input: { flex: 1, fontSize: 15, color: '#fff' }, primaryButton: { height: 57, backgroundColor: COLORS.yellow, borderRadius: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }, primaryText: { color: COLORS.ink, fontSize: 16, fontWeight: '900' }, switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 }, switchText: { color: '#929896', fontSize: 14 }, switchLink: { color: COLORS.yellow, fontSize: 14, fontWeight: '800' }, trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 32 }, trust: { color: '#727976', fontSize: 12 },
});
