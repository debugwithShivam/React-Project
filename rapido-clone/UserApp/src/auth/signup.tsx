import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import api from '@/api/axios';

export default function SignupScreen() {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [saving, setSaving] = useState(false);

	const submit = async () => {
		if (!name.trim() || !/^\d{10}$/.test(phone) || password.length < 6) {
			Alert.alert('Check details', 'Enter your name, a valid 10-digit phone and a 6+ character password.');
			return;
		}
		try {
			setSaving(true);
			await api.post('/auth/register', { name: name.trim(), phone, email: email.trim() || undefined, password, role: 'USER' });
			Alert.alert('Account created', 'You can now login.', [{ text: 'Continue', onPress: () => router.replace('/') }]);
		} catch (error: any) {
			Alert.alert('Signup failed', error?.response?.data?.message || 'Unable to create account.');
		} finally { setSaving(false); }
	};

	return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
		<ScrollView contentContainerStyle={styles.content}>
			<Text style={styles.title}>Create your account</Text>
			<Text style={styles.subtitle}>Book rides faster with Sawaari.</Text>
			<TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
			<TextInput style={styles.input} placeholder="10-digit mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} />
			<TextInput style={styles.input} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
			<TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
			<TouchableOpacity style={styles.button} onPress={submit} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Creating...' : 'Create account'}</Text></TouchableOpacity>
			<TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Already have an account? Login</Text></TouchableOpacity>
		</ScrollView>
	</KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
	title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
	subtitle: { color: '#666', marginBottom: 28 },
	input: { height: 52, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, color: '#111' },
	button: { height: 52, borderRadius: 12, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
	buttonText: { color: '#FACC15', fontWeight: '800', fontSize: 16 },
	back: { textAlign: 'center', marginTop: 22, color: '#111', fontWeight: '700' },
});
