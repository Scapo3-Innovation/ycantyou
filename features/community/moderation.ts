import { Alert } from 'react-native';

import { REPORT_REASONS } from './constants';

/** Second step of a report: pick a reason, then run the callback. */
export function presentReportReasons(onPick: (reason: string) => void): void {
  Alert.alert('Report — choose a reason', undefined, [
    ...REPORT_REASONS.map((reason) => ({ text: reason, onPress: () => onPick(reason) })),
    { text: 'Cancel', style: 'cancel' as const },
  ]);
}

type MenuHandlers = {
  isOwn: boolean;
  onReport?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
};

/** Open the per-item options menu. Own content → Delete; others' → Report / Block. */
export function presentModerationMenu({ isOwn, onReport, onBlock, onDelete }: MenuHandlers): void {
  const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];

  if (isOwn) {
    if (onDelete) buttons.push({ text: 'Delete', style: 'destructive', onPress: onDelete });
  } else {
    if (onReport) buttons.push({ text: 'Report', onPress: onReport });
    if (onBlock) buttons.push({ text: 'Block author', style: 'destructive', onPress: onBlock });
  }
  buttons.push({ text: 'Cancel', style: 'cancel' });

  Alert.alert('Options', undefined, buttons);
}
