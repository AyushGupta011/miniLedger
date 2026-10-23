import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { requestOtp, verifyOtp } from '../api';
import { Screen } from '../components/Screen';

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [digits, setDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const phone = `+91${digits}`;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = () =>
    run(async () => {
      if (!/^[6-9]\d{9}$/.test(digits)) throw new Error('Enter a valid 10-digit mobile number');
      await requestOtp(phone);
      setStep('otp');
    });

  const submitOtp = () =>
    run(async () => {
      if (!/^\d{6}$/.test(otp)) throw new Error('Enter the 6-digit OTP');
      await verifyOtp(phone, otp);
      onLoggedIn();
    });

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.logo}>MiniLedger</Text>
        <Text style={styles.sub}>Track money you lend to friends</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Mobile number</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={[styles.input, styles.flex]}
                keyboardType="number-pad"
                maxLength={10}
                value={digits}
                onChangeText={setDigits}
                placeholder="9876543210"
              />
            </View>
            <Button title="Send OTP" onPress={sendOtp} loading={loading} />
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP sent to {phone}</Text>
            <Text style={styles.hint}>(Mock OTP: look for it in the backend server log)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholder="6-digit OTP"
              autoFocus
            />
            <Button title="Verify & Login" onPress={submitOtp} loading={loading} />
            <Pressable onPress={() => { setStep('phone'); setOtp(''); }}>
              <Text style={styles.link}>Change number</Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

function Button({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) {
  return (
    <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 34, fontWeight: '800', color: '#1E293B' },
  sub: { fontSize: 15, color: '#64748B', marginBottom: 32, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefix: { fontSize: 16, fontWeight: '600', color: '#334155' },
  flex: { flex: 1 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, fontSize: 16 },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#2563EB', textAlign: 'center', marginTop: 16 },
});
