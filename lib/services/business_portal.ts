import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';

export interface BusinessPortal {
  workspaceId: string;
  name: string;
  isActive: boolean;
  createdAt: any;
}

export const getBusinessPortal = async (workspaceId: string): Promise<BusinessPortal | null> => {
  try {
    const docRef = doc(db, 'business_portals', workspaceId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { workspaceId: snap.id, ...snap.data() } as BusinessPortal;
    }
    return null;
  } catch (error) {
    console.error('🔥 Error fetching business portal:', error);
    return null;
  }
};

export const updateBusinessPortalName = async (workspaceId: string, newName: string) => {
  try {
    const docRef = doc(db, 'business_portals', workspaceId);
    await updateDoc(docRef, { name: newName });
  } catch (error) {
    const parsed = parseFirebaseError(error, `actualizar nombre del portal ${workspaceId}`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};
