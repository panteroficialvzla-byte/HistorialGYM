'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function VistaChat() {
  const { profile } = useStore();
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.rol === 'admin') {
      supabase.from('perfiles').select('*').eq('rol', 'cliente').then(({ data }) => {
        setClientes(data || []);
        setLoading(false);
      });
    } else {
      supabase.from('perfiles').select('id').eq('rol', 'admin').limit(1).single().then(({ data }) => {
        if (data) setSelectedChat({ id: data.id, nombre_completo: 'G.I. FIT (Entrenador)' });
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!selectedChat) return;
    setLoading(true);
    fetchMensajes();
    
    const channel = supabase.channel('mensajes_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
        setMensajes(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat]);

  const fetchMensajes = async () => {
    const { data } = await supabase.from('mensajes').select('*')
      .or(`and(remitente_id.eq.${profile?.id},receptor_id.eq.${selectedChat.id}),and(remitente_id.eq.${selectedChat.id},receptor_id.eq.${profile?.id})`)
      .order('created_at', { ascending: true });
    if (data) setMensajes(data);
    setLoading(false);
    scrollToBottom();
  };

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedChat) return;
    const msg = nuevoMensaje;
    setNuevoMensaje('');
    await supabase.from('mensajes').insert({ remitente_id: profile?.id, receptor_id: selectedChat.id, contenido: msg });
  };

  if (profile?.rol === 'admin' && !selectedChat) {
    return (
      <div className="max-w-xl mx-auto px-4 mt-6 pb-20">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-amber-400" /> Chats
        </h2>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div> : (
          <div className="space-y-3">
            {clientes.map(c => (
              <button key={c.id} onClick={() => setSelectedChat(c)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-amber-500/50 transition">
                <img src={c.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Default'} alt="avatar" className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-700" />
                <p className="text-sm font-bold text-zinc-100 capitalize">{c.nombre_completo}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <header className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
        {profile?.rol === 'admin' && <button onClick={() => setSelectedChat(null)} className="text-zinc-400 p-1 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>}
        <h2 className="text-sm font-bold text-zinc-100 capitalize">{selectedChat?.nombre_completo}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {loading ? <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div> : 
          mensajes.map(m => {
            const isMe = m.remitente_id === profile?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-amber-500 text-zinc-950 rounded-br-sm font-medium' : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'}`}>
                  {m.contenido}
                </div>
              </div>
            );
          })
        }
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={enviarMensaje} className="fixed bottom-[65px] left-0 right-0 max-w-xl mx-auto p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2 z-20">
        <input type="text" value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-zinc-100 outline-none focus:border-amber-500" />
        <button type="submit" className="bg-amber-500 text-zinc-950 p-3 rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}