export type MomoEnvironment = "sandbox" | "production";

export interface MomoClientConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  env?: MomoEnvironment;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface MomoBaseResponse {
  resultCode: number;
  message: string;
  responseTime?: number;
  requestId?: string;
  extraData?: string;
}

export interface CreatePaymentRequest {
  amount: number | string;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  requestType?: "captureWallet";
  extraData?: string;
  autoCapture?: boolean;
  lang?: "vi" | "en";
}

export interface CreatePaymentResponse extends MomoBaseResponse {
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  transId?: number;
  orderId?: string;
}

export interface QueryTransactionRequest {
  orderId: string;
  lang?: "vi" | "en";
}

export interface QueryTransactionResponse extends MomoBaseResponse {
  partnerCode?: string;
  orderId?: string;
  amount?: number;
  transId?: number;
  payType?: string;
}

export interface RefundRequest {
  orderId: string;
  transId: number | string;
  amount: number | string;
  description: string;
  lang?: "vi" | "en";
}

export interface RefundResponse extends MomoBaseResponse {
  transId?: number;
  amount?: number;
}

export interface RefundQueryRequest {
  requestId: string;
  lang?: "vi" | "en";
}

export interface RefundQueryResponse extends MomoBaseResponse {
  orderId?: string;
  transId?: number;
  amount?: number;
}

export interface MomoWebhookPayload {
  signature: string;
  [key: string]: string | number | boolean | null | undefined;
}
