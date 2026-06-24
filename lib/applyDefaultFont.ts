import { Text, TextInput } from 'react-native';

import { fontFamily } from '@/theme/fonts';

type WithDefaultProps = {
  defaultProps?: { style?: object };
};

/** Apply Poppins as the default for bare Text / TextInput. */
export function applyDefaultFont(): void {
  const text = Text as unknown as WithDefaultProps;
  text.defaultProps = {
    ...text.defaultProps,
    style: { fontFamily: fontFamily.regular },
  };

  const input = TextInput as unknown as WithDefaultProps;
  input.defaultProps = {
    ...input.defaultProps,
    style: { fontFamily: fontFamily.regular },
  };
}
