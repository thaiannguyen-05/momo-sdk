import test from "node:test";
import assert from "node:assert/strict";
import { MomoClient } from "../src/client.js";
import { SIGNATURE_FIELDS } from "../src/constants.js";
import { buildRawSignature, signPayload } from "../src/signature.js";
test("buildRawSignature keeps field order and empty defaults", () => {
    const raw = buildRawSignature({
        accessKey: "ak",
        amount: 1000,
        orderId: "OID-1",
        partnerCode: "MOMO",
        requestId: "RID-1"
    }, SIGNATURE_FIELDS.queryTransaction);
    assert.equal(raw, "accessKey=ak&orderId=OID-1&partnerCode=MOMO&requestId=RID-1");
});
test("signPayload returns deterministic HMAC SHA256", () => {
    const signature = signPayload({
        accessKey: "ak",
        orderId: "OID-1",
        partnerCode: "MOMO",
        requestId: "RID-1"
    }, SIGNATURE_FIELDS.queryTransaction, "secret");
    assert.equal(signature, "293a0aedaebc81fd717aac90f9bd321792342f2557dd27a646afdf933465c5d8");
});
test("verifyWebhookSignature validates callback payload", () => {
    const client = new MomoClient({
        partnerCode: "MOMO",
        accessKey: "AK",
        secretKey: "SECRET"
    });
    const payload = {
        amount: 20000,
        extraData: "",
        message: "Successful.",
        orderId: "OID-200",
        orderInfo: "Thanh toan don hang",
        orderType: "momo_wallet",
        partnerCode: "MOMO",
        payType: "qr",
        requestId: "RID-200",
        responseTime: 1700000000000,
        resultCode: 0,
        transId: 1234567890,
        accessKey: "AK"
    };
    const signature = signPayload(payload, SIGNATURE_FIELDS.callback, "SECRET");
    assert.equal(client.verifyWebhookSignature({ ...payload, signature }), true);
    assert.equal(client.verifyWebhookSignature({ ...payload, signature: `${signature}abc` }), false);
});
