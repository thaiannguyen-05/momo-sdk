export class MomoSdkError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = "MomoSdkError";
        this.code = code;
    }
}
export class MomoApiError extends MomoSdkError {
    resultCode;
    requestId;
    raw;
    constructor(params) {
        super("MOMO_API_ERROR", params.message);
        this.name = "MomoApiError";
        this.resultCode = params.resultCode;
        this.requestId = params.requestId;
        this.raw = params.raw;
    }
}
