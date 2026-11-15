import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrefs } from '../prefs';
import { ANIMALS } from '../components/AnimalFriends';
import { useProfiles } from '../profiles';
import { LANGUAGES, useT } from '../i18n';
import { useInstall } from '../install';
import { useColors } from '../theme';
import { SKIN_KEYS } from '../skins';
import type { Palette } from '../theme';



const HINT_LIMITS: { value: number | null; label: string }[] = [
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: null, label: 'unlimited' },
];

const MISTAKE_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'casual' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
];

// Settings is grouped the way mobile apps usually are: Appearance, Gameplay, Feedback, About.
// Each group has a title and a footnote that explains what its options do.
export default function SettingsScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const theme = usePrefs((s) => s.theme);
  const notes = usePrefs((s) => s.notes);
  const autoNotes = usePrefs((s) => s.autoNotes);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);
  const sound = usePrefs((s) => s.sound);
  const haptics = usePrefs((s) => s.haptics);
  const update = usePrefs((s) => s.update);
  const t = useT();
  const language = usePrefs((s) => s.language);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const profiles = useProfiles((s) => s.profiles);
  const activeProfile = useProfiles((s) => s.activeId);
  const switchProfile = useProfiles((s) => s.switchTo);
  const addProfile = useProfiles((s) => s.add);
  const renameProfile = useProfiles((s) => s.rename);
  const removeProfile = useProfiles((s) => s.remove);
  const activeName = profiles.find((p) => p.id === activeProfile)?.name ?? '';
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hints = usePrefs((s) => s.hints);
  const hintLimit = usePrefs((s) => s.hintLimit);
  const badges = usePrefs((s) => s.badges);
  const levelUp = usePrefs((s) => s.levelUp);
  const rewards = usePrefs((s) => s.rewards);
  const parentLock = usePrefs((s) => s.parentLock);
  const largeDigits = usePrefs((s) => s.largeDigits);
  const colorBlind = usePrefs((s) => s.colorBlind);
  const animals = usePrefs((s) => s.animals);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const { canInstall, installed, ios, promptInstall } = useInstall();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('title_settings')}</Text>
        </View>

        <Text style={styles.intro}>{t('settings_intro')}</Text>

        <Group
          title={t('group_appearance')}
          footer={t('foot_appearance')}
        >
          <View style={styles.rowPlain}>
            <Text style={[styles.label, styles.labelGrow]}>{t('row_language')}</Text>
            <Segmented styles={styles} c={c} options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))} value={language} onChange={(v) => update('language', v)} />
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/skins')} style={styles.row}>
            <Text style={[styles.label, styles.labelGrow]}>{t('row_skin')}</Text>
            <Text style={styles.value}>{t(SKIN_KEYS[theme])} ›</Text>
          </Pressable>
        </Group>

        <Group
          title={t('group_gameplay')}
          footer={t('foot_gameplay')}
        >
          <View style={[styles.rowPlain, kidSafe && styles.disabled]} pointerEvents={kidSafe ? 'none' : 'auto'}>
            <Text style={[styles.label, styles.labelGrow]}>{t('row_mistake_limit')}</Text>
            <Segmented styles={styles} c={c} options={MISTAKE_LIMITS.map((o) => ({ ...o, label: o.value === null ? t('casual') : o.label }))} value={mistakeLimit} onChange={(v) => update('mistakeLimit', v)} />
          </View>
          <ToggleRow styles={styles} c={c} label={t('row_notes')} value={notes} onChange={(v) => update('notes', v)} />
          <ToggleRow styles={styles} c={c} label={t('row_hints')} value={hints} onChange={(v) => update('hints', v)} />
          <View style={styles.rowPlain}>
            <Text style={[styles.label, styles.labelGrow]}>{t('row_hints_per_game')}</Text>
            <Segmented styles={styles} c={c} options={HINT_LIMITS.map((o) => ({ ...o, label: o.value === null ? t('unlimited') : o.label }))} value={hintLimit} onChange={(v) => update('hintLimit', v)} />
          </View>
          <ToggleRow styles={styles} c={c} label={t('row_stars_badges')} value={badges} onChange={(v) => update('badges', v)} />
          <ToggleRow
            styles={styles}
            c={c}
            label={t('row_level_up')}
            value={levelUp}
            onChange={(v) => update('levelUp', v)}
          />
          <ToggleRow
            styles={styles}
            c={c}
            label={t('row_auto_notes')}
            value={autoNotes}
            disabled={!notes}
            last
            onChange={(v) => update('autoNotes', v)}
          />
        </Group>

        <Group
          title={t('group_kids')}
          footer={[kidSafe ? t('foot_kids_on') : t('foot_kids_off'), parentLock ? t('foot_parent_on') : t('foot_parent_off')].join(' ')}
        >
          <ToggleRow styles={styles} c={c} label={t('row_kid_safe')} value={kidSafe} onChange={(v) => update('kidSafe', v)} />
          <ToggleRow styles={styles} c={c} label={t('row_rewards')} value={rewards} onChange={(v) => update('rewards', v)} />
          <ToggleRow styles={styles} c={c} label={t('row_parent_lock')} value={parentLock} onChange={(v) => update('parentLock', v)} />
          <View style={styles.animalRow}>
            <Text style={styles.label}>{t('row_animals')}</Text>
            <View style={styles.animalChips} accessibilityRole="radiogroup">
              {ANIMALS.map((a) => {
                const on = animals.includes(a.id);
                return (
                  <Pressable
                    key={a.id}
                    accessibilityRole="checkbox"
                    accessibilityLabel={a.name}
                    aria-checked={on}
                    onPress={() => update('animals', on ? animals.filter((x) => x !== a.id) : [...animals, a.id])}
                    style={[styles.animalChip, on && { backgroundColor: c.accent, borderColor: c.accent }]}
                  >
                    <Text style={styles.animalEmoji}>{a.emoji}</Text>
                    <Text style={[styles.animalName, { color: on ? c.onAccent : c.text }]}>{a.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        <Group title={t('group_comfort')} footer={t('foot_comfort')}>
          <ToggleRow styles={styles} c={c} label={t('row_large_digits')} value={largeDigits} onChange={(v) => update('largeDigits', v)} />
          <ToggleRow styles={styles} c={c} label={t('row_colour_blind')} value={colorBlind} last onChange={(v) => update('colorBlind', v)} />
        </Group>

        <Group
          title={t('group_feedback')}
          footer={Platform.OS === 'web' ? t('foot_feedback_web') : t('foot_feedback')}
        >
          <ToggleRow styles={styles} c={c} label={t('row_sound')} value={sound} onChange={(v) => update('sound', v)} />
          <ToggleRow styles={styles} c={c} label={t('row_haptics')} value={haptics} last onChange={(v) => update('haptics', v)} />
        </Group>

        <Group title={t('group_players')} footer={t('foot_players')}>
          <View style={styles.playerList} accessibilityRole="radiogroup">
            {profiles.map((p, i) => {
              const on = p.id === activeProfile;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`${p.name}${on ? ', playing now' : ''}`}
                  aria-checked={on}
                  onPress={() => void switchProfile(p.id)}
                  style={[styles.playerRow, i < profiles.length - 1 && styles.divider]}
                >
                  <Text style={[styles.label, styles.labelGrow]}>{p.name}</Text>
                  {on ? <Text style={styles.playing}>{t('playing_now')}</Text> : null}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.playerEdit}>
            <Text style={styles.hint}>{t('name_label')}</Text>
            <NameField key={activeProfile} initial={activeName} label={t('name_label')} onSave={(name) => void renameProfile(activeProfile, name)} c={c} styles={styles} />
            <View style={styles.playerButtons}>
              <Pressable accessibilityRole="button" onPress={() => void addProfile()} style={styles.playerButton}>
                <Text style={styles.linkText}>{t('add_player')}</Text>
              </Pressable>
              {profiles.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={confirmDelete ? t('confirm_delete') : t('delete_player')}
                  onPress={() => {
                    if (!confirmDelete) return setConfirmDelete(true);
                    setConfirmDelete(false);
                    void removeProfile(activeProfile);
                  }}
                  style={styles.playerButton}
                >
                  <Text style={[styles.linkText, styles.danger]}>{confirmDelete ? t('confirm_delete') : t('delete_player')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Group>

        <Group
          title={t('group_about')}
          footer={Platform.OS === 'web' && !installed && ios ? t('foot_about_ios') : t('foot_about')}
        >
          {Platform.OS === 'web' ? (
            <Row
              styles={styles}
              label={installed ? t('row_installed') : t('row_install')}
              onPress={installed || (!canInstall && ios) ? undefined : canInstall ? () => void promptInstall() : undefined}
              role={canInstall ? 'button' : undefined}
              trailing={
                installed ? <Text style={styles.check}>✓</Text> : canInstall ? <Text style={styles.linkText}>{t('value_install')}</Text> : <Text style={styles.value}>{ios ? t('value_share_menu') : t('value_browser_menu')}</Text>
              }
            />
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => router.push('/about')} style={[styles.row, styles.divider]}>
            <Text style={[styles.label, styles.labelGrow]}>{t('about')}</Text>
            <Text style={styles.linkText}>›</Text>
          </Pressable>
          <Row styles={styles} label={t('row_version')} last trailing={<Text style={styles.value}>{version}</Text>} />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

// A titled card of related rows, with an optional footnote below.
function Group({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

// One row: optional leading content, the label, then the trailing value or control.
// A divider sits under every row except the last one in its group.
function Row({
  styles,
  label,
  leading,
  trailing,
  onPress,
  role,
  checked,
  last = false,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  role?: 'radio' | 'button';
  checked?: boolean;
  last?: boolean;
}) {
  const content = (
    <>
      {leading}
      <Text style={[styles.label, styles.labelGrow]}>{label}</Text>
      {trailing}
    </>
  );
  const rowStyle = [styles.row, !last && styles.divider];
  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole={role ?? 'button'}
      accessibilityLabel={label}
      aria-checked={role === 'radio' ? checked : undefined}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

// The name of the player being edited. It is saved when the field loses focus or Return is pressed.
function NameField({
  initial,
  label,
  onSave,
  c,
  styles,
}: {
  initial: string;
  label: string;
  onSave: (name: string) => void;
  c: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <TextInput
      value={draft}
      onChangeText={setDraft}
      onBlur={() => onSave(draft)}
      onSubmitEditing={() => onSave(draft)}
      maxLength={20}
      selectTextOnFocus
      accessibilityLabel={label}
      style={[styles.nameInput, { color: c.text, borderColor: c.line, backgroundColor: c.background }]}
    />
  );
}

function ToggleRow({
  styles,
  c,
  label,
  value,
  onChange,
  disabled = false,
  last = false,
}: {
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      aria-checked={value}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, !last && styles.divider, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, styles.labelGrow]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: value ? c.accent : c.line }]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

// Small segmented control for a short list of choices.
function Segmented<T extends number | string | null>({
  styles,
  c,
  options,
  value,
  onChange,
}: {
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={typeof o.value === 'number' ? `${o.label} mistakes` : o.value === null ? o.label : String(o.value)}
            aria-checked={active}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: c.accent }]}
          >
            <Text style={[styles.segmentText, { color: active ? c.onAccent : c.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 8,
      maxWidth: 560,
      width: '100%',
      alignSelf: 'center',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    back: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: c.radius,
      borderWidth: 1,
      borderColor: c.accent,
    },
    backText: {
      color: c.accent,
      fontWeight: '600',
    },
    intro: {
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.text,
    },
    group: {
      gap: 6,
      marginTop: 12,
    },
    groupTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 4,
    },
    card: {
      borderRadius: c.radius + 4,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
      overflow: 'hidden',
    },
    footer: {
      fontSize: 13,
      color: c.muted,
      paddingHorizontal: 4,
      marginTop: 2,
    },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    rowPlain: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    pressed: {
      backgroundColor: c.line,
    },
    disabled: {
      opacity: 0.45,
    },
    label: {
      fontSize: 16,
      color: c.text,
    },
    labelGrow: {
      flex: 1,
    },
    value: {
      fontSize: 16,
      color: c.muted,
      fontVariant: ['tabular-nums'],
    },
    check: {
      fontSize: 18,
      fontWeight: '800',
      color: c.accent,
    },
    linkText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.accent,
    },
    swatch: {
      flexDirection: 'row',
      width: 40,
      height: 24,
      borderRadius: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.line,
    },
    swatchPart: {
      flex: 1,
    },
    segmented: {
      flexDirection: 'row',
      borderRadius: c.radius,
      borderWidth: 1,
      borderColor: c.accent,
      overflow: 'hidden',
    },
    segment: {
      minWidth: 52,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '700',
    },
    track: {
      width: 46,
      height: 26,
      borderRadius: 13,
      padding: 3,
      justifyContent: 'center',
    },
    thumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
    },
    thumbOn: {
      alignSelf: 'flex-end',
    },
    playerList: {
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    playerRow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    playing: {
      fontSize: 13,
      fontWeight: '700',
      color: c.accent,
    },
    playerEdit: {
      padding: 16,
      gap: 8,
    },
    hint: {
      fontSize: 13,
      color: c.muted,
    },
    nameInput: {
      height: 44,
      borderRadius: c.radius,
      borderWidth: 1,
      paddingHorizontal: 12,
      fontSize: 16,
    },
    playerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    playerButton: {
      paddingVertical: 8,
    },
    danger: {
      color: c.error,
    },
    animalRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    animalChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    animalChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: c.radius,
      borderWidth: 1,
      borderColor: c.line,
    },
    animalEmoji: {
      fontSize: 18,
    },
    animalName: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
