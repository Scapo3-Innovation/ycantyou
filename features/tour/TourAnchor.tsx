import { useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTourOptional } from './TourContext';

type TourAnchorProps = {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Registers a view for guided-tour spotlight positioning. */
export function TourAnchor({ id, children, style }: TourAnchorProps) {
  const tour = useTourOptional();
  const ref = useRef<View>(null);

  useEffect(() => {
    if (!tour) return;
    tour.registerAnchor(id, ref);
    return () => tour.unregisterAnchor(id);
  }, [id, tour]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
