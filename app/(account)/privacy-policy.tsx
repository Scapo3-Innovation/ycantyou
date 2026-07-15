import { useRouter } from 'expo-router';

import { LegalDocumentView } from '@/features/privacy/components/LegalDocumentView';
import { PRIVACY_POLICY } from '@/features/privacy/legalCopy';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  return <LegalDocumentView document={PRIVACY_POLICY} onBack={() => router.back()} />;
}
