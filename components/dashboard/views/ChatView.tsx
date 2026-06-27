"use client";

import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, Pencil, Trash2, MessageSquare,
  Bold, Italic, Link as LinkIcon, List as ListIcon, AtSign, Plus, Smile, Send
} from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { sendMessageToChannel, editMessage, deleteMessage } from '@/lib/services/chat';
import { getUserWorkspaces } from '@/lib/services/workspaces';
import { createTask } from '@/lib/services/tasks';

export function ChatView() {
  const { user } = useAuthStore();
  const {
    workspace,
    currentChatId,
    channels,
    chats, setChats,
    messages,
    chatInput, setChatInput,
    isTyping, setIsTyping,
    editingMessageId, setEditingMessageId,
    editingMessageText, setEditingMessageText
  } = useDashboard();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, messages, currentChatId, isTyping]);

  const activeChannel = channels.find(c => c.id === currentChatId);
  const isBot = currentChatId === 'bot';
  
  const title = isBot 
    ? 'AI Assistant' 
    : activeChannel?.type === 'public' 
      ? `# ${activeChannel.name}` 
      : (activeChannel?.name || 'Loading...');
  
  const subtitle = isBot
    ? 'Integración AI para productividad'
    : activeChannel?.type === 'public'
      ? 'General discussions'
      : 'UX/UI Designer';
  
  const icon = isBot ? (
    <div className="flex items-center justify-center h-8 w-8 rounded bg-white text-black shadow-sm"><Sparkles size={16} /></div>
  ) : activeChannel?.type === 'dm' ? (
    <div className="flex items-center justify-center h-8 w-8 rounded bg-white/20 text-white font-bold text-sm">
      {activeChannel.name.charAt(0).toUpperCase()}
    </div>
  ) : (
    <span className="text-text-muted text-lg font-bold">#</span>
  );

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    if (currentChatId === 'bot') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMessage = { id: Date.now(), sender: 'Tú', time, text: chatInput, isUser: true };
  
      setChats((prev: any) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), newMessage]
      }));
      setChatInput('');
      setIsTyping(true);

      const handleAIAssistantMessage = async (userInput: string) => {
        let history = (chats['bot'] || [])
          .filter((msg: any) => msg.text !== 'Ejecutando herramientas...')
          .map((msg: any) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text || ''
          }));
          
        history.push({ role: 'user', content: userInput });

        const callAI = async (messagesArray: any[]) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/ai/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: messagesArray })
            });
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);
            
            const message = data.choices[0].message;
            
            if (message.tool_calls && message.tool_calls.length > 0) {
              setChats((prev: any) => ({
                ...prev,
                ['bot']: [...(prev['bot'] || []), { id: Date.now(), sender: 'AI Assistant', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Ejecutando herramientas...', isBot: true }]
              }));
              
              messagesArray.push(message);

              for (const toolCall of message.tool_calls) {
                const funcName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments || '{}');
                let result = '';

                if (funcName === 'get_user_workspaces') {
                  const wrks = await getUserWorkspaces(user!.uid);
                  result = JSON.stringify(wrks.map(w => ({ id: w.id, name: w.name })));
                } else if (funcName === 'create_task') {
                  try {
                    await createTask(args.workspaceId, {
                      title: args.title,
                      description: args.description || '',
                      status: args.status || 'Todo',
                    });
                    result = `Tarea creada exitosamente en el proyecto con ID ${args.workspaceId}`;
                  } catch (e: any) {
                    result = `Error al crear tarea: ${e.message}`;
                  }
                } else {
                  result = `Función desconocida: ${funcName}`;
                }

                messagesArray.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  name: funcName,
                  content: result
                });
              }

              await callAI(messagesArray);

            } else {
              setChats((prev: any) => {
                const currentList = prev['bot'] || [];
                const filtered = currentList.filter((m: any) => m.text !== 'Ejecutando herramientas...');
                return {
                ...prev,
                ['bot']: [...filtered, { 
                  id: Date.now(), 
                  sender: 'AI Assistant', 
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                  text: message.content, 
                  isBot: true 
                }]
              }});
              setIsTyping(false);
            }
            
          } catch (error) {
             setChats((prev: any) => {
               const currentList = prev['bot'] || [];
               const filtered = currentList.filter((m: any) => m.text !== 'Ejecutando herramientas...');
               return {
                 ...prev,
                 ['bot']: [...filtered, { id: Date.now(), sender: 'Sistema', time: '', text: 'Error al comunicarse con la IA.', isBot: true }]
               };
             });
             setIsTyping(false);
          }
        };

        await callAI(history);
      };

      handleAIAssistantMessage(chatInput);
    } else {
      const text = chatInput.trim();
      setChatInput('');
      await sendMessageToChannel(
        workspace?.id || '',
        currentChatId, 
        user?.uid || 'anonymous', 
        user?.displayName || 'User', 
        text, 
        user?.photoURL || ''
      );
    }
  };

  const handleEditMessage = (msgId: string, currentText: string) => {
    setEditingMessageId(msgId);
    setEditingMessageText(currentText);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;
    try {
      await editMessage(currentChatId, editingMessageId, editingMessageText.trim());
    } catch (err) {
      console.error('Error al editar mensaje:', err);
    }
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteMessage(workspace?.id || '', currentChatId, msgId);
    } catch (err) {
      console.error('Error al eliminar mensaje:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col ui-view-enter h-full overflow-hidden relative">
      <div className="border-b border-border px-6 py-3 flex items-center z-10 bg-surface">
        <div className="mr-3 relative">
          {icon}
          {isBot && <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full ring-2 ring-surface bg-text-heading"></span>}
        </div>
        <div>
          <h2 className="text-md font-bold text-white leading-none">
            {title}
          </h2>
          <span className="text-xs text-text-muted">{subtitle}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {(isBot ? chats?.['bot'] : messages?.[currentChatId])?.length > 0 ? (
          (isBot ? chats['bot'] : messages[currentChatId]).map((msg: any) => {
            const isMine = isBot ? msg.isUser : (msg.senderId === user?.uid);
            const isEditing = editingMessageId === msg.id;
            return (
            <div key={msg.id} className={`flex group ui-message-enter relative ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 ${isMine ? 'ml-3' : 'mr-3'} mt-1`}>
                {isMine ? (
                  <img className="h-9 w-9 rounded-full object-cover border border-border" src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=333333&color=fff`} alt="" />
                ) : isBot && msg.isBot ? (
                  <div className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center text-white">
                    <Sparkles size={16} />
                  </div>
                ) : (
                  <img className="h-9 w-9 rounded-full object-cover" src={msg.senderImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || msg.sender || 'U')}&background=random&color=fff`} alt="" />
                )}
              </div>
              <div className={`max-w-[75%] ${isMine ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-baseline mb-1 gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {isMine ? (
                    <>
                      <span className="text-xs text-text-muted">
                        {isBot ? msg.time : (msg.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '')}
                      </span>
                      <span className="font-bold text-white text-sm">{user?.displayName || 'Tú'}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-white text-sm">{isBot && msg.isBot ? 'AI Assistant' : msg.senderName || msg.sender}</span>
                      <span className="text-xs text-text-muted">
                        {isBot ? msg.time : (msg.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '')}
                      </span>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <div className={`inline-block w-full ${isMine ? 'text-right' : 'text-left'}`}>
                    <textarea
                      value={editingMessageText}
                      onChange={(e) => setEditingMessageText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') handleCancelEdit(); }}
                      autoFocus
                      rows={2}
                      className="w-full bg-canvas border border-white rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                    />
                    <div className={`flex gap-2 mt-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <button onClick={handleCancelEdit} className="text-xs text-text-muted hover:text-white px-3 py-1 rounded-md ui-list-row transition-colors duration-200">
                        Cancelar
                      </button>
                      <button onClick={handleSaveEdit} disabled={!editingMessageText.trim()} className="text-xs text-white bg-white text-black hover:bg-btn-primary-hover disabled:opacity-50 px-3 py-1 rounded-md transition-all duration-300 font-medium">
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isMine 
                        ? 'bg-white text-black rounded-tr-sm' 
                        : 'bg-surface-hover text-text-body rounded-tl-sm border border-border'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.edited && (
                      <span className={`block text-[10px] text-text-muted mt-0.5 italic ${isMine ? 'text-right' : 'text-left'}`}>(editado)</span>
                    )}
                    {isMine && !isBot && (
                      <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ${isMine ? 'right-full mr-2' : 'left-full ml-2'}`}>
                        <button
                          onClick={() => handleEditMessage(msg.id, msg.text)}
                          className="p-1.5 rounded-md bg-surface-hover hover:bg-surface-hover text-text-muted hover:text-white transition-all duration-300"
                          title="Editar mensaje"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-md bg-surface-hover hover:bg-red-500/20 text-text-muted hover:text-white transition-all duration-300"
                          title="Eliminar mensaje"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted animate-in zoom-in-95">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-3 border border-border">
              <MessageSquare size={32} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-white">Este es el comienzo de la conversación en <strong>{isBot ? 'AI Assistant' : title}</strong>.</p>
            <p className="text-xs mt-1">Envía un mensaje para iniciar.</p>
          </div>
        )}
        {isTyping && (
          <div className="flex group animate-pulse">
             <div className="flex-shrink-0 mr-4 mt-1">
                {currentChatId === 'bot' ? (
                  <div className="h-9 w-9 rounded bg-white text-black flex items-center justify-center text-white"><Sparkles size={16} /></div>
                ) : (
                  <img className="h-9 w-9 rounded object-cover" src="https://ui-avatars.com/api/?name=User&background=10B981&color=fff" alt="" />
                )}
             </div>
             <div className="flex-1 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white text-black rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white text-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white text-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-canvas border-t border-border">
        <div className="bg-surface border border-border rounded-lg overflow-hidden focus-within:border-white transition-all duration-300 shadow-sm">
          <div className="border-b border-border px-2 py-1.5 flex space-x-1 bg-surface-hover">
            <button className="p-1 text-text-muted hover:text-white hover:bg-surface-hover rounded"><Bold size={14} /></button>
            <button className="p-1 text-text-muted hover:text-white hover:bg-surface-hover rounded"><Italic size={14} /></button>
            <button className="p-1 text-text-muted hover:text-white hover:bg-surface-hover rounded"><LinkIcon size={14} /></button>
            <div className="w-px h-4 bg-surface-hover my-auto mx-1"></div>
            <button className="p-1 text-text-muted hover:text-white hover:bg-surface-hover rounded"><ListIcon size={14} /></button>
            <button className="p-1 text-text-muted hover:text-white hover:bg-surface-hover rounded"><AtSign size={14} /></button>
          </div>
          
          <textarea 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={2} 
            className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none resize-none placeholder:text-text-muted" 
            placeholder="Type a message..."
          />
          
          <div className="bg-surface-hover px-2 py-1.5 flex justify-between items-center">
            <div className="flex space-x-1">
              <button className="p-1 text-text-muted hover:text-white rounded"><Plus size={16} /></button>
              <button className="p-1 text-text-muted hover:text-white rounded"><Smile size={16} /></button>
            </div>
            <button 
              onClick={sendMessage}
              disabled={isTyping || !chatInput.trim()}
              className="bg-white text-black hover:bg-btn-primary-hover disabled:opacity-50 disabled:hover:bg-white text-black px-4 py-1.5 rounded text-xs font-bold transition-all duration-300 flex items-center"
            >
              <Send size={12} className="mr-1.5" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
