export declare class MomoSdkError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare class MomoApiError extends MomoSdkError {
    readonly resultCode: number;
    readonly requestId?: string;
    readonly raw: unknown;
    constructor(params: {
        resultCode: number;
        message: string;
        requestId?: string;
        raw: unknown;
    });
}
