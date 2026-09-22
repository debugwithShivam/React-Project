import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { COLORS } from '@/constants';

export default function VehicleScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/driver/profile');
        const d = res.data?.driver;
        if (d) {
          setVehicleType(d.vehicle_type || 'BIKE');
          setModel(d.vehicle_model || '');
          setPlate(d.vehicle_plate || '');
          setYear(d.vehicle_year ? String(d.vehicle_year) : '');
          setColor(d.vehicle_color || '');
        }
      } catch (e: any) {
        console.log('VEHICLE LOAD ERROR', e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!model.trim() || !plate.trim()) { Alert.alert('Missing details', 'Vehicle model and plate are required.'); return; }
    setSaving(true);
    try {
      await api.patch('/driver/profile', {
        vehicleType,
        vehicleModel: model.trim(),
        vehiclePlate: plate.trim().toUpperCase(),
        vehicleYear: year ? Number(year) : null,
        vehicleColor: color.trim(),
      });
      Alert.alert('Saved', 'Vehicle details updated.');
      router.back();
    } catch (e: any) {
      Alert.alert('Save failed', e?.response?.data?.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={COLORS.yellow} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Vehicle type</Text>
          <View style={styles.typeRow}>
            {['BIKE', 'AUTO', 'CAB'].map((t) => (
              <TouchableOpacity key={t} style={[styles.typeChip, vehicleType === t && styles.typeChipActive]} onPress={() => setVehicleType(t)}>
                <Ionicons name={t === 'BIKE' ? 'bicycle-outline' : t === 'AUTO' ? 'car-outline' : 'car-sport-outline'} size={20} color={vehicleType === t ? COLORS.ink : COLORS.muted} />
                <Text style={[styles.typeText, vehicleType === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="e.g. Honda Activa" placeholderTextColor="#9A9E9B" />

          <Text style={styles.label}>Plate number</Text>
          <TextInput style={styles.input} value={plate} onChangeText={(t) => setPlate(t.toUpperCase())} placeholder="DL 01 AB 1234" placeholderTextColor="#9A9E9B" autoCapitalize="characters" />

          <Text style={styles.label}>Year</Text>
          <TextInput style={styles.input} value={year} onChangeText={(t) => setYear(t.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="2022" placeholderTextColor="#9A9E9B" keyboardType="number-pad" />

          <Text style={styles.label}>Color</Text>
          <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Red" placeholderTextColor="#9A9E9B" />

          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.saveText}>Save Vehicle</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { backgroundColor: COLORS.ink, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: COLORS.paper, borderRadius: 16, padding: 16 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 14 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { flex: 1, height: 70, borderRadius: 14, backgroundColor: '#F0EFEB', alignItems: 'center', justifyContent: 'center', gap: 6 },
  typeChipActive: { backgroundColor: COLORS.yellow },
  typeText: { color: COLORS.muted, fontWeight: '700', fontSize: 12 },
  typeTextActive: { color: COLORS.ink },
  input: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, fontSize: 15, color: COLORS.ink, backgroundColor: '#FAFAF8' },
  saveButton: { height: 52, borderRadius: 14, backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveText: { color: COLORS.ink, fontWeight: '800', fontSize: 15 },
});
