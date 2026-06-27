import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, addDoc, serverTimestamp as firestoreServerTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, push, onValue, serverTimestamp as rtdbServerTimestamp, off, increment, update, set, remove } from 'firebase/database';

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  members?: string[];
  createdAt?: any;
  messageCount?: number;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  text: string;
  createdAt: any;
  edited?: boolean;
  editedAt?: any;
}

export const subscribeToChannels = (workspaceId: string, callback: (channels: Channel[]) => void) => {
  const channelsRef = ref(rtdb, `channels/${workspaceId}`);
  onValue(channelsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const channelsList = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        ...value,
        createdAt: new Date(value.createdAt || Date.now())
      }));
      channelsList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      callback(channelsList);
    } else {
      callback([]);
    }
  });

  return () => {
    off(channelsRef);
  };
};

export const createChannel = async (workspaceId: string, name: string, type: 'public' | 'private' | 'dm' = 'public', members: string[] = []) => {
  const channelsRef = ref(rtdb, `channels/${workspaceId}`);
  const newChannel = {
    workspaceId,
    name,
    type,
    members: members.length > 0 ? members : null,
    createdAt: rtdbServerTimestamp(),
    messageCount: 0
  };
  const newChannelRef = await push(channelsRef, newChannel);
  return { id: newChannelRef.key!, ...newChannel } as unknown as Channel;
};

export const subscribeToMessages = (channelId: string, callback: (messages: Message[]) => void) => {
  if (!channelId || channelId === 'bot') {
    return () => {};
  }
  
  const messagesRef = ref(rtdb, `messages/${channelId}`);
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messagesList = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        ...value,
        createdAt: new Date(value.createdAt || Date.now())
      }));
      messagesList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      callback(messagesList);
    } else {
      callback([]);
    }
  });

  return () => {
    off(messagesRef);
  };
};

export const sendMessageToChannel = async (
  workspaceId: string,
  channelId: string, 
  senderId: string, 
  senderName: string, 
  text: string,
  senderImage?: string
) => {
  const messagesRef = ref(rtdb, `messages/${channelId}`);
  await push(messagesRef, {
    channelId,
    senderId,
    senderName,
    senderImage: senderImage || null,
    text,
    createdAt: rtdbServerTimestamp()
  });
  
  // Increment channel message count
  if (workspaceId) {
    const channelRef = ref(rtdb, `channels/${workspaceId}/${channelId}`);
    await update(channelRef, {
      messageCount: increment(1)
    });
  }
};

export const subscribeToReadStates = (userId: string, callback: (readStates: Record<string, number>) => void) => {
  if (!userId) return () => {};
  const readStatesRef = ref(rtdb, `userReads/${userId}`);
  onValue(readStatesRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return () => off(readStatesRef);
};

export const markChannelAsRead = async (userId: string, channelId: string, messageCount: number) => {
  if (!userId || !channelId || messageCount === undefined) return;
  const readStateRef = ref(rtdb, `userReads/${userId}/${channelId}`);
  await set(readStateRef, messageCount);
};

export const editMessage = async (channelId: string, messageId: string, newText: string) => {
  const messageRef = ref(rtdb, `messages/${channelId}/${messageId}`);
  await update(messageRef, {
    text: newText,
    edited: true,
    editedAt: rtdbServerTimestamp()
  });
};

export const deleteMessage = async (workspaceId: string, channelId: string, messageId: string) => {
  const messageRef = ref(rtdb, `messages/${channelId}/${messageId}`);
  await remove(messageRef);
  
  // Decrement channel message count
  if (workspaceId) {
    const channelRef = ref(rtdb, `channels/${workspaceId}/${channelId}`);
    await update(channelRef, {
      messageCount: increment(-1)
    });
  }
};
