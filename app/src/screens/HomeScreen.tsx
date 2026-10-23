import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getLoans, getSummary, repayLoan } from '../api';
import { LoanItem } from '../components/LoanItem';
import { Screen } from '../components/Screen';
import { SummaryCard } from '../components/SummaryCard';
import { formatINR } from '../format';
import { Loan, Summary } from '../types';
import { AddLoanScreen } from './AddLoanScreen';

export function HomeScreen({ onLogout }: { onLogout: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([getLoans(), getSummary()]);
      setLoans(l);
      setSummary(s);
    } catch (e) {
      Alert.alert('Could not load', (e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmRepay = (loan: Loan) =>
    Alert.alert('Mark as repaid?', `${loan.friendName} paid back ${formatINR(loan.amount)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, repaid',
        onPress: async () => {
          setRepayingId(loan.id);
          try {
            await repayLoan(loan.id);
            await load(); // refetch so the summary and ordering stay server-driven
          } catch (e) {
            Alert.alert('Error', (e as Error).message);
          } finally {
            setRepayingId(null);
          }
        },
      },
    ]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>MiniLedger</Text>
        <Pressable onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<SummaryCard summary={summary} />}
          ListEmptyComponent={<Text style={styles.empty}>No entries yet. Tap “+ Add” to record a loan.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }) => <LoanItem loan={item} busy={repayingId === item.id} onRepay={confirmRepay} />}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setAdding(true)}>
        <Text style={styles.fabText}>+ Add</Text>
      </Pressable>

      <Modal visible={adding} animationType="slide" onRequestClose={() => setAdding(false)}>
        <AddLoanScreen
          onClose={() => setAdding(false)}
          onCreated={() => { setAdding(false); load(); }}
        />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  logout: { color: '#DC2626', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 24 },
  fab: { position: 'absolute', right: 20, bottom: 28, backgroundColor: '#2563EB', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 30, elevation: 4 },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
