import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '@/api/axios';
import { COLORS } from '@/constants';

const DOC_TYPES = [
  { type: 'DRIVING_LICENSE', label: 'Driving License', sides: ['FRONT', 'BACK'] },
  { type: 'RC', label: 'Registration Certificate', sides: ['FRONT', 'BACK'] },
  { type: 'AADHAAR', label: 'Aadhaar Card', sides: ['FRONT', 'BACK'] },
  { type: 'INSURANCE', label: 'Insurance', sides: ['FRONT'] },
  { type: 'SELFIE', label: 'Selfie', sides: ['FRONT'] },
];

export default function KycScreen() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState('PENDING');

  const load = async () => {
    try {
      const [docsRes, profileRes] = await Promise.all([
        api.get('/driver/documents'),
        api.get('/driver/profile'),
      ]);
      setDocuments(docsRes.data?.documents || []);
      setStatus(profileRes.data?.driver?.kyc_status || 'PENDING');
    } catch (e: any) {
      console.log('KYC LOAD ERROR', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pickAndUpload = async (docType: string, side: string) => {
    const key = `${docType}_${side}`;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to upload documents.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setUploading(key);
      const form = new FormData();
      form.append('document', { uri: asset.uri, name: asset.fileName || `${docType}_${side}.jpg`, type: asset.mimeType || 'image/jpeg' } as any);
      form.append('documentType', docType);
      form.append('documentSide', side);
      await api.post('/driver/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Uploaded', `${docType} ${side} submitted for review.`);
      await load();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setUploading(null);
    }
  };

  const findDoc = (type: string, side: string) =>
    documents.find((d) => d.document_type === type && (d.document_side || 'FRONT') === side);

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusBanner, status === 'APPROVED' && { backgroundColor: '#E1F2E9', borderColor: COLORS.green }]}>
          <Ionicons name={status === 'APPROVED' ? 'checkmark-circle' : status === 'REJECTED' ? 'close-circle' : 'time-outline'} size={22} color={status === 'APPROVED' ? COLORS.green : status === 'REJECTED' ? COLORS.red : COLORS.muted} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.statusTitle}>Status: {status}</Text>
            <Text style={styles.statusHint}>
              {status === 'APPROVED' ? 'You can go online and receive rides.' : status === 'REJECTED' ? 'Some documents were rejected. Re-upload them.' : 'Documents are under review by admin.'}
            </Text>
          </View>
        </View>

        {DOC_TYPES.map((doc) => (
          <View key={doc.type} style={styles.docCard}>
            <Text style={styles.docTitle}>{doc.label}</Text>
            <View style={styles.sidesRow}>
              {doc.sides.map((side) => {
                const existing = findDoc(doc.type, side);
                const key = `${doc.type}_${side}`;
                return (
                  <TouchableOpacity key={side} style={styles.sideBox} onPress={() => pickAndUpload(doc.type, side)} disabled={uploading === key}>
                    {uploading === key ? (
                      <ActivityIndicator color={COLORS.ink} />
                    ) : existing?.file_data ? (
                      <Image source={{ uri: `data:${existing.mime_type || 'image/jpeg'};base64,${existing.file_data}` }} style={styles.preview} resizeMode="cover" />
                    ) : (
                      <Ionicons name="camera-outline" size={26} color={COLORS.muted} />
                    )}
                    <Text style={styles.sideLabel}>{side}</Text>
                    {existing && <Text style={[styles.sideStatus, existing.status === 'APPROVED' && { color: COLORS.green }, existing.status === 'REJECTED' && { color: COLORS.red }]}>{existing.status}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { backgroundColor: COLORS.ink, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 40 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8DC', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: '#F5E6A8' },
  statusTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 14 },
  statusHint: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  docCard: { backgroundColor: COLORS.paper, borderRadius: 16, padding: 16, marginBottom: 12 },
  docTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 15, marginBottom: 12 },
  sidesRow: { flexDirection: 'row', gap: 12 },
  sideBox: { flex: 1, aspectRatio: 1.4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF8', overflow: 'hidden' },
  preview: { width: '100%', height: '100%', position: 'absolute' },
  sideLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginTop: 6 },
  sideStatus: { fontSize: 10, fontWeight: '800', color: COLORS.muted, marginTop: 2 },
});
