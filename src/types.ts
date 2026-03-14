export type MomoEnvironment = "sandbox" | "production";

export interface MomoClientConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  env?: MomoEnvironment | (string & {});
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
  partnerCode?: string;
  lang?: "vi" | "en";
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
  orderId?: string;
  amount?: number;
  payUrl?: string;
  shortLink?: string;
  deeplink?: string;
  deeplinkMiniApp?: string;
  qrCodeUrl?: string;
  transId?: number;
  signature?: string;
  userFee?: string | number;
  [key: string]: unknown;
}

export interface QueryTransactionRequest {
  orderId: string;
  lang?: "vi" | "en";
}

export interface QueryTransactionResponse extends MomoBaseResponse {
  orderId?: string;
  amount?: number;
  transId?: number;
  orderInfo?: string;
  orderType?: string;
  requestType?: string;
  payType?: string;
  refundTrans?: unknown[];
  paymentOption?: string;
  promotionInfo?: unknown[];
  signature?: string;
  [key: string]: unknown;
}

export interface RefundRequest {
  orderId: string;
  transId: number | string;
  amount: number | string;
  description: string;
  lang?: "vi" | "en";
}

export interface RefundResponse extends MomoBaseResponse {
  orderId?: string;
  transId?: number;
  amount?: number;
  [key: string]: unknown;
}

export interface RefundQueryRequest {
  requestId: string;
  orderId: string;
  lang?: "vi" | "en";
}

export interface RefundQueryResponse extends MomoBaseResponse {
  orderId?: string;
  transId?: number;
  amount?: number;
  description?: string;
  signature?: string;
  [key: string]: unknown;
}

export interface MomoWebhookPayload {
  signature: string;
  [key: string]: string | number | boolean | null | undefined;
}
