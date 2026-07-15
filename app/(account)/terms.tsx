import { useRouter } from 'expo-router';

import { LegalDocumentView } from '@/features/privacy/components/LegalDocumentView';
import { TERMS_OF_USE } from '@/features/privacy/legalCopy';

export default function TermsScreen() {
  const router = useRouter();
  return <LegalDocumentView document={TERMS_OF_USE} onBack={() => router.back()} />;
}
