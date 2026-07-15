import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { AppDialog, type AppDialogButton, type AppDialogConfig } from '@/components/ui/AppDialog';

type AppDialogContextValue = {
  /** Drop-in replacement for Alert.alert — same argument shape. */
  alert: (title: string, message?: string, buttons?: AppDialogButton[]) => void;
  showDialog: (config: AppDialogConfig) => void;
  hideDialog: () => void;
};

const AppDialogContext = createContext<AppDialogContextValue | undefined>(undefined);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AppDialogConfig | null>(null);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setConfig(null);
  }, []);

  const showDialog = useCallback((next: AppDialogConfig) => {
    setConfig(next);
    setVisible(true);
  }, []);

  const alert = useCallback(
    (title: string, message?: string, buttons?: AppDialogButton[]) => {
      showDialog({ title, message, buttons });
    },
    [showDialog],
  );

  const value = useMemo(
    () => ({ alert, showDialog, hideDialog }),
    [alert, showDialog, hideDialog],
  );

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <AppDialog visible={visible} config={config} onClose={hideDialog} />
    </AppDialogContext.Provider>
  );
}

export function useAppDialog(): AppDialogContextValue {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
}
