import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { isSchemaNotReadyError, schemaNotReadyMessage } from '@/lib/supabaseErrors';
import type { FeedbackKind, UserFeedback } from '@/types/database';

export type SubmitFeedbackInput = {
  userId: string;
  kind: FeedbackKind;
  message: string;
};

function devicePlatform(): 'ios' | 'android' | 'web' | null {
  if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web') {
    return Platform.OS;
  }
  return null;
}

/** Store a bug report or product feedback row for the signed-in user. */
export async function submitUserFeedback(input: SubmitFeedbackInput): Promise<UserFeedback> {
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: input.userId,
      kind: input.kind,
      message: input.message.trim(),
      app_version: Constants.expoConfig?.version ?? null,
      platform: devicePlatform(),
      device_model: Device.modelName ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (isSchemaNotReadyError(error)) {
      throw new Error(schemaNotReadyMessage('Feedback'));
    }
    throw error;
  }

  return data as UserFeedback;
}

/** Recent submissions by the current user (newest first). */
export async function fetchMyFeedback(userId: string): Promise<UserFeedback[]> {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    if (isSchemaNotReadyError(error)) return [];
    throw error;
  }

  return (data ?? []) as UserFeedback[];
}
