import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Modal, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

const CATEGORIES = [
  { id: '1', name: 'Hamburguesas', icon: '🍔' },
  { id: '2', name: 'Pizzas', icon: '🍕' },
  { id: '3', name: 'Bebidas', icon: '🥤' },
  { id: '4', name: 'Postres', icon: '🍰' },
  { id: '5', name: 'Ensaladas', icon: '🥗' },
];

const PRODUCTS = [
  { id: 'p1', catId: '1', name: 'Burger Clásica', price: 8.50, emoji: '🍔' },
  { id: 'p2', catId: '1', name: 'Doble Cheese', price: 10.00, emoji: '🍔' },
  { id: 'p3', catId: '1', name: 'BBQ Bacon', price: 11.50, emoji: '🥓' },
  { id: 'p4', catId: '2', name: 'Margarita', price: 9.00, emoji: '🍕' },
  { id: 'p5', catId: '2', name: 'Pepperoni', price: 11.00, emoji: '🍕' },
  { id: 'p6', catId: '3', name: 'Coca-Cola', price: 2.00, emoji: '🥤' },
  { id: 'p7', catId: '3', name: 'Jugo Natural', price: 3.50, emoji: '🍊' },
  { id: 'p8', catId: '4', name: 'Brownie', price: 4.00, emoji: '🍫' },
  { id: 'p9', catId: '5', name: 'Ensalada César', price: 7.00, emoji: '🥗' },
];

export default function PosScreen() {
  const [selectedCat, setSelectedCat] = useState('1');
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  const filtered = PRODUCTS.filter(p => p.catId === selectedCat);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  const sendOrder = () => {
    setCart([]);
    setCartVisible(false);
    Alert.alert('✅ Orden enviada', 'La orden fue enviada a cocina.', [{ text: 'OK' }]);
  };

  const getQty = (id) => cart.find(i => i.id === id)?.qty || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍔 POS — Toma de Órdenes</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => setCartVisible(true)}>
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
          {totalItems > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]}
            onPress={() => setSelectedCat(cat.id)}
          >
            <Text style={styles.catEmoji}>{cat.icon}</Text>
            <Text style={[styles.catName, selectedCat === cat.id && styles.catNameActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const qty = getQty(item.id);
          return (
            <TouchableOpacity
              style={[styles.productCard, qty > 0 && styles.productCardActive]}
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <View style={styles.productTop}>
                <Text style={styles.productEmoji}>{item.emoji}</Text>
                {qty > 0 && <View style={styles.qtyBadge}><Text style={styles.qtyBadgeText}>{qty}</Text></View>}
              </View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Cart Modal */}
      <Modal visible={cartVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cartSheet}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>🛒 Carrito</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {cart.length > 0 && (
                  <TouchableOpacity onPress={() => setCart([])}>
                    <Ionicons name="trash-outline" size={22} color={Colors.error} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setCartVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {cart.length === 0
              ? <View style={styles.emptyCart}><Text style={styles.emptyCartEmoji}>🛒</Text><Text style={styles.emptyCartText}>Carrito vacío</Text></View>
              : <ScrollView style={{ flex: 1 }}>
                  {cart.map(item => (
                    <View key={item.id} style={styles.cartItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} c/u</Text>
                      </View>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                          <Ionicons name="remove" size={14} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                          <Ionicons name="add" size={14} color={Colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cartItemSubtotal}>${(item.price * item.qty).toFixed(2)}</Text>
                    </View>
                  ))}
                </ScrollView>
            }

            {cart.length > 0 && (
              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.sendBtn} onPress={sendOrder}>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.sendBtnText}>Enviar a Cocina</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  cartBtn: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: Colors.accent, borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  catScroll: { maxHeight: 52 },
  catContent: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.divider },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catEmoji: { fontSize: 16 },
  catName: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catNameActive: { color: '#fff', fontWeight: '600' },
  grid: { padding: Spacing.lg, paddingTop: Spacing.md },
  row: { gap: 12 },
  productCard: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: 14, marginBottom: 12 },
  productCardActive: { borderColor: Colors.accent, borderWidth: 2, backgroundColor: `${Colors.accent}15` },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  productEmoji: { fontSize: 38 },
  qtyBadge: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  qtyBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  productName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14, marginBottom: 4 },
  productPrice: { color: Colors.accent, fontWeight: '700', fontSize: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  cartSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', minHeight: '40%' },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  cartTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyCartEmoji: { fontSize: 48, marginBottom: 12 },
  emptyCartText: { color: Colors.textMuted, fontSize: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 10 },
  cartItemName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  cartItemPrice: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, backgroundColor: Colors.surfaceVariant, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.divider },
  qtyText: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15, minWidth: 20, textAlign: 'center' },
  cartItemSubtotal: { color: Colors.accent, fontWeight: '600', fontSize: 14 },
  cartFooter: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.divider },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  totalValue: { fontSize: 22, fontWeight: '700', color: Colors.accent },
  sendBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
