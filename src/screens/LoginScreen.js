import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { AuthContext } from '../../App';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { checkDailyRate, needsRateUpdate, setExchangeRate, confirmRateUpdate, exchangeRate } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('public');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateInput, setRateInput] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    // Check if today's exchange rate needs to be set
    await checkDailyRate();
  };

  // When needsRateUpdate changes to true after login attempt, show modal
  useEffect(() => {
    if (needsRateUpdate) {
      setRateInput(String(exchangeRate));
      setShowRateModal(true);
    }
  }, [needsRateUpdate]);

  const handleConfirmRate = async () => {
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) {
      await setExchangeRate(val);
      confirmRateUpdate();
      setShowRateModal(false);
      login();
    }
  };

  const handleSkipRate = () => {
    confirmRateUpdate();
    setShowRateModal(false);
    login();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="fast-food" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Kiosko Food</Text>
          <Text style={styles.appSubtitle}>Sistema POS para Restaurantes</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Usuario" placeholderTextColor={Colors.textMuted}
              value={username} onChangeText={setUsername} autoCapitalize="none" />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Contraseña" placeholderTextColor={Colors.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="storefront-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Restaurante (Tenant)" placeholderTextColor={Colors.textMuted}
              value={tenant} onChangeText={setTenant} autoCapitalize="none" />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <><Ionicons name="log-in-outline" size={20} color="#fff" /><Text style={styles.loginBtnText}>Entrar al Sistema</Text></>
            }
          </TouchableOpacity>

          <Text style={styles.demoHint}>Demo: admin / admin123</Text>
        </View>
      </ScrollView>

      {/* ── Daily Rate Modal ── */}
      <Modal visible={showRateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rateModal}>
            <View style={styles.rateIconContainer}>
              <Ionicons name="swap-horizontal" size={32} color={Colors.accent} />
            </View>
            <Text style={styles.rateTitle}>Tasa del Día</Text>
            <Text style={styles.rateSubtitle}>
              {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={styles.rateLabel}>Ingresa la tasa BCV / dólar de hoy:</Text>

            <View style={styles.rateInputRow}>
              <Text style={styles.rateCurrency}>Bs</Text>
              <TextInput
                style={styles.rateInput}
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
              <Text style={styles.ratePer}>/ $1</Text>
            </View>

            <TouchableOpacity style={styles.rateConfirmBtn} onPress={handleConfirmRate}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.rateConfirmText}>Confirmar y Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rateSkipBtn} onPress={handleSkipRate}>
              <Text style={styles.rateSkipText}>Usar tasa anterior (Bs {exchangeRate.toFixed(2)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  appName: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  appSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.cardBorder },
  formTitle: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary, marginBottom: 24 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.divider,
    paddingHorizontal: 14, marginBottom: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  loginBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  demoHint: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: 16, fontStyle: 'italic' },
  // Rate Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  rateModal: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 28,
    width: '100%', maxWidth: 400, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center',
  },
  rateIconContainer: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.accent + '20',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: Colors.accent + '40',
  },
  rateTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  rateSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, textTransform: 'capitalize' },
  rateLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 14, textAlign: 'center' },
  rateInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24,
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.accent, paddingHorizontal: 16, height: 60, width: '100%',
  },
  rateCurrency: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  rateInput: { flex: 1, color: Colors.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  ratePer: { color: Colors.textSecondary, fontSize: 14 },
  rateConfirmBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md, height: 50, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10,
  },
  rateConfirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rateSkipBtn: { paddingVertical: 10 },
  rateSkipText: { color: Colors.textMuted, fontSize: 13 },
});
