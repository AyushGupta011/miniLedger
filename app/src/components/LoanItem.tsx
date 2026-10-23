import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../config';
import { formatINR, prettyDate } from '../format';
import { Loan } from '../types';

type Props = { loan: Loan; busy: boolean; onRepay: (loan: Loan) => void };

export function LoanItem({ loan, busy, onRepay }: Props) {
  const repaid = loan.status === 'REPAID';
  return (
    <View style={[styles.card, loan.isOverdue && styles.overdue, repaid && styles.repaid]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={styles.name}>{loan.friendName}</Text>
          <Text style={styles.due}>
            {repaid ? 'Repaid' : loan.isOverdue ? 'Was due' : 'Due'} {prettyDate(loan.dueDate)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatINR(loan.amount)}</Text>
          {loan.isOverdue && <Text style={[styles.badge, styles.badgeRed]}>OVERDUE</Text>}
          {repaid && <Text style={[styles.badge, styles.badgeGreen]}>REPAID</Text>}
        </View>
      </View>

      <View style={styles.bottom}>
        {loan.receiptUrl ? <Image source={{ uri: `${API_URL}${loan.receiptUrl}` }} style={styles.thumb} /> : <View />}
        {!repaid && (
          <Pressable style={[styles.btn, busy && { opacity: 0.5 }]} disabled={busy} onPress={() => onRepay(loan)}>
            <Text style={styles.btnText}>{busy ? 'Saving…' : 'Mark repaid'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  overdue: { backgroundColor: '#FEF2F2', borderColor: '#DC2626', borderLeftWidth: 5 },
  repaid: { opacity: 0.65 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  flex: { flex: 1 },
  right: { alignItems: 'flex-end' },
  name: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  due: { fontSize: 13, color: '#64748B', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  badge: { fontSize: 11, fontWeight: '700', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  badgeRed: { color: '#fff', backgroundColor: '#DC2626' },
  badgeGreen: { color: '#166534', backgroundColor: '#DCFCE7' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2E8F0' },
  btn: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
