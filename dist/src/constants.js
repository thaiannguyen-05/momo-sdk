export const MOMO_SANDBOX_BASE_URL = "https://test-payment.momo.vn";
export const MOMO_PRODUCTION_BASE_URL = "https://payment.momo.vn";
export const ENDPOINTS = {
    create: "/v2/gateway/api/create",
    query: "/v2/gateway/api/query",
    refund: "/v2/gateway/api/refund",
    refundQuery: "/v2/gateway/api/refund/query"
};
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
    ],
    queryTransaction: ["accessKey", "orderId", "partnerCode", "requestId"],
    refundTransaction: [
        "accessKey",
        "amount",
        "description",
        "orderId",
        "partnerCode",
        "requestId",
        "transId"
    ],
    queryRefundStatus: ["accessKey", "partnerCode", "requestId"],
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
    ]
};
