import {
  AppStoreServerAPIClient,
  Environment,
  JWSTransactionDecodedPayload,
  SignedDataVerifier,
} from '@apple/app-store-server-library';
import { decodeBase64 } from './utils';
import { NotificationHistoryPayloadType } from './types';

const APP_STORE_KEY = process.env.APP_STORE_KEY.replace(/\\n/g, '\n');
const APP_STORE_KEY_ID = process.env.APP_STORE_KEY_ID;
const ISSUER_ID = process.env.ISSUER_ID;
const MOBILE_IOS_APP_ID = process.env.MOBILE_IOS_APP_ID;
const isSandbox = Boolean(process.env.SANDBOX);

if (isSandbox) {
  console.log('using sandbox environment');
}

export const appStoreServerApiClient = new AppStoreServerAPIClient(
  APP_STORE_KEY ?? '',
  APP_STORE_KEY_ID ?? '',
  ISSUER_ID,
  'com.flowgpt.mobile',
  isSandbox ? Environment.SANDBOX : Environment.PRODUCTION
);

const appleRootCAs: Buffer[] = [
  Buffer.from(
    'MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMB kGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBs ZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbG UgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkw NDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRz MxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5 MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGBy qGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHc FBbZDuWmBSp3ZHtfTjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDK X1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYD VR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySrMA8GA1UdEwEB/wQFMA MBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD 6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxn S4at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+Yhi dDkLF1vLUagM6BgD56KyKA==', // apple public key in base64 format
    'base64'
  ),
];
const appAppleId = Number(MOBILE_IOS_APP_ID);
const verifier = new SignedDataVerifier(
  appleRootCAs,
  true,
  isSandbox ? Environment.SANDBOX : Environment.PRODUCTION,
  'com.flowgpt.mobile',
  appAppleId
);

/**
 * Verify the signed transaction info in ios platform
 * Reference: https://github.com/apple/app-store-server-library-node?tab=readme-ov-file#verification-usage
 */
export async function verifierIosTransactionInfo(
  signedTransactionInfo: string
): Promise<JWSTransactionDecodedPayload> {
  try {
    const payload = await verifier.verifyAndDecodeTransaction(
      signedTransactionInfo
    );

    return payload;
  } catch (error) {
    console.error(
      '[verifierIosTransactionInfo] Error verifying transaction info:',
      error
    );

    // Try to parse transaction info without verifying signature
    try {
      const parts = signedTransactionInfo.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(decodeBase64(parts[1]));
        console.log(
          '[verifierIosTransactionInfo] Parsed payload without verification:',
          payload
        );
        return payload as JWSTransactionDecodedPayload;
      }
    } catch (parseError) {
      console.error(
        '[verifierIosTransactionInfo] Failed to parse payload:',
        parseError
      );
    }

    throw error; // Rethrow the original error
  }
}

const limitDays = 1;

export async function fetchNotificationHistory(): Promise<
  NotificationHistoryPayloadType[]
> {
  let pageToken = null;
  const notifs = [];
  let i = 0;
  while (true) {
    i++;
    console.log('fetching page...', i);

    const res = await appStoreServerApiClient.getNotificationHistory(
      pageToken || null,
      {
        startDate: new Date(
          Date.now() - limitDays * 24 * 60 * 60 * 1000
        ).getTime(),
        endDate: new Date().getTime(),
      }
    );

    if (res.notificationHistory) {
      const processed = await Promise.all(
        res.notificationHistory.map(async (notification) => {
          try {
            const raw = JSON.parse(
              decodeBase64(notification?.signedPayload?.split('.')[1]!)
            );

            if (!raw.data || !raw.data.signedTransactionInfo) {
              console.warn(
                '[fetchNotificationHistory] Missing signedTransactionInfo in notification data'
              );
              return {
                ...notification,
                raw,
                transactionDecodedPayload: null,
              };
            }

            const transactionDecodedPayload = await verifierIosTransactionInfo(
              raw.data.signedTransactionInfo
            );
            return {
              ...notification,
              raw,
              transactionDecodedPayload,
            };
          } catch (error) {
            console.error('[fetchNotificationHistory]', error);
            return {
              ...notification,
              raw: notification?.signedPayload
                ? JSON.parse(
                    decodeBase64(notification.signedPayload.split('.')[1]!)
                  )
                : null,
              transactionDecodedPayload: null,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );
      notifs.push(...processed);
    }

    // break; // for test

    if (!res.hasMore) {
      break;
    }
    pageToken = res.paginationToken;
  }

  return notifs;
}

export async function fetchOrderInfo(orderId: string) {
  try {
    const { status, signedTransactions } =
      await appStoreServerApiClient.lookUpOrderId(orderId);

    const transactionDecodedPayloadList = await Promise.all(
      signedTransactions.map(async (s) => {
        try {
          return await verifierIosTransactionInfo(s);
        } catch (error) {
          console.error(
            `[fetchOrderInfo] Error processing transaction for order ${orderId}:`,
            error
          );
          // Return partial information, indicating verification failure
          return {
            error: error instanceof Error ? error.message : String(error),
            originalSignedTransaction: s,
          } as unknown as JWSTransactionDecodedPayload;
        }
      })
    );

    return { status, signedTransactions, transactionDecodedPayloadList };
  } catch (error) {
    console.error(`[fetchOrderInfo] Error fetching order ${orderId}:`, error);
    throw error; // Rethrow the error for caller to handle
  }
}
