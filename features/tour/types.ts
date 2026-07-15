import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type TourAnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TourStep = {
  id: string;
  route: Href;
  anchorId?: string;
  title: string;
  body: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Spotlight corner style — pill for tab bar / chips, circle for avatars. */
  spotlightShape?: 'pill' | 'card' | 'circle';
  placement?: 'above' | 'below';
};
