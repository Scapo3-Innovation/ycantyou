import * as ExpoCrypto from 'expo-crypto';

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

function bufferSourceToUtf8(data: BufferSource): string {
  const bytes =
    data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new TextDecoder().decode(bytes);
}

let cryptoPolyfillInstalled = false;

/**
 * Hermes lacks `crypto.subtle`, which Supabase Auth needs for PKCE (S256).
 * Install before `createClient` so OAuth code exchange succeeds.
 */
export function installCryptoPolyfill(): void {
  if (cryptoPolyfillInstalled) return;
  cryptoPolyfillInstalled = true;

  const subtle = {
    async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name !== 'SHA-256') {
        throw new Error(`Unsupported digest algorithm: ${name}`);
      }
      const hex = await ExpoCrypto.digestStringAsync(
        ExpoCrypto.CryptoDigestAlgorithm.SHA256,
        bufferSourceToUtf8(data),
        { encoding: ExpoCrypto.CryptoEncoding.HEX },
      );
      return hexToArrayBuffer(hex);
    },
  };

  if (!globalThis.crypto) {
    globalThis.crypto = {
      getRandomValues<T extends ArrayBufferView>(array: T): T {
        const bytes = ExpoCrypto.getRandomBytes(array.byteLength);
        const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        view.set(bytes);
        return array;
      },
      subtle,
    } as Crypto;
    return;
  }

  Object.assign(globalThis.crypto, { subtle });
}

installCryptoPolyfill();
