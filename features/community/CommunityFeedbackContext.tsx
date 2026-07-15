import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AppToast, type AppToastProps } from '@/components/ui/AppToast';

import { CommunityRulesSheet } from './components/CommunityRulesSheet';

type ToastInput = Pick<AppToastProps, 'message' | 'subtitle' | 'icon' | 'tone'>;

type CommunityFeedbackContextValue = {
  showToast: (toast: ToastInput) => void;
  showFollowToast: (authorLabel: string, following: boolean) => void;
  showRules: () => void;
};

const CommunityFeedbackContext = createContext<CommunityFeedbackContextValue | null>(null);

export function CommunityFeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { visible: boolean }) | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const showToast = useCallback((input: ToastInput) => {
    setToast({ ...input, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => (prev ? { ...prev, visible: false } : null));
  }, []);

  const showFollowToast = useCallback(
    (authorLabel: string, following: boolean) => {
      if (following) {
        showToast({
          message: `Following ${authorLabel}`,
          subtitle: 'See their posts in the Following tab',
          icon: 'heart-circle',
          tone: 'rose',
        });
        return;
      }
      showToast({
        message: `Unfollowed ${authorLabel}`,
        icon: 'person-remove-outline',
        tone: 'default',
      });
    },
    [showToast],
  );

  const showRules = useCallback(() => setRulesOpen(true), []);

  const value = useMemo(
    () => ({ showToast, showFollowToast, showRules }),
    [showToast, showFollowToast, showRules],
  );

  return (
    <CommunityFeedbackContext.Provider value={value}>
      {children}
      <AppToast
        visible={toast?.visible ?? false}
        message={toast?.message ?? ''}
        subtitle={toast?.subtitle}
        icon={toast?.icon}
        tone={toast?.tone}
        onHide={hideToast}
      />
      <CommunityRulesSheet visible={rulesOpen} onClose={() => setRulesOpen(false)} />
    </CommunityFeedbackContext.Provider>
  );
}

export function useCommunityFeedback(): CommunityFeedbackContextValue {
  const ctx = useContext(CommunityFeedbackContext);
  if (!ctx) {
    throw new Error('useCommunityFeedback must be used within CommunityFeedbackProvider');
  }
  return ctx;
}
