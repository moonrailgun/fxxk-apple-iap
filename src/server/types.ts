interface NotificationData {
  notificationType: string;
  subtype: string;
  notificationUUID: string;
  data: {
    appAppleId: number;
    bundleId: string;
    bundleVersion: string;
    environment: string;
    signedTransactionInfo: string;
    signedRenewalInfo: string;
    status: number;
  };
  version: string;
  signedDate: number;
}

interface SendAttempt {
  attemptDate: number;
  sendAttemptResult: string;
}

interface TransactionDecodedPayload {
  transactionId: string;
  originalTransactionId: string;
  webOrderLineItemId: string;
  bundleId: string;
  productId: string;
  subscriptionGroupIdentifier: string;
  purchaseDate: number;
  originalPurchaseDate: number;
  expiresDate: number;
  quantity: number;
  type: string;
  appAccountToken: string;
  inAppOwnershipType: string;
  signedDate: number;
  environment: string;
  transactionReason: string;
  storefront: string;
  storefrontId: string;
  price: number;
  currency: string;
}

export interface NotificationHistoryPayloadType {
  signedPayload: string;
  firstSendAttemptResult: string;
  sendAttempts: SendAttempt[];
  raw: NotificationData;
  transactionDecodedPayload: TransactionDecodedPayload;
}
