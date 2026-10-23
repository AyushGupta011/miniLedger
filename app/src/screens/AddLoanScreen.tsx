import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput,
} from 'react-native';
import { createLoan, uploadReceipt } from '../api';
import { Screen } from '../components/Screen';
import { prettyDate, toYmd } from '../format';

type Props = { onClose: () => void; onCreated: () => void };

export function AddLoanScreen({ onClose, onCreated }: Props) {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [receipt, setReceipt] = useState<{ uri: string; mimeType?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setReceipt({ uri: res.assets[0].uri, mimeType: res.assets[0].mimeType });
  };

  const submit = async () => {
    // Client-side checks for fast feedback; the server validates again (never trust the client).
    const value = Number(amount);
    if (!friendName.trim()) return Alert.alert('Missing name', 'Enter your friend’s name');
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || value <= 0) {
      return Alert.alert('Invalid amount', 'Enter a positive amount with up to 2 decimals');
    }
    setSaving(true);
    try {
      const loan = await createLoan({ friendName: friendName.trim(), amount: value, dueDate: toYmd(dueDate) });
      if (receipt) {
        try {
          await uploadReceipt(loan.id, receipt.uri, receipt.mimeType);
        } catch (e) {
          Alert.alert('Saved, but receipt failed', (e as Error).message);
        }
      }
      onCreated();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add entry</Text>

          <Text style={styles.label}>Friend name</Text>
          <TextInput style={styles.input} value={friendName} onChangeText={setFriendName} placeholder="e.g. Rahul" />

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="500" />

          <Text style={styles.label}>Due date</Text>
          <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>{prettyDate(toYmd(dueDate))}</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              onChange={(_e, d) => {
                setShowPicker(Platform.OS === 'ios');
                if (d) setDueDate(d);
              }}
            />
          )}

          <Text style={styles.label}>Receipt photo (optional)</Text>
          <Pressable style={styles.secondary} onPress={pickReceipt}>
            <Text style={styles.secondaryText}>{receipt ? 'Change photo' : 'Choose photo'}</Text>
          </Pressable>
          {receipt && <Image source={{ uri: receipt.uri }} style={styles.preview} />}

          <Pressable style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save entry</Text>}
          </Pressable>
          <Pressable onPress={onClose} disabled={saving}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, fontSize: 16 },
  dateText: { fontSize: 16, color: '#0F172A' },
  secondary: { borderWidth: 1, borderColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center' },
  secondaryText: { color: '#2563EB', fontWeight: '600' },
  preview: { width: 120, height: 120, borderRadius: 10, marginTop: 10 },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 28 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { color: '#64748B', textAlign: 'center', marginTop: 16 },
});
