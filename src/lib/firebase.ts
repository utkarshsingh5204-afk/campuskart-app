import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { OrderItem, OrderRecord } from '../types';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyAP3-UTX-SMlZSn4-cG8BRP9peysgOVHJU',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'campuskart-3c102.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campuskart-3c102',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'campuskart-3c102.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '887815389379',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:887815389379:web:9ef75ecea2ba7f1ed3e276',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5LBGQXYJFR',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics unavailable in restricted browser contexts
    });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function getFirstName(user: User | null): string {
  if (!user) return '';
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim().split(/\s+/)[0];
  }
  if (user.email) {
    return user.email.split('@')[0];
  }
  return 'Student';
}

export async function placeOrder(params: {
  user: User;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<string> {
  const { user, items, subtotal, deliveryFee, total } = params;
  const ordersPath = 'orders';

  const rawName = (user.displayName || getFirstName(user) || 'Student').trim();
  const safeUserName = rawName.slice(0, 120) || 'Student';
  const safeEmail = (user.email || '').trim().slice(0, 254);

  const payload = {
    userId: user.uid,
    userName: safeUserName,
    email: safeEmail,
    items: items.slice(0, 50).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      emoji: item.emoji,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal,
    deliveryFee,
    total,
    time: serverTimestamp(),
    createdAtMs: Date.now(),
  };

  try {
    const docRef = await addDoc(collection(db, ordersPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ordersPath);
  }
}

export function subscribeToUserOrders(
  userId: string,
  onOrders: (orders: OrderRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  const ordersPath = 'orders';
  const q = query(collection(db, ordersPath), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let timeMs =
          typeof data.createdAtMs === 'number' ? data.createdAtMs : 0;
        if (data.time instanceof Timestamp) {
          timeMs = data.time.toMillis();
        } else if (
          data.time &&
          typeof data.time === 'object' &&
          typeof data.time.toMillis === 'function'
        ) {
          timeMs = data.time.toMillis();
        }

        return {
          id: docSnap.id,
          userId: String(data.userId ?? ''),
          userName: String(data.userName ?? ''),
          email: String(data.email ?? ''),
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal ?? 0),
          deliveryFee: Number(data.deliveryFee ?? 0),
          total: Number(data.total ?? 0),
          timeMs,
        };
      });

      orders.sort((a, b) => b.timeMs - a.timeMs);
      onOrders(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      } catch (wrapped) {
        onError(
          wrapped instanceof Error ? wrapped : new Error(String(wrapped))
        );
      }
    }
  );
}
