export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'letter',
    label: 'At least one letter (a–z)',
    test: (password) => /[a-zA-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number (0–9)',
    test: (password) => /\d/.test(password),
  },
];

export type PasswordRuleStatus = PasswordRule & { met: boolean };

export function evaluatePasswordRules(password: string): PasswordRuleStatus[] {
  return PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
