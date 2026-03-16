import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

const UNITS = ['gr', 'kg', 'ml', 'lt', 'ud', 'kg'];

const INITIAL_INVENTORY = [
  { id: '1', name: 'Carne molida',    stock: 80,   min: 300,  unit: 'gr', cost: 0.008 },
  { id: '2', name: 'Pan hamburguesa', stock: 12,   min: 50,   unit: 'ud', cost: 0.15  },
  { id: '3', name: 'Queso cheddar',  stock: 45,   min: 200,  unit: 'gr', cost: 0.012 },
  { id: '4', name: 'Tomate',         stock: 350,  min: 200,  unit: 'gr', cost: 0.003 },
  { id: '5', name: 'Lechuga',        stock: 0,    min: 100,  unit: 'gr', cost: 0.002 },
  { id: '6', name: 'Coca-Cola 350ml',stock: 24,   min: 10,   unit: 'ud', cost: 1.00  },
  { id: '7', name: 'Harina',         stock: 2500, min: 1000, unit: 'gr', cost: 0.001 },
  { id: '8', name: 'Aceite',         stock: 800,  min: 500,  unit: 'ml', cost: 0.004 },
];

const EMPTY_FORM = { name: '', stock: '', min: '', unit: 'gr', cost: '' };

function getLevel(stock, min) {
  if (stock <= 0)        return { label: 'SIN STOCK', color: Colors.error };
  if (stock <= min * 0.5) return { label: 'CRÍTICO',   color: Colors.error };
  if (stock <= min)      return { label: 'BAJO',       color: Colors.warning };
  return                        { label: 'OK',         color: Colors.success };
}

