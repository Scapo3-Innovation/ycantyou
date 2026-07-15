import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type ShareLocalFileOptions = {
  mimeType: string;
  dialogTitle: string;
  UTI?: string;
  /** Pass when sharing expo-print output on Android (cache/Print/ is not shareable). */
  base64?: string;
};

function fileNameFromUri(fileUri: string): string {
  const segment = fileUri.split('/').pop();
  return segment && segment.length > 0 ? segment : `shared-${Date.now()}`;
}

async function ensureShareDir(): Promise<string> {
  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('No writable app directory available.');
  }
  const dir = `${baseDir}share/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * expo-print writes to cache/Print/, which expo-file-system cannot expose via
 * getContentUriAsync on Android. Copy into our share folder first.
 */
async function androidShareUri(fileUri: string, base64?: string): Promise<string> {
  const shareDir = await ensureShareDir();
  const destUri = `${shareDir}${fileNameFromUri(fileUri)}`;

  if (base64) {
    await FileSystem.writeAsStringAsync(destUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return FileSystem.getContentUriAsync(destUri);
  }

  try {
    return await FileSystem.getContentUriAsync(fileUri);
  } catch {
    await FileSystem.copyAsync({ from: fileUri, to: destUri });
    return FileSystem.getContentUriAsync(destUri);
  }
}

/** Open the system share sheet for a file already on disk. */
export async function shareLocalFile(
  fileUri: string,
  options: ShareLocalFileOptions,
): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;

  const shareUri =
    Platform.OS === 'android'
      ? await androidShareUri(fileUri, options.base64)
      : fileUri;

  await Sharing.shareAsync(shareUri, {
    mimeType: options.mimeType,
    dialogTitle: options.dialogTitle,
    ...(options.UTI ? { UTI: options.UTI } : {}),
  });

  return true;
}
