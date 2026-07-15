import { useCallback, useEffect, useState } from 'react';

export const OTP_RESEND_COOLDOWN_SEC = 90;

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

/** Countdown before the user can request another email OTP. */
export function useOtpResendCooldown(cooldownSec = OTP_RESEND_COOLDOWN_SEC) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSec);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const restart = useCallback(() => {
    setSecondsLeft(cooldownSec);
  }, [cooldownSec]);

  return {
    canResend: secondsLeft <= 0,
    secondsLeft,
    cooldownLabel: formatCooldown(secondsLeft),
    restart,
  };
}
