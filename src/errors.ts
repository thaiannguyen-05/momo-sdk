export class MomoSdkError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MomoSdkError";
    this.code = code;
  }
}

export class MomoApiError extends MomoSdkError {
  public readonly resultCode: number;
  public readonly requestId?: string;
  public readonly raw: unknown;

  constructor(params: { resultCode: number; message: string; requestId?: string; raw: unknown }) {
    super("MOMO_API_ERROR", params.message);
    this.name = "MomoApiError";
    this.resultCode = params.resultCode;
    this.requestId = params.requestId;
    this.raw = params.raw;
  }
}
