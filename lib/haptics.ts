import { Platform } from 'react-native';

export async function tapFeedback(
  enabled: boolean,
  kind: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'
) {
  if (!enabled || Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    if (kind === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(map[kind]);
  } catch {
    // haptics optional
  }
}
