import { randomUUID } from "node:crypto";

import { ENDPOINTS, MOMO_PRODUCTION_BASE_URL, MOMO_SANDBOX_BASE_URL, SIGNATURE_FIELDS } from "./constants.js";
import { MomoApiError, MomoSdkError } from "./errors.js";
import { signPayload, timingSafeEqualHex } from "./signature.js";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  MomoBaseResponse,
  MomoClientConfig,
  MomoEnvironment,
  MomoWebhookPayload,
  QueryTransactionRequest,
  QueryTransactionResponse,
  RefundQueryRequest,
  RefundQueryResponse,
  RefundRequest,
  RefundResponse
} from "./types.js";

const DEFAULT_TIMEOUT_MS = 30_000;

interface RequestPayload {
  [key: string]: string | number | boolean;
}

export class MomoClient {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: MomoClientConfig) {
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
    } else {
      this.baseUrl = resolveEnvironment(config.env) === "production" ? MOMO_PRODUCTION_BASE_URL : MOMO_SANDBOX_BASE_URL;
    }
  }

  /** Generate a unique requestId for MoMo API calls. */
  createRequestId(): string {
    return randomUUID();
  }

  /** Create a one-time wallet payment and return checkout URLs (payUrl/deeplink/qrCodeUrl). */
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const requestId = this.createRequestId();
    const payload: RequestPayload = {
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

    return this.post<CreatePaymentResponse>(ENDPOINTS.create, payload);
  }

  /** Query transaction status by partner orderId. */
  async queryTransaction(request: QueryTransactionRequest): Promise<QueryTransactionResponse> {
    const requestId = this.createRequestId();
    const payload: RequestPayload = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      orderId: request.orderId,
      lang: request.lang ?? "vi"
    };

    payload.signature = signPayload(payload, SIGNATURE_FIELDS.queryTransaction, this.secretKey);

    return this.post<QueryTransactionResponse>(ENDPOINTS.query, payload);
  }

  /** Create a refund request for a successful transaction. */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    const requestId = this.createRequestId();
    const payload: RequestPayload = {
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

    return this.post<RefundResponse>(ENDPOINTS.refund, payload);
  }

  /** Query refund processing status by refund requestId and refund orderId. */
  async queryRefundStatus(request: RefundQueryRequest): Promise<RefundQueryResponse> {
    const payload: RequestPayload = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: request.requestId,
      orderId: request.orderId,
      lang: request.lang ?? "vi"
    };

    payload.signature = signPayload(payload, SIGNATURE_FIELDS.queryRefundStatus, this.secretKey);

    return this.post<RefundQueryResponse>(ENDPOINTS.refundQuery, payload);
  }

  /** Verify MoMo webhook/IPN signature before updating internal payment state. */
  verifyWebhookSignature(payload: MomoWebhookPayload): boolean {
    const receivedSignature = String(payload.signature ?? "");
    if (!receivedSignature) {
      return false;
    }

    const candidate = { ...payload, accessKey: this.accessKey };
    const computedSignature = signPayload(candidate, SIGNATURE_FIELDS.callback, this.secretKey);
    return timingSafeEqualHex(receivedSignature, computedSignature);
  }

  private async post<T extends MomoBaseResponse>(path: string, payload: RequestPayload): Promise<T> {
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

      const data = (await response.json()) as T;

      if (!response.ok) {
        throw new MomoSdkError(
          "HTTP_ERROR",
          `MoMo request failed with HTTP ${response.status}: ${JSON.stringify(data)}`
        );
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
    } catch (error) {
      if (error instanceof MomoSdkError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new MomoSdkError("REQUEST_TIMEOUT", `MoMo request exceeded ${this.timeoutMs}ms timeout`);
      }

      throw new MomoSdkError("NETWORK_ERROR", error instanceof Error ? error.message : String(error));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export namespace MomoClient {
  export type MomoClientConfig = import("./types.js").MomoClientConfig;
}

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl) {
    throw new MomoSdkError("INVALID_CONFIG", "baseUrl cannot be empty");
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function resolveEnvironment(env?: string): MomoEnvironment {
  if (!env || env === "sandbox") {
    return "sandbox";
  }

  if (env === "production") {
    return "production";
  }

  throw new MomoSdkError("INVALID_CONFIG", `Invalid env "${env}". Expected "sandbox" or "production".`);
}
