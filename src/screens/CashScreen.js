import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { useApp } from '../context/AppContext';

// ─── Mock open orders (in a real app these come from POS) ─────────────────────
const MOCK_ORDERS = [
  {
    id: 'ORD-044', number: 44, table: 'Mesa 3', items: [
      { name: 'Burger Clásica', qty: 2, priceUsd: 8.50 },
      { name: 'Coca-Cola', qty: 2, priceUsd: 2.00 },
    ]
  },
  {
    id: 'ORD-043', number: 43, customer: 'Juan P.', items: [
      { name: 'Margarita', qty: 1, priceUsd: 9.00 },
      { name: 'Ensalada César', qty: 1, priceUsd: 7.00 },
      { name: 'Jugo Natural', qty: 2, priceUsd: 3.50 },
    ]
  },
];

const TAX_RATE = 0.16; // 16% IVA Venezuela

const TRANSACTIONS = [
  { id: '1', type: 'venta', desc: 'Orden #0042', usd: 45.75, ves: 1669.87, time: '17:50' },
  { id: '2', type: 'venta', desc: 'Orden #0041', usd: 22.00, ves: 803.00, time: '17:20' },
  { id: '3', type: 'salida', desc: 'Pago proveedores', usd: -50.00, ves: 0, time: '16:15' },
  { id: '4', type: 'entrada', desc: 'Apertura de fondo', usd: 100.00, ves: 0, time: '09:00' },
];

