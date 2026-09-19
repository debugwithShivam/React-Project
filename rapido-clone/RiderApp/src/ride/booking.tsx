import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BookingScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const handleContinue = () => {
    if (!pickup.trim() || !destination.trim()) {
      return;
    }

    router.push('/ride/searching');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/main/home');
  }
}}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Book a Ride</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Where are you going?</Text>
        <Text style={styles.subtitle}>
          Enter your pickup and destination
        </Text>

        <View style={styles.locationCard}>
          <View style={styles.inputRow}>
            <View style={styles.dotPickup} />

            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#999999"
              value={pickup}
              onChangeText={setPickup}
            />
          </View>

          <View style={styles.line} />

          <View style={styles.inputRow}>
            <View style={styles.dotDestination} />

            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor="#999999"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!pickup.trim() || !destination.trim()) &&
              styles.continueButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!pickup.trim() || !destination.trim()}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
    marginBottom: 24,
  },

  locationCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
    paddingHorizontal: 12,
  },

  dotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111111',
  },

  dotDestination: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },

  line: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginLeft: 5,
  },

  continueButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  continueButtonDisabled: {
    backgroundColor: '#aaaaaa',
  },

  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});