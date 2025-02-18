import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

export function useEncryption() {
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback((content: string) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(content, 'wisper-key').toString();
      return encrypted;
    } catch (err) {
      setError('Failed to encrypt content');
      return null;
    }
  }, []);

  const decrypt = useCallback((encryptedContent: string) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, 'wisper-key');
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      setError('Failed to decrypt content');
      return null;
    }
  }, []);

  return { encrypt, decrypt, error };
}
