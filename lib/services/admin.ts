import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';

export interface SuperAdminUser {
  uid: string;
  email: string;
  addedAt?: any;
}

export const getAllSuperAdmins = async (): Promise<SuperAdminUser[]> => {
  try {
    const q = query(collection(db, 'super_admins'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email || 'Correo Desconocido',
      addedAt: doc.data().addedAt
    } as SuperAdminUser));
  } catch (error) {
    const parsed = parseFirebaseError(error, 'cargar lista de super admins');
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const addSuperAdminByEmail = async (email: string): Promise<SuperAdminUser> => {
  try {
    // 1. Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No se encontró ningún usuario registrado con el correo: ${email}`);
    }

    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id;

    // 2. Add to super_admins collection
    const superAdminRef = doc(db, 'super_admins', uid);
    
    // Check if already super admin
    const existSnap = await getDoc(superAdminRef);
    if (existSnap.exists()) {
      throw new Error(`El usuario ${email} ya es Super Admin.`);
    }

    await setDoc(superAdminRef, {
      uid,
      email: email.trim(),
      addedAt: serverTimestamp()
    });

    return {
      uid,
      email: email.trim(),
      addedAt: new Date()
    };
  } catch (error: any) {
    if (error.message && error.message.includes('No se encontró') || error.message.includes('ya es Super Admin')) {
      throw error;
    }
    const parsed = parseFirebaseError(error, `agregar super admin ${email}`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const syncMissingBusinessPortals = async (): Promise<number> => {
  try {
    let count = 0;
    const workspacesRef = collection(db, 'workspaces');
    const portalsRef = collection(db, 'business_portals');
    
    const wsSnap = await getDocs(workspacesRef);
    for (const wsDoc of wsSnap.docs) {
      const wsData = wsDoc.data();
      const portalSnap = await getDocs(query(portalsRef, where('__name__', '==', wsDoc.id)));
      if (portalSnap.empty) {
        await setDoc(doc(db, 'business_portals', wsDoc.id), {
          workspaceId: wsDoc.id,
          name: `${wsData.name || 'Workspace'} - Portal de Negocio`,
          isActive: true,
          createdAt: serverTimestamp()
        });
        count++;
      }
    }
    return count;
  } catch (error) {
    const parsed = parseFirebaseError(error, 'sincronizar portales faltantes');
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const removeSuperAdmin = async (uid: string) => {
  try {
    const superAdminRef = doc(db, 'super_admins', uid);
    await deleteDoc(superAdminRef);
  } catch (error) {
    const parsed = parseFirebaseError(error, `remover super admin ${uid}`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};
