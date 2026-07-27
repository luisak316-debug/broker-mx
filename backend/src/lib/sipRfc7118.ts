/** Codificación de tramas SIP sobre WebSocket (RFC 7118). */

export function encodeSipFrame(message: string): Buffer {
  return Buffer.concat([Buffer.from([0x00]), Buffer.from(message, 'utf8')]);
}

export function encodeKeepaliveResponse(): Buffer {
  const ts = Math.floor(Date.now() / 1000);
  const buf = Buffer.alloc(4);
  buf[0] = 0xff;
  buf.writeUIntBE(ts & 0xffffff, 1, 3);
  return buf;
}

export type SipWsPayload =
  | { kind: 'sip'; message: string }
  | { kind: 'keepalive' }
  | { kind: 'unknown' };

export function decodeWsPayload(data: Buffer | ArrayBuffer | Buffer[]): SipWsPayload {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
  if (buf.length === 0) return { kind: 'unknown' };
  if (buf[0] === 0x00) {
    return { kind: 'sip', message: buf.subarray(1).toString('utf8') };
  }
  if (buf[0] === 0xff) {
    return { kind: 'keepalive' };
  }
  return { kind: 'unknown' };
}
