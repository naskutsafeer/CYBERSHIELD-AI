import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export interface ThreatLog {
  userId: string;
  type: string;
  threat: string;
  risk_level: string;
  confidence: number;
  timestamp: Timestamp;
}

export const logThreat = async (userId: string, type: string, result: any) => {
  const path = "threat_history";
  try {
    await addDoc(collection(db, path), {
      userId,
      type,
      threat: result.threat,
      risk_level: result.risk_level,
      confidence: result.confidence,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getThreatHistory = async (userId: string) => {
  const path = "threat_history";
  try {
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ThreatLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: Timestamp;
}

export const syncUserProfile = async (user: any) => {
  const path = "users";
  try {
    const userDoc = doc(db, path, user.uid);
    const snapshot = await getDoc(userDoc);
    const isAdminEmail = user.email === "naskutsafeer321@gmail.com";
    
    if (!snapshot.exists()) {
      await setDoc(userDoc, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Anonymous",
        role: isAdminEmail ? "admin" : "user",
        createdAt: Timestamp.now(),
      });
    } else if (isAdminEmail && snapshot.data()?.role !== "admin") {
      // Ensure default admin always has admin role even if profile existed
      await updateDoc(userDoc, { role: "admin" });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getAllUsers = async () => {
  const path = "users";
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: "admin" | "user") => {
  const path = "users";
  try {
    const userDoc = doc(db, path, userId);
    await updateDoc(userDoc, { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const path = "users";
  try {
    const userDoc = doc(db, path, userId);
    await updateDoc(userDoc, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteUserDoc = async (userId: string) => {
  const path = "users";
  try {
    const userDoc = doc(db, path, userId);
    await deleteDoc(userDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addUser = async (data: { email: string; displayName: string; role: "admin" | "user" }) => {
  const path = "users";
  try {
    // Generate a random ID for the new user profile (since we're not using Auth UID here)
    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, {
      uid: newDocRef.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: Timestamp.now(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const resetUserPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export interface Feedback {
  userId: string;
  userEmail: string;
  type: "bug" | "feature" | "other";
  subject: string;
  message: string;
  timestamp: Timestamp;
  status: "new" | "in-progress" | "resolved";
}

export const submitFeedback = async (data: Omit<Feedback, "timestamp" | "status">) => {
  const path = "feedback";
  try {
    await addDoc(collection(db, path), {
      ...data,
      timestamp: Timestamp.now(),
      status: "new",
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getFeedback = async () => {
  const path = "feedback";
  try {
    const q = query(collection(db, path), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback & { id: string }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateFeedbackStatus = async (feedbackId: string, status: Feedback["status"]) => {
  const path = "feedback";
  try {
    const feedbackDoc = doc(db, path, feedbackId);
    await updateDoc(feedbackDoc, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
