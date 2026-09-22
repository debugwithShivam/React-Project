import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants';
import api from '@/api/axios';
import { saveTokens } from '@/storage/authStorage';

const CITIES = ['Bangalore', 'Hyderabad', 'Delhi NCR', 'Mumbai', 'Pune', 'Chennai', 'Kolkata'];

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Two-Wheeler / Bike Taxi' },
  { value: 'auto', label: 'Three-Wheeler / Auto' },
  { value: 'cab_economy', label: 'Hatchback / Mini Cab' },
  { value: 'cab_premium', label: 'Sedan / Prime Cab' },
];

const DOC_SLOTS = [
  { key: 'dlFront', label: '1. Driving License (Front)' },
  { key: 'rcFront', label: '2. Vehicle RC (Front)' },
  { key: 'aadhaarFront', label: '3. Aadhaar ID (Front)' },
  { key: 'insuranceFront', label: '4. Insurance Policy (Front)' },
] as const;

type DocKey = typeof DOC_SLOTS[number]['key'];

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'Bangalore',
    vehicleType: 'bike',
    vehicleModel: '',
    vehiclePlate: '',
    drivingLicense: '',
    aadhaarNumber: '',
    payoutUpi: '',
    agreeTerms: false,
  });

  const [documents, setDocuments] = useState<Partial<Record<DocKey, ImagePicker.ImagePickerAsset>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof typeof formData, value: any) => setFormData((p) => ({ ...p, [key]: value }));

  const pickDocument = async (key: DocKey) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo/library access to upload documents.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]) {
        setDocuments((p) => ({ ...p, [key]: result.assets[0] }));
      }
    } catch (e) {
      Alert.alert('Picker error', 'Unable to open the document picker.');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!formData.fullname || !formData.phone) {
      Alert.alert('Missing details', 'Please fill the required fields!');
      return;
    }
    if (!formData.password) {
      Alert.alert('Missing password', 'Please create a password!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match!');
      return;
    }
    if (!formData.agreeTerms) {
      Alert.alert('Terms', "Please accept Terms of Service and Privacy Policy.");
      return;
    }
    if (!formData.vehiclePlate || !formData.drivingLicense) {
      Alert.alert('KYC required', 'Vehicle plate and driving license are required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.fullname.trim());
      data.append('phone', formData.phone.trim());
      data.append('email', formData.email.trim() || '');
      data.append('password', formData.password);
      data.append('role', 'DRIVER');
      data.append('city', formData.city);
      data.append('vehicleType', formData.vehicleType);
      data.append('vehicleModel', formData.vehicleModel.trim());
      data.append('vehiclePlate', formData.vehiclePlate.trim().toUpperCase());
      data.append('drivingLicense', formData.drivingLicense.trim().toUpperCase());
      data.append('aadhaarNumber', formData.aadhaarNumber.trim() || '');
      data.append('payoutUpi', formData.payoutUpi.trim() || '');

      DOC_SLOTS.forEach(({ key }) => {
        const asset = documents[key];
        if (asset?.uri) {
          data.append(key, {
            uri: asset.uri,
            name: asset.fileName || `${key}.jpg`,
            type: asset.mimeType || 'image/jpeg',
          } as any);
        }
      });

      const res = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { accessToken, refreshToken } = res.data || {};
      if (accessToken && refreshToken) await saveTokens(accessToken, refreshToken);
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Registration failed', e?.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={72} color={COLORS.green} />
          <Text style={styles.successTitle}>Application & KYC Submitted!</Text>
          <Text style={styles.successText}>
            Thank you {formData.fullname}. Your driver application has been submitted and is currently pending verification.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/dashboard')}>
            <Text style={styles.primaryText}>Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={19} color={COLORS.ink} />
          </Pressable>
          <Pressable onPress={() => router.replace('/')} style={{ marginTop: 16 }}>
            <Text style={styles.switchLink}>Log In directly →</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Top Banner */}
          <View style={styles.banner}>
            <View style={styles.logo}><Ionicons name="bicycle" size={26} color={COLORS.ink} /></View>
            <Text style={styles.bannerTitle}>Register as Captain Partner</Text>
            <Text style={styles.bannerSub}>Complete KYC & start earning up to ₹35,000/month</Text>
          </View>

          <View style={styles.form}>
            <Field icon="person-outline" label="Full Name *" placeholder="e.g. Vikramaditya Singh" value={formData.fullname} onChangeText={(t) => set('fullname', t)} />
            <Field icon="call-outline" label="Mobile Phone *" placeholder="+91 98765 43210" value={formData.phone} onChangeText={(t) => set('phone', t.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />
            <Field icon="mail-outline" label="Email (Optional)" placeholder="vikram@mail.com" value={formData.email} onChangeText={(t) => set('email', t)} keyboardType="email-address" autoCapitalize="none" />

            <View style={styles.gridRow}>
              <View style={{ flex: 1 }}>
                <Field icon="lock-closed-outline" label="Password *" placeholder="Create password" value={formData.password} onChangeText={(t) => set('password', t)} secureTextEntry />
              </View>
              <View style={{ flex: 1 }}>
                <Field icon="lock-closed-outline" label="Confirm Password *" placeholder="Confirm password" value={formData.confirmPassword} onChangeText={(t) => set('confirmPassword', t)} secureTextEntry />
              </View>
            </View>

            {/* City */}
            <Text style={styles.label}>Operating City</Text>
            <View style={styles.chipWrap}>
              {CITIES.map((c) => (
                <Pressable key={c} style={[styles.chip, formData.city === c && styles.chipActive]} onPress={() => set('city', c)}>
                  <Text style={[styles.chipText, formData.city === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            {/* KYC Section */}
            <View style={styles.kycBox}>
              <Text style={styles.kycHeading}>DRIVER KYC & VEHICLE VERIFICATION</Text>

              <Text style={styles.label}>Vehicle Category</Text>
              <View style={styles.chipWrap}>
                {VEHICLE_TYPES.map((v) => (
                  <Pressable key={v.value} style={[styles.chip, formData.vehicleType === v.value && styles.chipActive]} onPress={() => set('vehicleType', v.value)}>
                    <Text style={[styles.chipText, formData.vehicleType === v.value && styles.chipTextActive]}>{v.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Field icon="car-outline" label="Vehicle Model Name" placeholder="e.g. Hero Splendor Plus" value={formData.vehicleModel} onChangeText={(t) => set('vehicleModel', t)} />
              <Field icon="pricetag-outline" label="Vehicle Plate No. *" placeholder="KA 03 EX 1234" value={formData.vehiclePlate} onChangeText={(t) => set('vehiclePlate', t.toUpperCase())} autoCapitalize="characters" />
              <Field icon="document-outline" label="Driving License No. *" placeholder="DL-0420110012345" value={formData.drivingLicense} onChangeText={(t) => set('drivingLicense', t.toUpperCase())} autoCapitalize="characters" />
              <Field icon="id-card-outline" label="Aadhaar Number" placeholder="XXXX XXXX XXXX" value={formData.aadhaarNumber} onChangeText={(t) => set('aadhaarNumber', t.replace(/[^0-9]/g, '').slice(0, 12))} keyboardType="number-pad" maxLength={12} />

              {/* Documents */}
              <Text style={styles.label}>Upload Required Documents (Front & Back)</Text>
              <View style={styles.docGrid}>
                {DOC_SLOTS.map(({ key, label }) => {
                  const asset = documents[key];
                  return (
                    <Pressable key={key} style={styles.docBox} onPress={() => pickDocument(key)}>
                      {asset?.uri ? (
                        <Image source={{ uri: asset.uri }} style={styles.docPreview} resizeMode="cover" />
                      ) : (
                        <Ionicons name="camera-outline" size={24} color="#9A9E9B" />
                      )}
                      <Text style={styles.docLabel} numberOfLines={2}>{label}</Text>
                      {asset?.uri && <Ionicons name="checkmark-circle" size={16} color={COLORS.green} style={styles.docCheck} />}
                    </Pressable>
                  );
                })}
              </View>

              {/* Payout */}
              <Text style={styles.label}>Earnings Payout (UPI ID or Bank Account)</Text>
              <Field icon="card-outline" placeholder="e.g. 9876543210@paytm or Account No." value={formData.payoutUpi} onChangeText={(t) => set('payoutUpi', t)} />
              <Text style={styles.hint}>Daily automatic earnings settlements directly to your bank account.</Text>
            </View>

            {/* Terms */}
            <Pressable style={styles.termsRow} onPress={() => set('agreeTerms', !formData.agreeTerms)}>
              <View style={[styles.checkbox, formData.agreeTerms && styles.checkboxOn]}>
                {formData.agreeTerms && <Ionicons name="checkmark" size={14} color={COLORS.ink} />}
              </View>
              <Text style={styles.termsText}>
                I agree to Sawaari's <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </Pressable>

            <Pressable style={[styles.primaryButton, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={COLORS.ink} />
              ) : (
                <Text style={styles.primaryText}>Submit Captain KYC Application</Text>
              )}
              {!submitting && <Ionicons name="arrow-forward" size={19} color={COLORS.ink} />}
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already registered?</Text>
            <Pressable onPress={() => router.replace('/')}><Text style={styles.switchLink}> Log In directly →</Text></Pressable>
          </View>

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={17} color={COLORS.green} />
            <Text style={styles.trust}>Your data is encrypted and secure</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, label, ...props }: { icon: keyof typeof Ionicons.glyphMap; label?: string } & ComponentProps<typeof TextInput>) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.field}>
        <Ionicons name={icon} size={19} color="#9A9E9B" />
        <TextInput {...props} placeholderTextColor="#9A9E9B" style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ink },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingTop: 20, paddingBottom: 40 },
  banner: { alignItems: 'center', backgroundColor: COLORS.inkSoft, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2C3130' },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  bannerSub: { color: '#A9AEAB', fontSize: 12, marginTop: 6, textAlign: 'center' },
  form: { marginTop: 20, gap: 12 },
  label: { color: '#C4CAC7', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  field: { height: 54, borderRadius: 14, backgroundColor: '#202526', borderWidth: 1, borderColor: '#303636', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12 },
  input: { flex: 1, fontSize: 14, color: '#fff' },
  gridRow: { flexDirection: 'row', gap: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 10, backgroundColor: '#202526', borderWidth: 1, borderColor: '#303636' },
  chipActive: { backgroundColor: COLORS.yellow, borderColor: COLORS.yellow },
  chipText: { color: '#9A9E9B', fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: COLORS.ink },
  kycBox: { backgroundColor: 'rgba(245,197,24,0.08)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(245,197,24,0.35)', gap: 12, marginTop: 6 },
  kycHeading: { color: COLORS.yellow, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  docBox: { width: '47%', aspectRatio: 1.2, borderRadius: 14, backgroundColor: '#202526', borderWidth: 1, borderColor: '#303636', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' },
  docPreview: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  docLabel: { color: '#9A9E9B', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  docCheck: { position: 'absolute', top: 6, right: 6 },
  hint: { color: '#727976', fontSize: 10 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#4A514E', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: COLORS.yellow, borderColor: COLORS.yellow },
  termsText: { flex: 1, color: '#929896', fontSize: 11, lineHeight: 16 },
  termsLink: { color: '#D3D8D5', fontWeight: '700', textDecorationLine: 'underline' },
  primaryButton: { height: 56, backgroundColor: COLORS.yellow, borderRadius: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  primaryText: { color: COLORS.ink, fontSize: 15, fontWeight: '900' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  switchText: { color: '#929896', fontSize: 13 },
  switchLink: { color: COLORS.yellow, fontSize: 13, fontWeight: '800' },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24 },
  trust: { color: '#727976', fontSize: 12 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 18, textAlign: 'center' },
  successText: { color: '#A9AEAB', fontSize: 14, lineHeight: 20, marginTop: 12, textAlign: 'center' },
});
