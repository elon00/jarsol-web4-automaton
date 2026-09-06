/**
 * JarSol Quantum-Ready Architecture
 * Module: Quantum-Resistant Secure Agent Session
 * Path: quantum/03_PQ_COMMUNICATION/secure-session.ts
 *
 * Implements AEAD (AES-256-GCM) authenticated packet encryption for autonomous
 * agent message traffic, utilizing keys derived from the hybrid key exchange.
 */

import * as crypto from 'crypto';

export interface EncryptedSessionPacket {
  version: 'JARSOL-SESSION-V1';
  nonceHex: string; // 12 bytes IV
  authTagHex: string; // 16 bytes GCM tag
  ciphertextHex: string;
  senderId: string;
  timestamp: number;
}

export class QuantumSecureSession {
  private sessionKey: Buffer;
  private agentId: string;

  constructor(sessionKey32Bytes: Uint8Array, agentId: string) {
    if (sessionKey32Bytes.length !== 32) {
      throw new Error('QuantumSecureSession: 32-byte (256-bit) session key required for Grover resistance.');
    }
    this.sessionKey = Buffer.from(sessionKey32Bytes);
    this.agentId = agentId;
  }

  /**
   * Encrypts an agent intent or message payload with AES-256-GCM.
   */
  public encryptMessage(plaintext: string): EncryptedSessionPacket {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.sessionKey, iv);

    const ptBuffer = Buffer.from(plaintext, 'utf-8');
    const ciphertext = Buffer.concat([cipher.update(ptBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      version: 'JARSOL-SESSION-V1',
      nonceHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      ciphertextHex: ciphertext.toString('hex'),
      senderId: this.agentId,
      timestamp: Date.now(),
    };
  }

  /**
   * Decrypts and authenticates an incoming packet.
   */
  public decryptPacket(packet: EncryptedSessionPacket): string {
    const iv = Buffer.from(packet.nonceHex, 'hex');
    const authTag = Buffer.from(packet.authTagHex, 'hex');
    const ciphertext = Buffer.from(packet.ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.sessionKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf-8');
  }
}
