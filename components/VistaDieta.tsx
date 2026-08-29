'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { FileText, Upload, Download, Loader2 } from 'lucide-react';

export default function VistaDieta() {
  const { profile } = useStore();
  const [dietas, setDietas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile?.rol === 'admin') {
      supabase.from('perfiles').select('id, nombre_completo').eq('rol', 'cliente').then(({ data }) => setClientes(data || []));
    }
    fetchDietas();
  }, [profile]);

  const fetchDietas = async () => {
    setLoading(true);
    const query = supabase.from('dietas').select('*, cliente:perfiles!dietas_cliente_id_fkey(nombre_completo)').order('created_at', { ascending: false });
    if (profile?.rol === 'cliente') query.eq('cliente_id', profile.id);
    
    const { data } = await query;
    if (data) setDietas(data);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCliente) return alert('Selecciona cliente y archivo.');
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedCliente}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('dietas_pdf').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('dietas_pdf').getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('dietas').insert({
        cliente_id: selectedCliente,
        entrenador_id: profile?.id,
        titulo: file.name,
        pdf_url: publicUrlData.publicUrl
      });
      if (dbError) throw dbError;
      
      alert('Dieta asignada con éxito');
      setFile(null);
      fetchDietas();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 mt-6">
      <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-amber-400" /> {profile?.rol === 'admin' ? 'Gestión de Dietas' : 'Mi Plan Nutricional'}
      </h2>

      {profile?.rol === 'admin' && (
        <form onSubmit={handleUpload} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Seleccionar Cliente</label>
            <select value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 outline-none">
              <option value="">Elegir...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre_completo}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Archivo PDF</label>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-zinc-950" />
          </div>
          <button type="submit" disabled={uploading} className="w-full bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Subir Dieta</>}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
      ) : dietas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">No hay dietas disponibles.</div>
      ) : (
        <div className="space-y-3">
          {dietas.map(dieta => (
            <div key={dieta.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800"><FileText className="w-5 h-5 text-zinc-300" /></div>
                <div className="truncate">
                  <p className="text-sm font-bold text-zinc-100 truncate">{dieta.titulo}</p>
                  {profile?.rol === 'admin' && <p className="text-[10px] text-amber-400 uppercase">Para: {dieta.cliente?.nombre_completo}</p>}
                </div>
              </div>
              <a href={dieta.pdf_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition shrink-0">
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}