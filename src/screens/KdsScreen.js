import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

const MOCK_ORDERS = [
  { id: '1', number: 42, table: 'Mesa 3', status: 'pendiente', items: ['2x Burger Clásica', '1x Coca-Cola'], createdAt: new Date(Date.now() - 8 * 60000) },
  { id: '2', number: 43, customer: 'Juan P.', status: 'en_proceso', items: ['1x Margarita', '1x Ensalada César', '2x Jugo Natural'], createdAt: new Date(Date.now() - 5 * 60000) },
  { id: '3', number: 44, table: 'Mesa 7', status: 'pendiente', items: ['3x Pepperoni', '1x Brownie'], createdAt: new Date(Date.now() - 2 * 60000) },
  { id: '4', number: 45, table: 'Mesa 1', status: 'en_proceso', items: ['1x BBQ Bacon', '1x Doble Cheese'], createdAt: new Date(Date.now() - 12 * 60000) },
];

function elapsed(date) {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}

function TimerBadge({ date }) {
  const mins = elapsed(date);
  const color = mins >= 15 ? Colors.error : mins >= 10 ? Colors.warning : Colors.textSecondary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name="timer-outline" size={14} color={color} />
      <Text style={{ color, fontSize: 13, fontWeight: '600' }}>{mins}m</Text>
    </View>
  );
}

function OrderCard({ order, onAction }) {
  const mins = elapsed(order.createdAt);
  const borderColor = mins >= 15 ? Colors.error : mins >= 10 ? Colors.warning : Colors.cardBorder;
  const isPending = order.status === 'pendiente';

  return (
    <View style={[styles.card, { borderColor, borderWidth: mins >= 10 ? 2 : 1 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.orderNumBadge}>
          <Text style={styles.orderNumText}>#{String(order.number).padStart(4, '0')}</Text>
        </View>
        <Text style={styles.tableName}>{order.table || order.customer || 'Sin mesa'}</Text>
        <TimerBadge date={order.createdAt} />
      </View>
      <View style={styles.divider} />
      {order.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <View style={styles.itemDot} />
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: isPending ? Colors.statusInProgress : Colors.statusReady }]}
        onPress={() => onAction(order.id, isPending ? 'en_proceso' : 'listo')}
      >
        <Ionicons name={isPending ? 'play' : 'checkmark-circle'} size={16} color="#fff" />
        <Text style={styles.actionBtnText}>{isPending ? 'Iniciar' : 'Listo'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function KdsScreen() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [, setTick] = useState(0);

  // Refresh timer every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id, newStatus) => {
    if (newStatus === 'listo') {
      setOrders(prev => prev.filter(o => o.id !== id));
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const pending = orders.filter(o => o.status === 'pendiente');
  const inProgress = orders.filter(o => o.status === 'en_proceso');

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🍳 KDS — Cocina</Text>
          <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>En vivo</Text></View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyText}>No hay órdenes pendientes</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍳 KDS — Cocina</Text>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>En vivo</Text></View>
      </View>
      <View style={styles.columns}>
        {/* Pending Column */}
        <View style={styles.column}>
          <View style={[styles.colHeader, { borderBottomColor: Colors.statusPending + '50' }]}>
            <View style={[styles.colDot, { backgroundColor: Colors.statusPending }]} />
            <Text style={[styles.colTitle, { color: Colors.statusPending }]}>PENDIENTES</Text>
            <View style={[styles.colCount, { backgroundColor: Colors.statusPending + '25' }]}>
              <Text style={[styles.colCountText, { color: Colors.statusPending }]}>{pending.length}</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.colContent}>
            {pending.map(o => <OrderCard key={o.id} order={o} onAction={handleAction} />)}
          </ScrollView>
        </View>
        <View style={styles.colDivider} />
        {/* In Progress Column */}
        <View style={styles.column}>
          <View style={[styles.colHeader, { borderBottomColor: Colors.statusInProgress + '50' }]}>
            <View style={[styles.colDot, { backgroundColor: Colors.statusInProgress }]} />
            <Text style={[styles.colTitle, { color: Colors.statusInProgress }]}>EN PROCESO</Text>
            <View style={[styles.colCount, { backgroundColor: Colors.statusInProgress + '25' }]}>
              <Text style={[styles.colCountText, { color: Colors.statusInProgress }]}>{inProgress.length}</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.colContent}>
            {inProgress.map(o => <OrderCard key={o.id} order={o} onAction={handleAction} />)}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '18', paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.success + '40' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success },
  liveText: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  columns: { flex: 1, flexDirection: 'row' },
  column: { flex: 1 },
  colDivider: { width: 1, backgroundColor: Colors.divider },
  colHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, gap: 6 },
  colDot: { width: 8, height: 8, borderRadius: 4 },
  colTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, flex: 1 },
  colCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  colCountText: { fontWeight: 'bold', fontSize: 13 },
  colContent: { padding: Spacing.sm },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  orderNumBadge: { backgroundColor: Colors.accent, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  orderNumText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  tableName: { flex: 1, color: Colors.textPrimary, fontWeight: '600', fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.divider, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  itemDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent },
  itemText: { color: Colors.textPrimary, fontSize: 13 },
  actionBtn: { borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 9, marginTop: 10 },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 18 },
});
