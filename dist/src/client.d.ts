import type { CreatePaymentRequest, CreatePaymentResponse, MomoClientConfig, MomoWebhookPayload, QueryTransactionRequest, QueryTransactionResponse, RefundQueryRequest, RefundQueryResponse, RefundRequest, RefundResponse } from "./types.js";
export declare class MomoClient {
    private readonly partnerCode;
    private readonly accessKey;
    private readonly secretKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly fetchImpl;
    constructor(config: MomoClientConfig);
    createRequestId(): string;
    createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
    queryTransaction(request: QueryTransactionRequest): Promise<QueryTransactionResponse>;
    refund(request: RefundRequest): Promise<RefundResponse>;
    queryRefundStatus(request: RefundQueryRequest): Promise<RefundQueryResponse>;
    verifyWebhookSignature(payload: MomoWebhookPayload): boolean;
    private post;
}
