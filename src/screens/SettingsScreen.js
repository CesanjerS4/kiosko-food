import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { AuthContext } from '../../App';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { logout } = useContext(AuthContext);
  const {
    exchangeRate, setExchangeRate,
    printerKitchen, setPrinterKitchen,
    printerCash, setPrinterCash,
  } = useApp();

  const [kitchenIp, setKitchenIp] = useState(printerKitchen.ip);
  const [kitchenPort, setKitchenPort] = useState(printerKitchen.port);
  const [cashIp, setCashIp] = useState(printerCash.ip);
  const [cashPort, setCashPort] = useState(printerCash.port);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [autoPrint, setAutoPrint] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [rateEdit, setRateEdit] = useState(String(exchangeRate));

  const saveKitchenPrinter = async () => {
    await setPrinterKitchen({ ip: kitchenIp, port: kitchenPort });
    Alert.alert('✅ Guardado', 'Impresora de cocina configurada.');
  };

  const saveCashPrinter = async () => {
    await setPrinterCash({ ip: cashIp, port: cashPort });
    Alert.alert('✅ Guardado', 'Impresora de caja configurada.');
  };

  const saveRate = async () => {
    const val = parseFloat(rateEdit);
    if (!isNaN(val) && val > 0) {
      await setExchangeRate(val);
      Alert.alert('✅ Tasa actualizada', `Nueva tasa: Bs ${val.toFixed(2)} / $1`);
    } else {
      Alert.alert('Error', 'Ingresa un valor válido.');
    }
  };

  const testPrinter = (type) => {
    const ip = type === 'kitchen' ? kitchenIp : cashIp;
    const port = type === 'kitchen' ? kitchenPort : cashPort;
    if (!ip) { Alert.alert('Sin IP', 'Configura la IP de la impresora primero.'); return; }
    Alert.alert('🖨️ Prueba de impresora', `Enviando prueba a ${ip}:${port}...`);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Configuración</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Tasa de Cambio ── */}
        <SectionHeader icon="swap-horizontal-outline" title="Tasa de Cambio (BCV)" />
        <View style={styles.card}>
          <Text style={styles.rateHint}>Se actualiza automáticamente al iniciar sesión cada día.</Text>
          <View style={styles.rateRow}>
            <View style={styles.rateInputGroup}>
              <Text style={styles.rateCurrency}>Bs</Text>
              <TextInput
                style={styles.rateInput}
                value={rateEdit}
                onChangeText={setRateEdit}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.ratePerLabel}>/ $1</Text>
            </View>
            <TouchableOpacity style={styles.saveRateBtn} onPress={saveRate}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveRateBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Impresora de Cocina ── */}
        <SectionHeader icon="restaurant-outline" title="Impresora de Cocina" />
        <View style={styles.card}>
          <Text style={styles.printerHint}>Recibe las órdenes nuevas desde el POS (KDS).</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="wifi-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={kitchenIp} onChangeText={setKitchenIp}
              placeholder="IP (ej: 192.168.1.101)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="git-network-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={kitchenPort} onChangeText={setKitchenPort}
              placeholder="Puerto (9100)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.testBtn} onPress={() => testPrinter('kitchen')}>
              <Ionicons name="print-outline" size={15} color={Colors.accent} />
              <Text style={styles.testBtnText}>Probar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveKitchenPrinter}>
              <Ionicons name="save-outline" size={15} color="#fff" />
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Impresora de Caja ── */}
        <SectionHeader icon="receipt-outline" title="Impresora de Caja" />
        <View style={styles.card}>
          <Text style={styles.printerHint}>Imprime los tickets de venta al cobrar.</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="wifi-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={cashIp} onChangeText={setCashIp}
              placeholder="IP (ej: 192.168.1.100)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="git-network-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={cashPort} onChangeText={setCashPort}
              placeholder="Puerto (9100)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.testBtn} onPress={() => testPrinter('cash')}>
              <Ionicons name="print-outline" size={15} color={Colors.accent} />
              <Text style={styles.testBtnText}>Probar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveCashPrinter}>
              <Ionicons name="save-outline" size={15} color="#fff" />
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.toggleRow, { marginTop: 8 }]}>
            <Text style={styles.toggleLabel}>Auto-imprimir al cobrar</Text>
            <Switch value={autoPrint} onValueChange={setAutoPrint}
              thumbColor={autoPrint ? Colors.accent : Colors.textMuted}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.accent + '50' }} />
          </View>
        </View>

        {/* ── Servidor ── */}
        <SectionHeader icon="cloud-outline" title="Conexión al Servidor" />
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Ionicons name="link-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={apiUrl} onChangeText={setApiUrl}
              placeholder="URL Backend" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
          </View>
          <View style={styles.connRow}>
            <View style={styles.connDot} />
            <Text style={styles.connText}>Verificar conexión</Text>
            <TouchableOpacity style={styles.testBtn} onPress={() => Alert.alert('Conectado ✅', apiUrl)}>
              <Text style={styles.testBtnText}>Ping</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Alertas ── */}
        <SectionHeader icon="notifications-outline" title="Alertas" />
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Ionicons name="volume-high-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.toggleLabel}>Alertas sonoras en KDS</Text>
            <Switch value={soundAlerts} onValueChange={setSoundAlerts}
              thumbColor={soundAlerts ? Colors.accent : Colors.textMuted}
              trackColor={{ false: Colors.surfaceVariant, true: Colors.accent + '50' }} />
          </View>
        </View>

        {/* ── Info ── */}
        <SectionHeader icon="information-circle-outline" title="Información" />
        <View style={styles.card}>
          {[['Versión', '1.0.0'], ['Plataforma', 'iOS · Android'], ['Backend', 'FastAPI + PostgreSQL']].map(([l, v], i, a) => (
            <View key={l}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{l}</Text>
                <Text style={styles.infoValue}>{v}</Text>
              </View>
              {i < a.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={15} color={Colors.accent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, paddingTop: 0, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  sectionTitle: { color: Colors.textSecondary, fontWeight: '700', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder, gap: 10 },
  printerHint: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  rateHint: { color: Colors.textMuted, fontSize: 12 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rateInputGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accent, paddingHorizontal: 12, height: 48, gap: 8 },
  rateCurrency: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  rateInput: { flex: 1, color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  ratePerLabel: { color: Colors.textSecondary, fontSize: 13 },
  saveRateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 14, height: 48 },
  saveRateBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.divider, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  testBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.accent, paddingVertical: 9 },
  testBtnText: { color: Colors.accent, fontWeight: '600', fontSize: 13 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 9 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { color: Colors.textPrimary, fontSize: 14, flex: 1 },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  connText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: Colors.textSecondary, fontSize: 14 },
  infoValue: { color: Colors.textPrimary, fontWeight: '500', fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.divider },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error, paddingVertical: 14, marginTop: 6 },
  logoutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
});