// ─── Create Article Modal ─────────────────────────────────────────────────────
function CreateArticleModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: false }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name  = 'Ingresa el nombre';
    if (!form.stock || isNaN(+form.stock)) e.stock = 'Stock inválido';
    if (!form.min   || isNaN(+form.min))   e.min   = 'Mínimo inválido';
    if (!form.cost  || isNaN(+form.cost))  e.cost  = 'Costo inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: String(Date.now()),
      name:  form.name.trim(),
      stock: parseFloat(form.stock),
      min:   parseFloat(form.min),
      unit:  form.unit,
      cost:  parseFloat(form.cost),
    });
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalIcon}>
                <Ionicons name="cube-outline" size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Nuevo Artículo</Text>
                <Text style={styles.modalSubtitle}>Agregar al inventario</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <Field label="Nombre del artículo *" error={errors.name}>
              <View style={[styles.inputBox, errors.name && styles.inputError]}>
                <Ionicons name="pricetag-outline" size={17} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Queso mozzarella"
                  placeholderTextColor={Colors.textMuted}
                  value={form.name}
                  onChangeText={v => set('name', v)}
                />
              </View>
            </Field>

            {/* Stock actual + Mínimo */}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Stock actual *" error={errors.stock}>
                  <View style={[styles.inputBox, errors.stock && styles.inputError]}>
                    <Ionicons name="layers-outline" size={17} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      value={form.stock}
                      onChangeText={v => set('stock', v)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Stock mínimo *" error={errors.min}>
                  <View style={[styles.inputBox, errors.min && styles.inputError]}>
                    <Ionicons name="alert-circle-outline" size={17} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      value={form.min}
                      onChangeText={v => set('min', v)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </Field>
              </View>
            </View>

            {/* Unidad */}
            <Field label="Unidad de medida">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
                {['gr', 'kg', 'ml', 'lt', 'ud', 'pz'].map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, form.unit === u && styles.unitChipActive]}
                    onPress={() => set('unit', u)}
                  >
                    <Text style={[styles.unitChipText, form.unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>

            {/* Costo USD */}
            <Field label="Costo por unidad (USD) *" error={errors.cost}>
              <View style={[styles.inputBox, errors.cost && styles.inputError]}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={form.cost}
                  onChangeText={v => set('cost', v)}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencySuffix}>/ {form.unit}</Text>
              </View>
            </Field>

            {/* Preview card */}
            {form.name.trim() !== '' && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Vista previa</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewName}>{form.name || '—'}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.levelText, { color: Colors.success }]}>NUEVO</Text>
                  </View>
                </View>
                <Text style={styles.previewSub}>
                  {form.stock || '0'} {form.unit} · mín {form.min || '0'} {form.unit} · ${form.cost || '0'}/{form.unit}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Guardar Artículo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [modalVisible, setModalVisible] = useState(false);

  const adjust = (id, delta) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i));
  };

  const addItem = (item) => setItems(prev => [item, ...prev]);

  const alerts = items.filter(i => getLevel(i.stock, i.min).label !== 'OK');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Inventario</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {alerts.length > 0 && (
            <View style={styles.alertBadge}>
              <Ionicons name="warning" size={13} color={Colors.error} />
              <Text style={styles.alertBadgeText}>{alerts.length}</Text>
            </View>
          )}
          {/* NEW ARTICLE BUTTON */}
          <TouchableOpacity style={styles.newBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.newBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <View style={styles.banner}>
          <Ionicons name="notifications" size={17} color={Colors.error} />
          <Text style={styles.bannerText} numberOfLines={2}>
            {alerts.map(a => a.name).join(', ')} — stock bajo o agotado
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: Spacing.lg }}
        renderItem={({ item }) => {
          const level = getLevel(item.stock, item.min);
          const progress = Math.min(item.stock / (item.min * 2), 1);
          return (
            <View style={[styles.card, level.label !== 'OK' && { borderColor: level.color + '60', borderWidth: 1.5 }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.stock} {item.unit} / mín {item.min} {item.unit}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: level.color + '20' }]}>
                  <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.max(progress * 100, progress > 0 ? 2 : 0)}%`, backgroundColor: level.color }]} />
              </View>
              <View style={styles.controls}>
                <Text style={styles.costText}>${item.cost.toFixed(3)}/{item.unit}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.adjBtn, { borderColor: Colors.error + '50', backgroundColor: Colors.error + '12' }]} onPress={() => adjust(item.id, -50)}>
                    <Ionicons name="remove" size={14} color={Colors.error} />
                    <Text style={[styles.adjText, { color: Colors.error }]}>50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adjBtn, { borderColor: Colors.success + '50', backgroundColor: Colors.success + '12' }]} onPress={() => adjust(item.id, 100)}>
                    <Ionicons name="add" size={14} color={Colors.success} />
                    <Text style={[styles.adjText, { color: Colors.success }]}>100</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Create Modal */}
      <CreateArticleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.error + '18', paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.error + '40' },
  alertBadgeText: { color: Colors.error, fontSize: 12, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.error + '12', marginHorizontal: Spacing.lg, borderRadius: Radius.md, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: Colors.error + '30' },
  bannerText: { color: Colors.error, fontSize: 13, flex: 1 },
  // Item Card
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  itemName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  itemSub: { color: Colors.textSecondary, fontSize: 12 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  progressBg: { height: 6, backgroundColor: Colors.surfaceVariant, borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  costText: { color: Colors.textMuted, fontSize: 11 },
  adjBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  adjText: { fontSize: 12, fontWeight: '600' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.accent + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.accent + '40' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  modalBody: { padding: Spacing.lg, gap: 14 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.divider },
  // Form Fields
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' },
  fieldError: { fontSize: 12, color: Colors.error, marginTop: 2 },
  row2: { flexDirection: 'row', gap: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.divider, paddingHorizontal: 12, height: 50 },
  inputError: { borderColor: Colors.error },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  currencyPrefix: { color: Colors.success, fontWeight: '600', fontSize: 16, marginRight: 4 },
  currencySuffix: { color: Colors.textMuted, fontSize: 13, marginLeft: 4 },
  // Unit Chips
  unitRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  unitChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.divider, backgroundColor: Colors.surfaceVariant },
  unitChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  unitChipText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  unitChipTextActive: { color: '#fff' },
  // Preview
  previewCard: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.accent + '40', borderStyle: 'dashed' },
  previewLabel: { fontSize: 10, fontWeight: '700', color: Colors.accent, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  previewName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  previewSub: { fontSize: 12, color: Colors.textSecondary },
  // Footer Buttons
  cancelBtn: { flex: 1, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.divider, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 14 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
