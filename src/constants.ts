export const MOMO_SANDBOX_BASE_URL = "https://test-payment.momo.vn";
export const MOMO_PRODUCTION_BASE_URL = "https://payment.momo.vn";

export const ENDPOINTS = {
  create: "/v2/gateway/api/create",
  query: "/v2/gateway/api/query",
  refund: "/v2/gateway/api/refund",
  refundQuery: "/v2/gateway/api/refund/query"
} as const;

export const SIGNATURE_FIELDS = {
  createPayment: [
    "accessKey",
    "amount",
    "extraData",
    "ipnUrl",
    "orderId",
    "orderInfo",
    "partnerCode",
    "redirectUrl",
    "requestId",
    "requestType"
  ] as const,
  queryTransaction: ["accessKey", "orderId", "partnerCode", "requestId"] as const,
  refundTransaction: [
    "accessKey",
    "amount",
    "description",
    "orderId",
    "partnerCode",
    "requestId",
    "transId"
  ] as const,
  queryRefundStatus: ["accessKey", "partnerCode", "requestId"] as const,
  callback: [
    "accessKey",
    "amount",
    "extraData",
    "message",
    "orderId",
    "orderInfo",
    "orderType",
    "partnerCode",
    "payType",
    "requestId",
    "responseTime",
    "resultCode",
    "transId"
  ] as const
} as const;
