import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatINR } from '../format';
import { Summary } from '../types';

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{formatINR(value)}</Text>
    </View>
  );
}

export function SummaryCard({ summary }: { summary: Summary | null }) {
  const s = summary ?? { totalLent: '0', totalRepaid: '0', overdueAmount: '0', outstanding: '0' };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Outstanding</Text>
      <Text style={styles.big}>{formatINR(s.outstanding)}</Text>
      <View style={styles.row}>
        <Stat label="Total lent" value={s.totalLent} />
        <Stat label="Repaid" value={s.totalRepaid} color="#16A34A" />
        <Stat label="Overdue" value={s.overdueAmount} color={Number(s.overdueAmount) > 0 ? '#F87171' : undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { color: '#94A3B8', fontSize: 13 },
  big: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 2, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1 },
  label: { color: '#94A3B8', fontSize: 12 },
  value: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 2 },
});
