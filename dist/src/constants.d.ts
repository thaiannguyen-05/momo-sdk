export declare const MOMO_SANDBOX_BASE_URL = "https://test-payment.momo.vn";
export declare const MOMO_PRODUCTION_BASE_URL = "https://payment.momo.vn";
export declare const ENDPOINTS: {
    readonly create: "/v2/gateway/api/create";
    readonly query: "/v2/gateway/api/query";
    readonly refund: "/v2/gateway/api/refund";
    readonly refundQuery: "/v2/gateway/api/refund/query";
};
export declare const SIGNATURE_FIELDS: {
    readonly createPayment: readonly ["accessKey", "amount", "extraData", "ipnUrl", "orderId", "orderInfo", "partnerCode", "redirectUrl", "requestId", "requestType"];
    readonly queryTransaction: readonly ["accessKey", "orderId", "partnerCode", "requestId"];
    readonly refundTransaction: readonly ["accessKey", "amount", "description", "orderId", "partnerCode", "requestId", "transId"];
    readonly queryRefundStatus: readonly ["accessKey", "partnerCode", "requestId"];
    readonly callback: readonly ["accessKey", "amount", "extraData", "message", "orderId", "orderInfo", "orderType", "partnerCode", "payType", "requestId", "responseTime", "resultCode", "transId"];
};
