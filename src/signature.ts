import { createHmac } from "node:crypto";

import { MomoSdkError } from "./errors.js";

export type SignatureValue = string | number | boolean | null | undefined;

export function buildRawSignature(
  payload: Record<string, SignatureValue>,
  orderedFields: readonly string[]
): string {
  return orderedFields
    .map((field) => {
      const value = payload[field];
      if (value === undefined || value === null) {
        return `${field}=`;
      }
      return `${field}=${String(value)}`;
    })
    .join("&");
}

export function signRawSignature(rawSignature: string, secretKey: string): string {
  if (!secretKey) {
    throw new MomoSdkError("INVALID_SECRET_KEY", "secretKey is required to sign MoMo payload");
  }

  return createHmac("sha256", secretKey).update(rawSignature).digest("hex");
}

export function signPayload(
  payload: Record<string, SignatureValue>,
  orderedFields: readonly string[],
  secretKey: string
): string {
  return signRawSignature(buildRawSignature(payload, orderedFields), secretKey);
}

export function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return diff === 0;
}
