# momo-sdk

TypeScript SDK for MoMo Payment API v2 (`/v2/gateway/api/*`) with strict typing, HMAC signing, webhook signature verification, and production-ready error handling.

## Features

- Typed methods: `createPayment`, `queryTransaction`, `refund`, `queryRefundStatus`
- HMAC SHA256 signing using official MoMo raw signature field order
- Webhook/IPN signature verification helper
- Built-in timeout and normalized errors (`MomoSdkError`, `MomoApiError`)
- Works on Node.js >= 18

## Install

```bash
npm install momo-sdk
```

For local development in this repo:

```bash
npm install
npm run build
npm test
```

## Quick Start

```ts
import { MomoClient } from "momo-sdk";

const momo = new MomoClient({
  partnerCode: process.env.MOMO_PARTNER_CODE!,
  accessKey: process.env.MOMO_ACCESS_KEY!,
  secretKey: process.env.MOMO_SECRET_KEY!,
  env: "sandbox" // or "production"
});

const payment = await momo.createPayment({
  amount: 150000,
  orderId: `order-${Date.now()}`,
  orderInfo: "Thanh toan don hang #123",
  redirectUrl: "https://your-site.com/payment/return",
  ipnUrl: "https://your-api.com/payment/momo/ipn",
  extraData: "",
  requestType: "captureWallet",
  autoCapture: true,
  lang: "vi"
});

console.log(payment.payUrl);
```

## API

### `createPayment(request)`

- Calls `POST /v2/gateway/api/create`
- Auto-generates `requestId`
- Signs payload with field order:
  `accessKey,amount,extraData,ipnUrl,orderId,orderInfo,partnerCode,redirectUrl,requestId,requestType`

### `queryTransaction(request)`

- Calls `POST /v2/gateway/api/query`
- Signature fields:
  `accessKey,orderId,partnerCode,requestId`

### `refund(request)`

- Calls `POST /v2/gateway/api/refund`
- Signature fields:
  `accessKey,amount,description,orderId,partnerCode,requestId,transId`

### `queryRefundStatus(request)`

- Calls `POST /v2/gateway/api/refund/query`
- Signature fields:
  `accessKey,orderId,partnerCode,requestId`

### `verifyWebhookSignature(payload)`

Validate `signature` sent by MoMo webhook/IPN payload.

```ts
app.post("/payment/momo/ipn", express.json(), (req, res) => {
  if (!momo.verifyWebhookSignature(req.body)) {
    res.status(400).json({ message: "Invalid signature" });
    return;
  }

  // Process success/fail by resultCode and orderId
  res.status(204).end();
});
```

## Error Handling

```ts
import { MomoApiError, MomoSdkError } from "momo-sdk";

try {
  await momo.queryTransaction({ orderId: "order-1" });
} catch (err) {
  if (err instanceof MomoApiError) {
    console.error(err.resultCode, err.message, err.requestId);
  } else if (err instanceof MomoSdkError) {
    console.error(err.code, err.message);
  }
}
```

## Endpoints

Default base URLs:

- Sandbox: `https://test-payment.momo.vn`
- Production: `https://payment.momo.vn`

Override with `baseUrl` if needed.

## Notes

- This SDK is server-side only because it needs `secretKey`.
- Always verify webhook signature before updating payment status.
