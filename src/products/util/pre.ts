import * as cryptosdk from 'globalid-crypto-library';

type LockboxWithContent = cryptosdk.PRE.LockboxWithContent;
const util = cryptosdk.PRE.util;


export function stringify(chunk: LockboxWithContent): string {
  return util.bytesToHex(util.stringToBytes(JSON.stringify(chunk)));
}

export function parse(chunk: string): LockboxWithContent {
  return JSON.parse(util.bytesToString(util.hexToBytes(chunk)));
}

export function reEncryptPayload(payload: string, reEncryptionKey: string) {
  const chunk = parse(payload);

  chunk.lockbox = cryptosdk.PRE.reEncrypt(reEncryptionKey, chunk.lockbox);

  return stringify(chunk);
}

export function encryptPayload(payload: string, public_key: string): string {
  const data = Buffer.from(payload, 'utf8');
  const chunk: cryptosdk.PRE.LockboxWithContent = cryptosdk.PRE.lockboxEncrypt(
    'aes-256-cbc', 'sha256',
    public_key,
    data
  );

  return stringify(chunk);
}

export function decryptPayload(payload: string, private_key: string): string {
  const chunk = parse(payload);

  const result: Buffer = cryptosdk.PRE.lockboxDecrypt(
    'aes-256-cbc', 'sha256',
    private_key,
    chunk.lockbox,
    Buffer.from(chunk.content)
  );

  return result.toString('utf8');
}
