import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';

export interface Task {
  id: string;
  title: string;
  status: string;
  assigneeId?: string;
  assigneeName?: string;
  priority?: string;
  color?: string;
  points?: number;
  tags?: string[];
  description?: string;
  date?: string;
  dueDate?: string;
  completed?: boolean;
  createdAt?: any;
  listId?: string;
}

export const subscribeToTasks = (workspaceId: string, callback: (tasks: Task[]) => void, onError?: (err: Error) => void) => {
  const q = query(collection(db, 'tasks'), where('workspaceId', '==', workspaceId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
  }, (err) => {
    const parsed = parseFirebaseError(err, `escuchar tareas del workspace (workspaceId: ${workspaceId})`);
    logFirebaseError(parsed, err);
    if (onError) onError(new Error(parsed.userMessage));
  });
};

export const getTasks = async (workspaceId: string) => {
  try {
    const q = query(collection(db, 'tasks'), where('workspaceId', '==', workspaceId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    const parsed = parseFirebaseError(error, `obtener tareas del workspace (workspaceId: ${workspaceId})`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const createTask = async (workspaceId: string, task: Omit<Task, 'id'>) => {
  try {
    const colRef = collection(db, 'tasks');
    return await addDoc(colRef, { ...task, workspaceId, createdAt: serverTimestamp() });
  } catch (error) {
    const parsed = parseFirebaseError(error, `crear tarea "${task.title}" en workspace`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const updateTask = async (workspaceId: string, taskId: string, data: Partial<Task>) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    return await updateDoc(taskRef, data);
  } catch (error) {
    const parsed = parseFirebaseError(error, `actualizar tarea (taskId: ${taskId})`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};

export const deleteTask = async (workspaceId: string, taskId: string) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    return await deleteDoc(taskRef);
  } catch (error) {
    const parsed = parseFirebaseError(error, `eliminar tarea (taskId: ${taskId})`);
    logFirebaseError(parsed, error);
    throw new Error(parsed.userMessage);
  }
};
