import { supabase } from '@/lib/supabase';
import { isSchemaNotReadyError, schemaNotReadyMessage } from '@/lib/supabaseErrors';
import type {
  PartnerCalendarRange,
  PartnerDashboard,
  PartnerSharingSettings,
  PrimaryPartnerHub,
} from '@/types/database';

import { CONSENT_TYPE_PARTNER_SHARING, PARTNER_CONSENT_VERSION } from './constants';

export async function isPartnerSchemaReady(): Promise<boolean> {
  const { error } = await supabase.rpc('get_primary_partner_hub');
  return !error || !isSchemaNotReadyError(error);
}

function rpcErrorMessage(error: { message: string }): string {
  return error.message.replace(/^.*?:\s*/, '');
}

export async function fetchPrimaryPartnerHub(): Promise<PrimaryPartnerHub> {
  const { data, error } = await supabase.rpc('get_primary_partner_hub');
  if (!error) return data as PrimaryPartnerHub;
  if (isSchemaNotReadyError(error)) {
    return { linked: false, pending_invite: null };
  }
  throw new Error(rpcErrorMessage(error));
}

export async function createPartnerInvite(): Promise<{ code: string; expires_at: string }> {
  const { data, error } = await supabase.rpc('create_partner_invite');
  if (error) {
    if (isSchemaNotReadyError(error)) {
      throw new Error(schemaNotReadyMessage('Partner linking'));
    }
    throw new Error(rpcErrorMessage(error));
  }
  return data as { code: string; expires_at: string };
}

export async function cancelPartnerInvite(): Promise<void> {
  const { error } = await supabase.rpc('cancel_partner_invite');
  if (error) {
    if (isSchemaNotReadyError(error)) {
      throw new Error(schemaNotReadyMessage('Partner linking'));
    }
    throw new Error(rpcErrorMessage(error));
  }
}

export async function redeemPartnerCode(code: string): Promise<{
  connection_id: string;
  primary_user_id: string;
  primary_name: string;
}> {
  const { data, error } = await supabase.rpc('redeem_partner_code', { p_code: code });
  if (error) throw new Error(rpcErrorMessage(error));
  return data as { connection_id: string; primary_user_id: string; primary_name: string };
}

export async function updatePartnerSharing(
  settings: Partial<PartnerSharingSettings>,
): Promise<PartnerSharingSettings> {
  const { data, error } = await supabase.rpc('update_partner_sharing', { p_settings: settings });
  if (error) throw new Error(rpcErrorMessage(error));
  return data as PartnerSharingSettings;
}

export async function pausePartnerSharing(): Promise<void> {
  const { error } = await supabase.rpc('pause_partner_sharing');
  if (error) throw new Error(rpcErrorMessage(error));
}

export async function resumePartnerSharing(): Promise<void> {
  const { error } = await supabase.rpc('resume_partner_sharing');
  if (error) throw new Error(rpcErrorMessage(error));
}

export async function revokePartnerConnection(): Promise<void> {
  const { error } = await supabase.rpc('revoke_partner_connection');
  if (error) throw new Error(rpcErrorMessage(error));
}

export async function disconnectAsPartner(): Promise<void> {
  const { error } = await supabase.rpc('disconnect_as_partner');
  if (error) throw new Error(rpcErrorMessage(error));
}

export async function fetchPartnerDashboard(): Promise<PartnerDashboard> {
  const { data, error } = await supabase.rpc('get_partner_dashboard');
  if (error) throw new Error(rpcErrorMessage(error));
  return data as PartnerDashboard;
}

export async function fetchPartnerCalendarRange(
  start: string,
  end: string,
): Promise<PartnerCalendarRange> {
  const { data, error } = await supabase.rpc('get_partner_calendar_range', {
    p_start: start,
    p_end: end,
  });
  if (error) throw new Error(rpcErrorMessage(error));
  return data as PartnerCalendarRange;
}

/** Record explicit consent before first partner invite. */
export async function recordPartnerSharingConsent(userId: string): Promise<void> {
  const { error } = await supabase.from('consents').insert({
    user_id: userId,
    consent_type: CONSENT_TYPE_PARTNER_SHARING,
    version: PARTNER_CONSENT_VERSION,
  });
  if (error) throw error;
}

export async function hasPartnerSharingConsent(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('consents')
    .select('id')
    .eq('user_id', userId)
    .eq('consent_type', CONSENT_TYPE_PARTNER_SHARING)
    .eq('version', PARTNER_CONSENT_VERSION)
    .is('revoked_at', null)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
