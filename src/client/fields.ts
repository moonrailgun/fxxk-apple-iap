import {
  createDateTimeField,
  createJSONField,
  createTextAreaField,
  createTextField,
} from 'tushan';

export const appleTransactionFields = [
  createTextField('transactionDecodedPayload.transactionId', {
    label: 'transactionId',
    list: {
      width: 200,
    },
  }),
  createTextField('firstSendAttemptResult', {
    label: 'First Send Attempt Result',
    list: {
      width: 200,
    },
  }),
  createTextField('raw.notificationType', {
    label: 'Notification Type',
    list: {
      width: 200,
    },
  }),
  createTextField('raw.subtype', {
    label: 'subtype',
    list: {
      width: 200,
    },
  }),
  createTextField('transactionDecodedPayload.productId', {
    label: 'productId',
    list: {
      width: 200,
    },
  }),
  createTextField('transactionDecodedPayload.appAccountToken', {
    label: 'appAccountToken',
    list: {
      width: 200,
    },
  }),
  createTextField('transactionDecodedPayload.currency', {
    label: 'currency',
    list: {
      width: 200,
    },
  }),
  createTextField('transactionDecodedPayload.price', {
    label: 'price',
    list: {
      width: 200,
    },
  }),
  createDateTimeField('sendAttempts.0.attemptDate', {
    label: 'AttemptDate',
    format: 'iso',
    list: {
      width: 200,
    },
  }),
  createDateTimeField('transactionDecodedPayload.purchaseDate', {
    label: 'purchaseDate',
    format: 'iso',
    list: {
      width: 200,
    },
  }),
  createDateTimeField('transactionDecodedPayload.expiresDate', {
    label: 'expiresDate',
    format: 'iso',
    list: {
      width: 200,
    },
  }),
  createJSONField('transactionDecodedPayload', {
    list: {
      hidden: true,
    },
  }),
  createJSONField('raw', {
    list: {
      hidden: true,
    },
  }),
  createJSONField('sendAttempts', {
    list: {
      hidden: true,
    },
  }),
  createTextAreaField('signedPayload', {
    list: {
      hidden: true,
    },
  }),
];
