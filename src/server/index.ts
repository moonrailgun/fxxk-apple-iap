import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), './.env') });
import express from 'express';
import ViteExpress from 'vite-express';
import { fetchNotificationHistory } from './iap';
import Fuse from 'fuse.js';
import { adminAuth, auth, authSecret } from './middleware/auth';
import jwt from 'jsonwebtoken';

const app = express();

const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get('/hello', (_, res) => {
  res.send('Hello Vite + React + TypeScript!');
});

let isRefreshing = false;
let cachedNotificationHistory = [];

function updateNotificationHistory() {
  isRefreshing = true;
  console.time('fetchNotificationHistory usage');
  fetchNotificationHistory()
    .then((history) => {
      console.log('Loaded notification history, count:', history.length);
      console.timeEnd('fetchNotificationHistory usage');

      cachedNotificationHistory = [...history];
    })
    .catch((err) => {
      console.error('[fetchNotificationHistory]', err);
    })
    .finally(() => {
      isRefreshing = false;
    });
}

updateNotificationHistory();

app.post('/api/refresh', auth(), (_, res) => {
  if (isRefreshing) {
    throw new Error('Is Refreshing!');
  }

  updateNotificationHistory();
  res.send('Refreshed!');
});

app.post('/api/login', (req, res) => {
  if (!adminAuth.username || !adminAuth.password) {
    res.status(401).end('Server not set env: ADMIN_USER, ADMIN_PASS');
    return;
  }

  const { username, password } = req.body;

  if (username === adminAuth.username && password === adminAuth.password) {
    // 用户名和密码都正确，返回token
    const token = jwt.sign(
      {
        username,
        platform: 'admin',
      },
      authSecret,
      {
        expiresIn: '2h',
      }
    );

    res.status(200).json({
      username,
      token: token,
      expiredAt: new Date().valueOf() + 2 * 60 * 60 * 1000,
    });
  } else {
    res.status(401).end('username or password incorrect');
  }
});

app.get('/api/appleTransaction', auth(), async (req, res) => {
  const { q } = req.query;

  if (q) {
    const fuse = new Fuse(cachedNotificationHistory, {
      keys: [
        'signedPayload',
        'firstSendAttemptResult',
        'raw.notificationType',
        'raw.subtype',
        'raw.notificationUUID',
        'raw.data.appAppleId',
        'raw.data.bundleId',
        'raw.data.bundleVersion',
        'raw.data.environment',
        'raw.data.signedTransactionInfo',
        'raw.data.signedRenewalInfo',
        'raw.data.status',
        'transactionDecodedPayload.transactionId',
        'transactionDecodedPayload.originalTransactionId',
        'transactionDecodedPayload.webOrderLineItemId',
        'transactionDecodedPayload.bundleId',
        'transactionDecodedPayload.productId',
        'transactionDecodedPayload.subscriptionGroupIdentifier',
        'transactionDecodedPayload.quantity',
        'transactionDecodedPayload.type',
        'transactionDecodedPayload.appAccountToken',
        'transactionDecodedPayload.inAppOwnershipType',
        'transactionDecodedPayload.environment',
        'transactionDecodedPayload.transactionReason',
        'transactionDecodedPayload.storefront',
        'transactionDecodedPayload.storefrontId',
        'transactionDecodedPayload.price',
        'transactionDecodedPayload.currency',
      ],
    });
    const result = fuse.search(String(q));

    const list = result.map((item) => item.item);

    res.header('x-total-count', String(list.length)).json([...list]);
  } else {
    res
      .header('x-total-count', String(cachedNotificationHistory.length))
      .json([...cachedNotificationHistory].reverse());
  }
});

if (process.env.NODE_ENV === 'production') {
  ViteExpress.config({
    mode: 'production',
  });
}

ViteExpress.listen(app, port, () =>
  console.log(
    `Server is listening on port ${port}, visit with: http://localhost:${port}`
  )
);
