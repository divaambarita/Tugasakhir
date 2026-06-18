import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {createPenarikan} from '../../api/penarikan';
import {getNasabahDetail} from '../../api/nasabah';
import type {NasabahSaldoStackParamList} from '../../navigation/stacks/NasabahSaldoStackNavigator';

import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';
import {todayYmdJakarta} from '../../utils/date';

type Nav = NativeStackNavigationProp<NasabahSaldoStackParamList>;

type Metode = 'Tunai' | 'Transfer';

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function keepDigitsOnly(input: string): string {
  return String(input ?? '').replace(/[^0-9]/g, '');
}

function formatDigitsAsId(inputDigits: string): string {
  const digits = keepDigitsOnly(inputDigits);
  if (!digits) {
    return '';
  }
  const n = Number(digits);
  if (!Number.isFinite(n)) {
    return '';
  }
  return n.toLocaleString('id-ID');
}

function todayDateOnly(): string {
  return todayYmdJakarta();
}

export function NasabahPenarikanCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [saldo, setSaldo] = React.useState<number>(0);
  const [metode, setMetode] = React.useState<Metode>('Tunai');
  const [tanggal] = React.useState<string>(() => todayDateOnly());

  const [totalDigits, setTotalDigits] = React.useState('');
  const totalDisplay = React.useMemo(
    () => formatDigitsAsId(totalDigits),
    [totalDigits],
  );

  const [submitting, setSubmitting] = React.useState(false);

  const nasabahId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        return;
      }

      setError(null);
      setLoading(true);

      try {
        if (!Number.isFinite(nasabahId) || nasabahId <= 0) {
          setError('ID nasabah tidak valid. Silakan login ulang.');
          setSaldo(0);
          return;
        }

        const res = await getNasabahDetail(user.token, nasabahId);
        if (!res.success) {
          setError(res.message ?? 'Gagal memuat saldo.');
          setSaldo(0);
          return;
        }

        const s = safeNumber((res.data as any)?.saldo);
        setSaldo(s);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nasabahId, user]);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!Number.isFinite(nasabahId) || nasabahId <= 0) {
      setError('ID nasabah tidak valid. Silakan login ulang.');
      return;
    }

    const totalNum = Number(totalDigits || '0');
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      setError('Total penarikan harus lebih dari 0.');
      return;
    }

    if (totalNum > saldo) {
      setError(`Saldo tidak mencukupi. Saldo: ${formatMoney(saldo)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPenarikan(user.token, {
        nasabahId,
        totalPenarikan: String(totalNum),
        metodePembayaran: metode,
        tanggalPenarikan: new Date(tanggal).toISOString(),
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal mengirim penarikan.');
        return;
      }

      Alert.alert('Terkirim', 'Permintaan penarikan sedang diproses.');
      navigation.replace('NasabahPenarikanList');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat…</Text>
        </View>
      </Screen>
    );
  }

  const formattedSaldo = formatMoney(saldo);
  const helperRp = totalDigits
    ? `Rp ${formatMoney(Number(totalDigits))}`
    : 'Rp 0';

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle title="Tarik Saldo" subtitle="Ajukan penarikan saldo Anda" />

      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Saldo tersedia</Text>
        <Text style={styles.heroValue}>Rp {formattedSaldo}</Text>
        <Text style={styles.heroHint}>
          Penarikan akan diproses oleh petugas BSU.
        </Text>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Detail Penarikan</Text>

        <AppTextField
          label="Tanggal"
          value={tanggal}
          editable={false}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Metode Pembayaran</Text>
        <View style={styles.methodRow}>
          {(['Tunai', 'Transfer'] as Metode[]).map(m => {
            const active = metode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMetode(m)}
                accessibilityRole="button"
                style={({pressed}) => [
                  styles.methodChip,
                  active ? styles.methodChipActive : null,
                  pressed ? styles.pressed : null,
                ]}>
                <Text
                  style={[
                    styles.methodText,
                    active ? styles.methodTextActive : null,
                  ]}>
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AppTextField
          label="Total Penarikan"
          value={totalDisplay}
          onChangeText={t => setTotalDigits(keepDigitsOnly(t))}
          keyboardType="numeric"
          placeholder="0"
        />
        <Text style={styles.helper}>{helperRp}</Text>

        <View style={styles.submitRow}>
          <AppButton
            title="Kirim"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  heroCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  heroLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
    color: theme.colors.onPrimary,
    opacity: 0.95,
  },
  heroValue: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.display,
    fontWeight: '900',
    color: theme.colors.onPrimary,
  },
  heroHint: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onPrimary,
    opacity: 0.9,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: theme.radius.lg,
  },
  formTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  helper: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  label: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  methodRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  methodChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  methodText: {
    fontWeight: '900',
    color: theme.colors.muted,
  },
  methodTextActive: {
    color: theme.colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  submitRow: {
    marginTop: theme.spacing.md,
  },
});
