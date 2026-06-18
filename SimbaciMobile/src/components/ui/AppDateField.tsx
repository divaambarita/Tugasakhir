import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import {AppButton} from './AppButton';
import {AppTextField} from './AppTextField';
import {theme} from './theme';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateYmd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function parseDateYmd(value: string): Date | null {
  const trimmed = value.trim();
  const match = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (!match) {
    return null;
  }

  const d = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

type Props = {
  label?: string;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function AppDateField({
  label,
  error,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  minimumDate,
  maximumDate,
}: Props): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const parsed = React.useMemo(
    () => parseDateYmd(value) ?? new Date(),
    [value],
  );

  const [iosDraft, setIosDraft] = React.useState<Date>(parsed);

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      setIosDraft(parsed);
    }
  }, [parsed]);

  const openPicker = () => {
    if (disabled) {
      return;
    }
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
  };

  const onAndroidChange = (_event: DateTimePickerEvent, date?: Date) => {
    // On Android, the picker is a dialog; hide it immediately.
    closePicker();

    if (!date) {
      return;
    }

    onChange(formatDateYmd(date));
  };

  const onIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      return;
    }

    setIosDraft(date);
  };

  const onIosConfirm = () => {
    onChange(formatDateYmd(iosDraft));
    closePicker();
  };

  return (
    <>
      <Pressable onPress={openPicker} disabled={disabled}>
        <View pointerEvents="none">
          <AppTextField
            label={label}
            error={error}
            value={value}
            placeholder={placeholder}
            editable={false}
          />
        </View>
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={parsed}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {open && Platform.OS === 'ios' ? (
        <View style={styles.inlineWrapper}>
          <Text style={styles.inlineTitle}>{label ?? 'Pilih Tanggal'}</Text>
          <DateTimePicker
            value={iosDraft}
            mode="date"
            display="spinner"
            onChange={onIosChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
          <View style={styles.actions}>
            <AppButton
              title="Batal"
              onPress={closePicker}
              variant="secondary"
            />
            <AppButton title="Pilih" onPress={onIosConfirm} />
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  inlineWrapper: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  inlineTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: 12,
  },
});
