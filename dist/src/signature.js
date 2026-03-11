import { createHmac } from "node:crypto";
import { MomoSdkError } from "./errors.js";
export function buildRawSignature(payload, orderedFields) {
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
export function signRawSignature(rawSignature, secretKey) {
    if (!secretKey) {
        throw new MomoSdkError("INVALID_SECRET_KEY", "secretKey is required to sign MoMo payload");
    }
    return createHmac("sha256", secretKey).update(rawSignature).digest("hex");
}
export function signPayload(payload, orderedFields, secretKey) {
    return signRawSignature(buildRawSignature(payload, orderedFields), secretKey);
}
export function timingSafeEqualHex(left, right) {
    if (left.length !== right.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < left.length; i += 1) {
        diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
    }
    return diff === 0;
}
