import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type ShareLocalFileOptions = {
  mimeType: string;
  dialogTitle: string;
  UTI?: string;
};

/** Open the system share sheet for a file already on disk. */
export async function shareLocalFile(
  fileUri: string,
  options: ShareLocalFileOptions,
): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;

  // Android needs a content:// URI; iOS accepts the file URI from expo-print.
  const shareUri =
    Platform.OS === 'android' ? await FileSystem.getContentUriAsync(fileUri) : fileUri;

  await Sharing.shareAsync(shareUri, {
    mimeType: options.mimeType,
    dialogTitle: options.dialogTitle,
    ...(options.UTI ? { UTI: options.UTI } : {}),
  });

  return true;
}
