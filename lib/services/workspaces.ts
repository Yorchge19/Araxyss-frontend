import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, query, where, serverTimestamp, getDoc, setDoc, updateDoc, arrayUnion, deleteDoc, arrayRemove, deleteField } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';

export type WorkspaceRole = 'Owner' | 'Admin' | 'User' | 'Client';

export interface WorkspaceMember {
  uid: string;
  name: string;
  email: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members?: string[];
  roles?: Record<string, WorkspaceRole>;
  taskStatuses?: string[];
  inviteCode?: string;
  businessInviteCode?: string;
  inviteCodeGeneratedAt?: any;
  businessInviteCodeGeneratedAt?: any;
  createdAt?: any;
}

const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(arr[i] % chars.length);
  }
  return result;
};

const CODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Check if a timestamp is older than 24 hours */
const isCodeExpired = (generatedAt: any): boolean => {
  if (!generatedAt) return true;
  const ts = generatedAt?.toDate ? generatedAt.toDate().getTime() : (typeof generatedAt === 'number' ? generatedAt : new Date(generatedAt).getTime());
  return Date.now() - ts > CODE_TTL_MS;
};

/**
 * Refreshes expired invite codes for a workspace.
 * Returns updated workspace with fresh codes if any were regenerated.
 */
export const refreshExpiredCodes = async (ws: Workspace): Promise<Workspace> => {
  let updated = false;
  const updates: Record<string, any> = {};
  let updatedWs = { ...ws };

  // Check team invite code
  if (isCodeExpired(ws.inviteCodeGeneratedAt)) {
    const newTeamCode = generateCode();
    updates.inviteCode = newTeamCode;
    updates.inviteCodeGeneratedAt = serverTimestamp();
    updatedWs.inviteCode = newTeamCode;
    updated = true;

    // Create new invite doc
    await setDoc(doc(db, 'invites', newTeamCode), {
      workspaceId: ws.id,
      workspaceName: ws.name,
      type: 'team',
      active: true,
      createdAt: serverTimestamp()
    });
    // Deactivate old
    if (ws.inviteCode) {
      try { await deleteDoc(doc(db, 'invites', ws.inviteCode)); } catch(_) {}
    }
  }

  // Check business invite code
  if (isCodeExpired(ws.businessInviteCodeGeneratedAt)) {
    const newBizCode = generateCode();
    updates.businessInviteCode = newBizCode;
    updates.businessInviteCodeGeneratedAt = serverTimestamp();
    updatedWs.businessInviteCode = newBizCode;
    updated = true;

    await setDoc(doc(db, 'invites', newBizCode), {
      workspaceId: ws.id,
      workspaceName: ws.name,
      type: 'business',
      active: true,
      createdAt: serverTimestamp()
    });
    if (ws.businessInviteCode) {
      try { await deleteDoc(doc(db, 'invites', ws.businessInviteCode)); } catch(_) {}
    }
  }

  if (updated) {
    const wsRef = doc(db, 'workspaces', ws.id);
    await updateDoc(wsRef, updates);
  }

  return updatedWs;
};

