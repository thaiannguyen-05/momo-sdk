import { randomUUID } from "node:crypto";
import { ENDPOINTS, MOMO_PRODUCTION_BASE_URL, MOMO_SANDBOX_BASE_URL, SIGNATURE_FIELDS } from "./constants.js";
import { MomoApiError, MomoSdkError } from "./errors.js";
import { signPayload, timingSafeEqualHex } from "./signature.js";
const DEFAULT_TIMEOUT_MS = 10_000;
export class MomoClient {
    partnerCode;
    accessKey;
    secretKey;
    baseUrl;
    timeoutMs;
    fetchImpl;
    constructor(config) {
        if (!config.partnerCode || !config.accessKey || !config.secretKey) {
            throw new MomoSdkError("INVALID_CONFIG", "partnerCode, accessKey and secretKey are required");
        }
        this.partnerCode = config.partnerCode;
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.fetchImpl = config.fetchImpl ?? fetch;
        if (config.baseUrl) {
            this.baseUrl = normalizeBaseUrl(config.baseUrl);
        }
        else {
            this.baseUrl = config.env === "production" ? MOMO_PRODUCTION_BASE_URL : MOMO_SANDBOX_BASE_URL;
        }
    }
    createRequestId() {
        return randomUUID();
    }
    async createPayment(request) {
        const requestId = this.createRequestId();
        const payload = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId,
            amount: request.amount,
            orderId: request.orderId,
            orderInfo: request.orderInfo,
            redirectUrl: request.redirectUrl,
            ipnUrl: request.ipnUrl,
            extraData: request.extraData ?? "",
            requestType: request.requestType ?? "captureWallet",
            autoCapture: request.autoCapture ?? true,
            lang: request.lang ?? "vi"
        };
        payload.signature = signPayload(payload, SIGNATURE_FIELDS.createPayment, this.secretKey);
        return this.post(ENDPOINTS.create, payload);
    }
    async queryTransaction(request) {
        const requestId = this.createRequestId();
        const payload = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId,
            orderId: request.orderId,
            lang: request.lang ?? "vi"
        };
        payload.signature = signPayload(payload, SIGNATURE_FIELDS.queryTransaction, this.secretKey);
        return this.post(ENDPOINTS.query, payload);
    }
    async refund(request) {
        const requestId = this.createRequestId();
        const payload = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId,
            orderId: request.orderId,
            transId: request.transId,
            amount: request.amount,
            description: request.description,
            lang: request.lang ?? "vi"
        };
        payload.signature = signPayload(payload, SIGNATURE_FIELDS.refundTransaction, this.secretKey);
        return this.post(ENDPOINTS.refund, payload);
    }
    async queryRefundStatus(request) {
        const payload = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId: request.requestId,
            lang: request.lang ?? "vi"
        };
        payload.signature = signPayload(payload, SIGNATURE_FIELDS.queryRefundStatus, this.secretKey);
        return this.post(ENDPOINTS.refundQuery, payload);
    }
    verifyWebhookSignature(payload) {
        const receivedSignature = String(payload.signature ?? "");
        if (!receivedSignature) {
            return false;
        }
        const candidate = { ...payload, accessKey: this.accessKey };
        const computedSignature = signPayload(candidate, SIGNATURE_FIELDS.callback, this.secretKey);
        return timingSafeEqualHex(receivedSignature, computedSignature);
    }
    async post(path, payload) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            const data = (await response.json());
            if (!response.ok) {
                throw new MomoSdkError("HTTP_ERROR", `MoMo request failed with HTTP ${response.status}: ${JSON.stringify(data)}`);
            }
            if (typeof data?.resultCode === "number" && data.resultCode !== 0) {
                throw new MomoApiError({
                    resultCode: data.resultCode,
                    message: data.message || "MoMo API returned non-success resultCode",
                    requestId: data.requestId,
                    raw: data
                });
            }
            return data;
        }
        catch (error) {
            if (error instanceof MomoSdkError) {
                throw error;
            }
            if (error instanceof Error && error.name === "AbortError") {
                throw new MomoSdkError("REQUEST_TIMEOUT", `MoMo request exceeded ${this.timeoutMs}ms timeout`);
            }
            throw new MomoSdkError("NETWORK_ERROR", error instanceof Error ? error.message : String(error));
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        throw new MomoSdkError("INVALID_CONFIG", "baseUrl cannot be empty");
    }
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}
