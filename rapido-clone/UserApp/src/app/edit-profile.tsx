import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/api/axios';

type Profile = { name: string; email: string | null; phone: string; city: string | null };

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get('/users/me').then(({ data }) => setProfile({ name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '', city: data.user.city || '' }))
      .catch(() => Alert.alert('Profile unavailable', 'Please check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);
  const save = async () => {
    if (!profile.name.trim()) return Alert.alert('Name required', 'Please enter your name.');
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email.trim())) return Alert.alert('Invalid email', 'Please check your email address.');
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', { name: profile.name.trim(), email: profile.email?.trim() || null, city: profile.city?.trim() || null });
      setProfile({ name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '', city: data.user.city || '' });
      Alert.alert('Saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) { Alert.alert('Could not save', error?.response?.data?.message || 'Please try again.'); }
    finally { setSaving(false); }
  };
  return <SafeAreaView style={s.safe}>
    <Stack.Screen options={{ title: 'Edit Profile', headerShown: true, headerBackTitle: 'Profile' }} />
    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#111" /> : <ScrollView contentContainerStyle={s.body}>
      <Text style={s.hint}>Update the details linked to your Sawaari account.</Text>
      <Field label="Full name" value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })} />
      <Field label="Email" value={profile.email || ''} keyboardType="email-address" autoCapitalize="none" onChangeText={(email) => setProfile({ ...profile, email })} />
      <Field label="Phone number" value={profile.phone} editable={false} />
      <Text style={s.readonly}>Your verified phone number cannot be changed here.</Text>
      <Field label="City" value={profile.city || ''} onChangeText={(city) => setProfile({ ...profile, city })} />
      <TouchableOpacity style={s.button} disabled={saving} onPress={save}>{saving ? <ActivityIndicator color="#111" /> : <Text style={s.buttonText}>Save changes</Text>}</TouchableOpacity>
    </ScrollView>}
  </SafeAreaView>;
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  return <View style={s.field}><Text style={s.label}>{props.label}</Text><TextInput {...props} style={[s.input, props.editable === false && s.disabled]} placeholder={`Enter ${props.label.toLowerCase()}`} placeholderTextColor="#999" /></View>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#fff' }, body: { padding: 20 }, hint: { color: '#777', marginBottom: 24, fontSize: 14 }, field: { marginBottom: 18 }, label: { color: '#333', fontWeight: '700', marginBottom: 7 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 14, height: 50, color: '#111', fontSize: 15 }, disabled: { backgroundColor: '#f5f5f5', color: '#888' }, readonly: { color: '#888', fontSize: 12, marginTop: -12, marginBottom: 18 }, button: { height: 52, backgroundColor: '#FACC15', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, buttonText: { color: '#111', fontWeight: '800', fontSize: 16 } });
