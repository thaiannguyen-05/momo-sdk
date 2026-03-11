export type SignatureValue = string | number | boolean | null | undefined;
export declare function buildRawSignature(payload: Record<string, SignatureValue>, orderedFields: readonly string[]): string;
export declare function signRawSignature(rawSignature: string, secretKey: string): string;
export declare function signPayload(payload: Record<string, SignatureValue>, orderedFields: readonly string[], secretKey: string): string;
export declare function timingSafeEqualHex(left: string, right: string): boolean;