export default function CashScreen() {
  const { exchangeRate } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [paidOrders, setPaidOrders] = useState([]);

  const openOrders = MOCK_ORDERS.filter(o => !paidOrders.includes(o.id));

  const openCheckout = (order) => {
    setSelectedOrder(order);
    setCheckoutVisible(true);
  };

  const handlePrint = () => {
    Alert.alert('🖨️ Imprimiendo', `Enviando a impresora de caja...`, [{ text: 'OK' }]);
  };

  const handleConfirmPayment = () => {
    if (selectedOrder) {
      setPaidOrders(prev => [...prev, selectedOrder.id]);
    }
    setCheckoutVisible(false);
    Alert.alert('✅ Cobro realizado', 'La orden fue marcada como pagada.', [{ text: 'OK' }]);
  };

  const balanceUsd = 245.50;
  const balanceVes = balanceUsd * exchangeRate;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Caja</Text>
        <View style={styles.ratePill}>
          <Ionicons name="swap-horizontal-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.rateText}>Bs {exchangeRate.toFixed(2)}/$</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Balance Row */}
        <View style={styles.balanceRow}>
          <View style={[styles.balanceCard, { borderColor: Colors.success + '40' }]}>
            <Text style={styles.balanceLabel}>Saldo USD</Text>
            <Text style={[styles.balanceAmount, { color: Colors.success }]}>${balanceUsd.toFixed(2)}</Text>
          </View>
          <View style={[styles.balanceCard, { borderColor: Colors.info + '40' }]}>
            <Text style={styles.balanceLabel}>Saldo Bs</Text>
            <Text style={[styles.balanceAmount, { color: Colors.info }]}>Bs {balanceVes.toFixed(0)}</Text>
          </View>
        </View>

        {/* Open Orders to Collect */}
        <Text style={styles.sectionTitle}>Órdenes Pendientes de Cobro</Text>

        {openOrders.length === 0
          ? <View style={styles.emptyOrders}>
              <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
              <Text style={styles.emptyOrdersText}>Sin órdenes pendientes</Text>
            </View>
          : openOrders.map(order => {
              const subtotal = order.items.reduce((s, i) => s + i.priceUsd * i.qty, 0);
              const tax = subtotal * TAX_RATE;
              const total = subtotal + tax;
              return (
                <TouchableOpacity key={order.id} style={styles.orderRow} onPress={() => openCheckout(order)}>
                  <View style={styles.orderNumBadge}>
                    <Text style={styles.orderNumText}>#{String(order.number).padStart(4, '0')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderName}>{order.table || order.customer}</Text>
                    <Text style={styles.orderItemCount}>{order.items.length} ítems</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={styles.orderTotal}>${total.toFixed(2)}</Text>
                    <Text style={styles.orderTotalVes}>Bs {(total * exchangeRate).toFixed(0)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              );
            })
        }

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Movimientos Recientes</Text>
        {TRANSACTIONS.map(tx => {
          const isIn = tx.type !== 'salida';
          const color = isIn ? Colors.success : Colors.error;
          return (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: color + '18' }]}>
                <Ionicons name={isIn ? 'arrow-down' : 'arrow-up'} size={16} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDesc}>{tx.desc}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color }]}>{tx.usd >= 0 ? '+' : ''}${tx.usd.toFixed(2)}</Text>
                {tx.ves !== 0 && <Text style={styles.txVes}>Bs {tx.ves.toFixed(0)}</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Checkout Modal ── */}
      {selectedOrder && (
        <Modal visible={checkoutVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.checkoutSheet}>
              {/* Header */}
              <View style={styles.checkoutHeader}>
                <View>
                  <Text style={styles.checkoutTitle}>Cobro de Orden</Text>
                  <Text style={styles.checkoutSubtitle}>
                    #{String(selectedOrder.number).padStart(4, '0')} · {selectedOrder.table || selectedOrder.customer}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {/* Line Items */}
                <View style={styles.itemsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHead, { flex: 3 }]}>Descripción</Text>
                    <Text style={[styles.tableHead, { width: 36, textAlign: 'center' }]}>Cant</Text>
                    <Text style={[styles.tableHead, { width: 64, textAlign: 'right' }]}>P.Unit</Text>
                    <Text style={[styles.tableHead, { width: 72, textAlign: 'right' }]}>Subtotal</Text>
                  </View>
                  {selectedOrder.items.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 3 }]}>{item.name}</Text>
                      <Text style={[styles.tableCell, { width: 36, textAlign: 'center' }]}>{item.qty}</Text>
                      <Text style={[styles.tableCell, { width: 64, textAlign: 'right' }]}>${item.priceUsd.toFixed(2)}</Text>
                      <Text style={[styles.tableCell, { width: 72, textAlign: 'right', color: Colors.textPrimary }]}>
                        ${(item.priceUsd * item.qty).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Totals */}
                {(() => {
                  const subtotal = selectedOrder.items.reduce((s, i) => s + i.priceUsd * i.qty, 0);
                  const tax = subtotal * TAX_RATE;
                  const total = subtotal + tax;
                  const totalVes = total * exchangeRate;
                  return (
                    <View style={styles.totalsBox}>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>IVA (16%)</Text>
                        <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.divider, { marginVertical: 10 }]} />
                      <View style={styles.totalRow}>
                        <Text style={styles.totalFinalLabel}>TOTAL USD</Text>
                        <Text style={styles.totalFinalUsd}>${total.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.totalBsBox]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.totalBsLabel}>TOTAL Bs</Text>
                          <Text style={styles.totalBsRate}>Tasa: Bs {exchangeRate.toFixed(2)} / $1</Text>
                        </View>
                        <Text style={styles.totalBsAmount}>Bs {totalVes.toFixed(2)}</Text>
                      </View>
                    </View>
                  );
                })()}
              </ScrollView>

              {/* Actions */}
              <View style={styles.checkoutActions}>
                <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
                  <Ionicons name="print-outline" size={18} color={Colors.accent} />
                  <Text style={styles.printBtnText}>Imprimir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.payBtn} onPress={handleConfirmPayment}>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.payBtnText}>Confirmar Cobro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  ratePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider },
  rateText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  scroll: { padding: Spacing.lg, paddingTop: 0 },
  balanceRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  balanceCard: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, borderWidth: 1 },
  balanceLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  balanceAmount: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  emptyOrders: { alignItems: 'center', padding: 20, gap: 8 },
  emptyOrdersText: { color: Colors.textSecondary },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  orderNumBadge: { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  orderNumText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  orderName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  orderItemCount: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  orderTotal: { color: Colors.accent, fontWeight: '700', fontSize: 15 },
  orderTotalVes: { color: Colors.textMuted, fontSize: 11 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txDesc: { color: Colors.textPrimary, fontWeight: '500', fontSize: 14 },
  txTime: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  txAmount: { fontWeight: '600', fontSize: 14 },
  txVes: { color: Colors.textMuted, fontSize: 11 },
  // Checkout Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  checkoutSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', minHeight: '60%' },
  checkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  checkoutTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  checkoutSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  itemsTable: { margin: Spacing.lg, backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  tableHeader: { flexDirection: 'row', padding: 10, backgroundColor: Colors.surfaceVariant, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableHead: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableCell: { color: Colors.textSecondary, fontSize: 14 },
  totalsBox: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { color: Colors.textSecondary, fontSize: 14 },
  totalValue: { color: Colors.textPrimary, fontSize: 14 },
  totalFinalLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  totalFinalUsd: { color: Colors.accent, fontSize: 20, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.divider },
  totalBsBox: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, backgroundColor: Colors.info + '12', borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.info + '30' },
  totalBsLabel: { color: Colors.info, fontSize: 13, fontWeight: '700' },
  totalBsRate: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  totalBsAmount: { color: Colors.info, fontSize: 26, fontWeight: '700' },
  checkoutActions: { flexDirection: 'row', gap: 10, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.divider },
  printBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.accent, paddingVertical: 14 },
  printBtnText: { color: Colors.accent, fontWeight: '600', fontSize: 15 },
  payBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 14 },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
