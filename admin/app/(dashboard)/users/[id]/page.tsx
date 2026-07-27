import { notFound } from 'next/navigation';

import { UserDetailActions } from '@/components/UserDetailActions';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

type PageProps = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: authUser, error } = await service.auth.admin.getUserById(id);
  if (error || !authUser.user) notFound();

  const { data: profile } = await service.from('profiles').select('*').eq('id', id).maybeSingle();

  return (
    <UserDetailActions
      userId={id}
      email={authUser.user.email ?? null}
      createdAt={authUser.user.created_at}
      profile={profile}
    />
  );
}
