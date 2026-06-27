import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';

export interface Ticket {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  type: 'bug' | 'incident' | 'feature' | 'question';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pendiente' | 'revisado' | 'corregido';
  reportedBy: string;
  reportedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const subscribeToTickets = (workspaceId: string, callback: (tickets: Ticket[]) => void, onError?: (err: Error) => void) => {
  const q = query(collection(db, 'tickets'), where('workspaceId', '==', workspaceId));
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    tickets.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(tickets);
  }, (err) => {
    const parsed = parseFirebaseError(err, `escuchar tickets del workspace (workspaceId: ${workspaceId})`);
    logFirebaseError(parsed, err);
    if (onError) onError(new Error(parsed.userMessage));
  });
};

export const createTicket = async (workspaceId: string, ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const colRef = collection(db, 'tickets');
    return await addDoc(colRef, { 
      ...ticket, 
      workspaceId, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    const parsed = parseFirebaseError(error, `crear ticket "${ticket.title}"`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const updateTicket = async (ticketId: string, data: Partial<Ticket>) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    return await updateDoc(ticketRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    const parsed = parseFirebaseError(error, `actualizar ticket (ticketId: ${ticketId})`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};
