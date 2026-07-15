import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

/** Gradient brand line — "ycantyou for Partners". */
export function PartnerBrandTitle() {
  return (
    <MaskedView
      style={styles.mask}
      maskElement={
        <View style={styles.maskInner}>
          <Text style={styles.title}>ycantyou for Partners</Text>
        </View>
      }>
      <LinearGradient
        colors={[colors.primary, '#9B6FD4']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}>
        <Text style={[styles.title, styles.hidden]}>ycantyou for Partners</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    alignSelf: 'stretch',
  },
  maskInner: {
    backgroundColor: 'transparent',
  },
  gradient: {
    alignSelf: 'stretch',
  },
  title: {
    ...typography.display,
    textAlign: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