export const getUserWorkspaces = async (userId: string): Promise<Workspace[]> => {
  try {
    // Try querying by members array-contains first. If a workspace doesn't have members, it won't show up.
    // We assume all new workspaces will have members.
    const q = query(collection(db, 'workspaces'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    
    // As a fallback for older workspaces (if needed), we could also query by ownerId, 
    // but array-contains is the correct approach for the new schema.
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
  } catch (error) {
    const parsed = parseFirebaseError(error, `cargar workspaces del usuario (userId: ${userId})`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

const ROLE_SORT_ORDER: Record<WorkspaceRole, number> = {
  Owner: 0,
  Admin: 1,
  User: 2,
  Client: 3,
};

/** Resuelve los IDs de miembro a partir del documento del workspace */
export const getWorkspaceMemberIds = (workspace: Workspace): string[] => {
  const ids = new Set<string>();
  if (workspace.ownerId) ids.add(workspace.ownerId);
  workspace.members?.forEach((id) => ids.add(id));
  if (workspace.roles) {
    Object.keys(workspace.roles).forEach((id) => ids.add(id));
  }
  return Array.from(ids);
};

export const getWorkspaceMemberCount = (workspace: Workspace): number =>
  getWorkspaceMemberIds(workspace).length;

const BUSINESS_PORTAL_ROLES: WorkspaceRole[] = ['Owner', 'Admin', 'Client'];

/** Workspaces cuyo portal de negocio puede abrir este usuario */
export const getAccessibleBusinessPortals = (
  workspaces: Workspace[],
  userId: string,
  isSuperAdmin = false
): Workspace[] => {
  return workspaces.filter((w) => {
    if (isSuperAdmin) return true;
    const role = w.roles?.[userId];
    return role != null && BUSINESS_PORTAL_ROLES.includes(role);
  });
};

/** Carga nombre, email y rol de cada miembro del workspace */
export const getWorkspaceMembers = async (workspace: Workspace): Promise<WorkspaceMember[]> => {
  const ids = getWorkspaceMemberIds(workspace);
  if (ids.length === 0) return [];

  try {
    const members = await Promise.all(
      ids.map(async (uid) => {
        const role: WorkspaceRole =
          workspace.roles?.[uid] ?? (uid === workspace.ownerId ? 'Owner' : 'User');
        try {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            return {
              uid,
              name: (data.name as string) || (data.displayName as string) || 'Usuario',
              email: (data.email as string) || '—',
              role,
            } satisfies WorkspaceMember;
          }
        } catch {
          /* perfil no legible; mostrar datos mínimos */
        }
        return {
          uid,
          name: `Usuario ${uid.slice(0, 8)}…`,
          email: '—',
          role,
        } satisfies WorkspaceMember;
      })
    );

    return members.sort(
      (a, b) =>
        ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role] ||
        a.name.localeCompare(b.name, 'es')
    );
  } catch (error) {
    const parsed = parseFirebaseError(error, `cargar miembros del workspace "${workspace.name}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const getWorkspaceById = async (workspaceId: string): Promise<Workspace | null> => {
  try {
    const docRef = doc(db, 'workspaces', workspaceId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Workspace;
    }
    return null;
  } catch (error) {
    console.error('Error fetching workspace by ID:', error);
    return null;
  }
};

export const checkIsSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'super_admins', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error verificando super admin:', error);
    return false;
  }
};

export const getAllWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const q = query(collection(db, 'workspaces'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
  } catch (error) {
    const parsed = parseFirebaseError(error, 'cargar todos los workspaces (Super Admin)');
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const docRef = doc(db, 'workspaces', workspaceId);
    await deleteDoc(docRef);
  } catch (error) {
    const parsed = parseFirebaseError(error, `eliminar workspace ${workspaceId}`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const createWorkspace = async (name: string, ownerId: string) => {
  try {
    const colRef = collection(db, 'workspaces');
    const inviteCode = generateCode();
    const businessInviteCode = generateCode();
    
    const d = await addDoc(colRef, { 
      name, 
      ownerId, 
      members: [ownerId], 
      roles: { [ownerId]: 'Owner' },
      taskStatuses: ['To Do', 'In Progress', 'Done'],
      inviteCode,
      businessInviteCode,
      inviteCodeGeneratedAt: serverTimestamp(),
      businessInviteCodeGeneratedAt: serverTimestamp(),
      createdAt: serverTimestamp() 
    });
    
    // Create the team invite document
    await setDoc(doc(db, 'invites', inviteCode), {
      workspaceId: d.id,
      workspaceName: name,
      type: 'team',
      active: true,
      createdAt: serverTimestamp()
    });

    // Create the business invite document
    await setDoc(doc(db, 'invites', businessInviteCode), {
      workspaceId: d.id,
      workspaceName: name,
      type: 'business',
      active: true,
      createdAt: serverTimestamp()
    });
    
    // Cascade creation: 1:1 Business Portal
    const portalRef = doc(db, 'business_portals', d.id);
    await setDoc(portalRef, {
      workspaceId: d.id,
      name: `${name} - Portal de Negocio`,
      isActive: true,
      createdAt: serverTimestamp()
    });

    return { id: d.id, name, ownerId, members: [ownerId], roles: { [ownerId]: 'Owner' }, taskStatuses: ['To Do'], inviteCode, businessInviteCode };
  } catch (error) {
    const parsed = parseFirebaseError(error, `crear workspace "${name}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const joinWorkspaceByCode = async (code: string, userId: string) => {
  try {
    const inviteRef = doc(db, 'invites', code.toUpperCase());
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists() || !inviteSnap.data().active) {
      throw new Error('Código de invitación inválido o inactivo.');
    }
    
    const { workspaceId, type } = inviteSnap.data();
    const role = type === 'business' ? 'Client' : 'User';
    
    // Auto-join
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      members: arrayUnion(userId),
      [`roles.${userId}`]: role,
      lastUsedInviteCode: code.toUpperCase() // triggers rule validation
    });
    
    return workspaceId;
  } catch (error: any) {
    // Preserve custom error messages (like invalid code)
    if (error.message && !error.code) throw error;
    const parsed = parseFirebaseError(error, `unirse al workspace con código "${code}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const generateNewInviteCode = async (workspaceId: string, workspaceName: string, oldCode?: string) => {
  try {
    const newCode = generateCode();
    
    // Create new invite
    await setDoc(doc(db, 'invites', newCode), {
      workspaceId,
      workspaceName,
      type: 'team',
      active: true,
      createdAt: serverTimestamp()
    });
    
    // Update workspace
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      inviteCode: newCode,
      inviteCodeGeneratedAt: serverTimestamp()
    });
    
    // Deactivate or delete old code if provided
    if (oldCode) {
      try {
        await deleteDoc(doc(db, 'invites', oldCode));
      } catch(e) {
        console.warn('[Firebase] No se pudo eliminar el código antiguo:', oldCode, e);
      }
    }
    
    return newCode;
  } catch (error) {
    const parsed = parseFirebaseError(error, `generar nuevo código de invitación para workspace "${workspaceName}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const addWorkspaceTaskStatus = async (workspaceId: string, status: string) => {
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      taskStatuses: arrayUnion(status)
    });
  } catch (error) {
    const parsed = parseFirebaseError(error, `agregar estado "${status}" al workspace`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const updateWorkspaceName = async (workspaceId: string, newName: string) => {
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, { name: newName });
  } catch (error) {
    const parsed = parseFirebaseError(error, `actualizar nombre del workspace a "${newName}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const removeWorkspaceMember = async (workspaceId: string, memberId: string) => {
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      members: arrayRemove(memberId),
      [`roles.${memberId}`]: deleteField()
    });
  } catch (error) {
    const parsed = parseFirebaseError(error, `eliminar miembro ${memberId} del workspace ${workspaceId}`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};
