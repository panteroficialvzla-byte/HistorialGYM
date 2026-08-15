"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ==========================================
// ICONOS MODERNOS (UI Premium) - INTACTOS
// ==========================================
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const IconOrders = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const IconHistory = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
const IconBox = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>;
const IconChat = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>;
const IconSend = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>;
const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
const IconClose = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const IconMoon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>;
const IconSun = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;

// FUNCION UTILITARIA PARA NÚMEROS (Punto en los miles)
const formatearNumero = (num: number) => new Intl.NumberFormat('es-VE').format(num);

export default function RequisicionesJMT() {
  // ==========================================
  // ESTADOS DE AUTENTICACIÓN Y PREFERENCIAS
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rolUsuario, setRolUsuario] = useState<'central' | 'obra' | null>(null);
  const [usuarioActual, setUsuarioActual] = useState('');
  const [obraAsignada, setObraAsignada] = useState('');
  const [emailGuardado, setEmailGuardado] = useState(''); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // UI States
  const [vistaActiva, setVistaActiva] = useState('activos');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaHistorial, setBusquedaHistorial] = useState('');

  // Datos
  const [requisiciones, setRequisiciones] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Modales y Chat en Tiempo Real
  const [modalChat, setModalChat] = useState<any>(null);
  const [mensajesChat, setMensajesChat] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const modalChatIdRef = useRef<number | null>(null); // Referencia vital para que el chat se actualice solo
  
  const [modalUsuario, setModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [formUsuario, setFormUsuario] = useState({ id: '', email: '', password: '', nombre: '', rol: 'obra', obra_asignada: '' });

  const [modalCatalogo, setModalCatalogo] = useState(false);
  const [catalogoEditando, setCatalogoEditando] = useState<any>(null);
  const [formCatalogo, setFormCatalogo] = useState({ id: '', codigo_sku: '', material: '', categoria: 'Obra Gris', unidad: 'Sacos', stock: 0 });

  const [nuevoPedido, setNuevoPedido] = useState({ urgencia: 'Normal', notas: '' });
  const [itemsPedido, setItemsPedido] = useState<any[]>([]);
  const [itemSeleccionado, setItemSeleccionado] = useState('');
  const [cantidadItem, setCantidadItem] = useState('');

  // ==========================================
  // INICIALIZACIÓN Y PERSISTENCIA
  // ==========================================
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('jmt_session');
    const temaGuardado = localStorage.getItem('jmt_theme');
    
    if (temaGuardado === 'dark') setIsDarkMode(true);
    
    if (sesionGuardada) {
      const data = JSON.parse(sesionGuardada);
      setIsLoggedIn(true);
      setRolUsuario(data.rol);
      setUsuarioActual(data.nombre);
      setObraAsignada(data.obra_asignada);
      setEmailGuardado(data.email);
      setVistaActiva('activos');
    }
  }, []);

  // Mantener la referencia del chat actualizada
  useEffect(() => {
    modalChatIdRef.current = modalChat ? modalChat.id : null;
  }, [modalChat]);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    cargarDatosIniciales(true); 
    
    // AUTO-ACTUALIZACIÓN Y VERIFICACIÓN (TIEMPO REAL 3s)
    const interval = setInterval(async () => {
      const { data: usuarioAuth } = await supabase.from('usuarios').select('id').eq('email', emailGuardado).single();
      
      if (!usuarioAuth) {
        handleLogout();
        alert("Su sesión ha sido revocada o la cuenta fue eliminada.");
        return;
      }
      
      await cargarDatosIniciales(false); 

      // Si el chat está abierto, traer mensajes nuevos silenciosamente
      if (modalChatIdRef.current) {
        const { data } = await supabase.from('mensajes_pedido').select('*').eq('requisicion_id', modalChatIdRef.current).order('fecha_hora', { ascending: true });
        setMensajesChat(data || []);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, rolUsuario, emailGuardado]);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('jmt_theme', newTheme ? 'dark' : 'light');
  };

  const cargarDatosIniciales = async (mostrarCargando = false) => {
    if(mostrarCargando) setCargando(true);
    // Se agregan los mensajes al select para poder leer si hay alertas no leídas
    const { data: reqs } = await supabase.from('requisiciones').select('*, detalles_requisicion(*), mensajes_pedido(*)').order('id', { ascending: false });
    const { data: cat } = await supabase.from('catalogo_maestro').select('*').order('material', { ascending: true });
    
    if (rolUsuario === 'central') {
      const { data: users } = await supabase.from('usuarios').select('*').order('nombre', { ascending: true });
      if (users) setUsuarios(users);
    }
    
    if (reqs) setRequisiciones(reqs);
    if (cat) setCatalogo(cat);
    if(mostrarCargando) setCargando(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    const correoLimpio = email.trim().toLowerCase();
    const { data } = await supabase.from('usuarios').select('*').ilike('email', correoLimpio).eq('password', password).eq('activo', true).single();
    
    if (data) {
      setIsLoggedIn(true);
      setRolUsuario(data.rol);
      setUsuarioActual(data.nombre);
      setObraAsignada(data.obra_asignada);
      setEmailGuardado(data.email);
      setLoginError('');
      setVistaActiva('activos');
      
      localStorage.setItem('jmt_session', JSON.stringify({ rol: data.rol, nombre: data.nombre, obra_asignada: data.obra_asignada, email: data.email }));
    } else {
      setLoginError('Credenciales incorrectas o usuario inactivo.');
    }
    setCargando(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setRolUsuario(null); setUsuarioActual(''); setObraAsignada(''); setEmail(''); setPassword(''); setEmailGuardado('');
    localStorage.removeItem('jmt_session');
  };

  // ==========================================
  // LÓGICA DE ESTADOS Y STOCK
  // ==========================================
  const actualizarEstadoPedido = async (id: number, nuevoEstado: string) => {
    await supabase.from('requisiciones').update({ estado: nuevoEstado }).eq('id', id);
    cargarDatosIniciales(false);
  };

  const confirmarRecepcionYDescontarStock = async (req: any) => {
    if(!confirm("¿Confirma que la mercancía fue recibida satisfactoriamente? Esta acción cerrará el pedido y descontará el stock en Central.")) return;
    setCargando(true);
    
    await supabase.from('requisiciones').update({ estado: 'Recibido' }).eq('id', req.id);
    
    for (const item of req.detalles_requisicion) {
      const materialRef = catalogo.find(c => c.material === item.material);
      if (materialRef) {
        const nuevoStock = Number(materialRef.stock || 0) - Number(item.cantidad);
        await supabase.from('catalogo_maestro').update({ stock: nuevoStock }).eq('id', materialRef.id);
      }
    }
    
    await cargarDatosIniciales(true);
    setCargando(false);
  };

  // ==========================================
  // CRUD: CATÁLOGO MAESTRO (Central)
  // ==========================================
  const abrirModalCatalogo = (item: any = null) => {
    if (item) {
      setCatalogoEditando(item);
      setFormCatalogo({ id: item.id, codigo_sku: item.codigo_sku || '', material: item.material, categoria: item.categoria, unidad: item.unidad, stock: item.stock || 0 });
    } else {
      setCatalogoEditando(null);
      setFormCatalogo({ id: '', codigo_sku: '', material: '', categoria: 'Obra Gris', unidad: 'Sacos', stock: 0 });
    }
    setModalCatalogo(true);
  };

  const guardarCatalogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const dataToSave = { codigo_sku: formCatalogo.codigo_sku, material: formCatalogo.material, categoria: formCatalogo.categoria, unidad: formCatalogo.unidad, stock: parseFloat(formCatalogo.stock.toString()) };
    
    if (catalogoEditando) {
      await supabase.from('catalogo_maestro').update(dataToSave).eq('id', formCatalogo.id);
    } else {
      await supabase.from('catalogo_maestro').insert([dataToSave]);
    }
    
    await cargarDatosIniciales(false);
    setModalCatalogo(false);
    setCargando(false);
  };

  const eliminarCatalogo = async (id: number) => {
    if(confirm('¿Seguro que desea eliminar este material del catálogo maestro?')) {
      await supabase.from('catalogo_maestro').delete().eq('id', id);
      cargarDatosIniciales(false);
    }
  };

  // ==========================================
  // CRUD: USUARIOS (Central)
  // ==========================================
  const abrirModalUsuario = (user: any = null) => {
    if (user) {
      setUsuarioEditando(user);
      setFormUsuario({ id: user.id, email: user.email, password: user.password, nombre: user.nombre, rol: user.rol, obra_asignada: user.obra_asignada || '' });
    } else {
      setUsuarioEditando(null);
      setFormUsuario({ id: '', email: '', password: '', nombre: '', rol: 'obra', obra_asignada: '' });
    }
    setModalUsuario(true);
  };

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const dataToSave = { email: formUsuario.email.trim().toLowerCase(), password: formUsuario.password, nombre: formUsuario.nombre, rol: formUsuario.rol, obra_asignada: formUsuario.obra_asignada, activo: true };
    
    if (usuarioEditando) {
      await supabase.from('usuarios').update(dataToSave).eq('id', formUsuario.id);
    } else {
      const { error } = await supabase.from('usuarios').insert([dataToSave]);
      if (error) alert("Error: El correo podría ya estar registrado.");
    }
    
    await cargarDatosIniciales(false);
    setModalUsuario(false);
    setCargando(false);
  };

  const eliminarUsuario = async (id: string) => {
    if(confirm('¿Seguro que desea eliminar permanentemente este usuario? (Su sesión se cerrará automáticamente si está conectado)')) {
      await supabase.from('usuarios').delete().eq('id', id);
      cargarDatosIniciales(false);
    }
  };

  // ==========================================
  // LÓGICA DE PEDIDOS (Obra)
  // ==========================================
  const agregarItem = () => {
    if (!itemSeleccionado || !cantidadItem) return;
    const ref = catalogo.find(c => c.material === itemSeleccionado);
    if (!ref) return;
    setItemsPedido([...itemsPedido, { material: itemSeleccionado, cantidad: parseFloat(cantidadItem), unidad: ref.unidad }]);
    setItemSeleccionado(''); setCantidadItem('');
  };

  const procesarNuevoPedido = async () => {
    if (itemsPedido.length === 0) return alert("Debe añadir materiales.");
    setCargando(true);
    
    const { data: nuevaReq } = await supabase.from('requisiciones').insert([{
      obra: obraAsignada, solicitante: usuarioActual, urgencia: nuevoPedido.urgencia, estado: 'Solicitado', fecha: new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }), notas: nuevoPedido.notas
    }]).select().single();

    if (nuevaReq) {
      const itemsAInsertar = itemsPedido.map(item => ({ requisicion_id: nuevaReq.id, material: item.material, cantidad: item.cantidad, unidad: item.unidad }));
      await supabase.from('detalles_requisicion').insert(itemsAInsertar);
      await cargarDatosIniciales(true);
      setItemsPedido([]); setNuevoPedido({ urgencia: 'Normal', notas: '' });
      setVistaActiva('activos');
    }
    setCargando(false);
  };

  // ==========================================
  // LÓGICA CHAT
  // ==========================================
  const abrirChat = async (req: any) => {
    setModalChat(req);
    const { data } = await supabase.from('mensajes_pedido').select('*').eq('requisicion_id', req.id).order('fecha_hora', { ascending: true });
    setMensajesChat(data || []);
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    const msgData = { requisicion_id: modalChat.id, emisor: usuarioActual, mensaje: nuevoMensaje.trim() };
    const { data } = await supabase.from('mensajes_pedido').insert([msgData]).select().single();
    if (data) { setMensajesChat([...mensajesChat, data]); setNuevoMensaje(''); }
  };

  const navegarA = (vista: string) => { setVistaActiva(vista); setMenuAbierto(false); setBusqueda(''); setBusquedaHistorial(''); };

  // ==========================================
  // RENDER: PANTALLA DE LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className={`max-w-md w-full rounded-3xl shadow-2xl p-8 md:p-10 border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="absolute top-4 right-4"><button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"><IconMoon /></button></div>
          <div className="text-center mb-10">
            <div className="h-16 w-16 bg-[#011C39] rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-6">
              <span className="text-white text-2xl font-black tracking-tight">JMT</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Portal Operativo</h1>
            <p className={`text-sm font-medium mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sistema Integrado de Requisiciones</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Correo Corporativo</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white focus:bg-gray-800' : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white'}`} required placeholder="usuario@jmt.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white focus:bg-gray-800' : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white'}`} required placeholder="••••••••" />
            </div>
            
            {loginError && <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg font-bold text-sm text-center border border-red-200 dark:border-red-800">{loginError}</div>}
            
            <button type="submit" disabled={cargando} className="w-full bg-[#011C39] text-white font-bold rounded-xl py-4 shadow-lg hover:bg-blue-900 transition-all disabled:opacity-70 mt-2">
              {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pedidosFiltrados = rolUsuario === 'central' ? requisiciones : requisiciones.filter(r => r.obra === obraAsignada);
  const catalogoOrdenado = [...catalogo].sort((a, b) => a.material.localeCompare(b.material));
  const pedidosNuevosAlerta = requisiciones.filter(r => r.estado === 'Solicitado').length;

  // ==========================================
  // RENDER: INTERFAZ PRINCIPAL
  // ==========================================
  return (
    <div className={`h-screen flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Header Móvil */}
      <div className={`md:hidden px-4 py-3 flex justify-between items-center z-30 shadow-md ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#011C39] rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xs">JMT</span></div>
          <span className="font-semibold tracking-tight">Operaciones</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-1"><IconMoon /></button>
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="focus:outline-none p-1"><IconMenu /></button>
        </div>
      </div>

      {menuAbierto && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMenuAbierto(false)}></div>}

      {/* Sidebar Corporativo */}
      <aside className={`fixed md:static inset-y-0 left-0 transform ${menuAbierto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 flex flex-col z-50 h-full shadow-2xl md:shadow-none border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-20 hidden md:flex items-center px-8 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="h-10 w-10 bg-[#011C39] rounded-xl flex items-center justify-center mr-3 shadow-md"><span className="text-white font-bold text-sm">JMT</span></div>
          <h1 className="font-bold text-lg tracking-tight">Constructora</h1>
        </div>
        
        <div className={`p-8 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sesión Activa</p>
          <p className="font-bold text-lg truncate">{usuarioActual}</p>
          <p className="text-sm font-medium text-[#011C39] dark:text-blue-400 truncate mb-3">{obraAsignada}</p>
          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wide ${isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{rolUsuario}</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Principal</p>
          <button onClick={() => navegarA('activos')} className={`w-full flex items-center justify-between py-3 px-4 font-medium rounded-xl transition-all ${vistaActiva === 'activos' ? 'bg-[#011C39] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <div className="flex items-center gap-3"><IconDashboard /> Monitor en Curso</div>
            {/* NOTIFICACIÓN CENTRAL NUEVO PEDIDO */}
            {rolUsuario === 'central' && pedidosNuevosAlerta > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">{pedidosNuevosAlerta} NUEVOS</span>
            )}
          </button>
          
          {rolUsuario === 'obra' && (
            <button onClick={() => navegarA('nuevo')} className={`w-full flex items-center gap-3 py-3 px-4 font-medium rounded-xl transition-all ${vistaActiva === 'nuevo' ? 'bg-[#011C39] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}><IconOrders /> Solicitar Material</button>
          )}

          <button onClick={() => navegarA('historial')} className={`w-full flex items-center gap-3 py-3 px-4 font-medium rounded-xl transition-all ${vistaActiva === 'historial' ? 'bg-[#011C39] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}><IconHistory /> {rolUsuario === 'central' ? 'Auditoría Histórica' : 'Archivo (Cerrados)'}</button>

          {rolUsuario === 'central' && (
            <>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Administración</p>
              <button onClick={() => navegarA('catalogo')} className={`w-full flex items-center gap-3 py-3 px-4 font-medium rounded-xl transition-all ${vistaActiva === 'catalogo' ? 'bg-[#011C39] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}><IconBox /> Catálogo Maestro</button>
              <button onClick={() => navegarA('usuarios')} className={`w-full flex items-center gap-3 py-3 px-4 font-medium rounded-xl transition-all ${vistaActiva === 'usuarios' ? 'bg-[#011C39] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}><IconUsers /> Cuentas de Acceso</button>
            </>
          )}
        </nav>

        <div className={`p-6 border-t flex gap-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={toggleDarkMode} className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><IconMoon /></button>
          <button onClick={handleLogout} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cerrar Sesión</button>
        </div>
      </aside>

      {/* Contenedor Vistas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Cabecera Principal con Botón de Tema (Global) */}
        <div className={`hidden md:flex justify-end p-4 border-b z-10 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
          <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-200 text-gray-600 shadow-sm border border-gray-200'}`} title="Cambiar Tema">
            {isDarkMode ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          
          {/* ========================================== */}
          {/* VISTA 1: PEDIDOS EN CURSO */}
          {/* ========================================== */}
          {vistaActiva === 'activos' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Monitor Operativo</h2>
                <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Se actualiza automáticamente en tiempo real.</p>
              </div>

              <div className="space-y-6">
                {pedidosFiltrados.filter(r => r.estado !== 'Recibido').length === 0 ? (
                  <div className={`rounded-3xl border border-dashed p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4 text-gray-400"><IconBox /></div>
                    <h3 className="text-lg font-bold">No hay requisiciones activas</h3>
                    <p className="text-gray-500 mt-1">Todos los pedidos han sido confirmados o no hay nuevas solicitudes.</p>
                  </div>
                ) : (
                  pedidosFiltrados.filter(r => r.estado !== 'Recibido').map(req => {
                    // Lógica para detectar si hay un mensaje nuevo no leído por mí en esta requisición
                    const arrMsgs = req.mensajes_pedido || [];
                    const ultMsg = arrMsgs.length > 0 ? arrMsgs[arrMsgs.length - 1] : null;
                    const tieneAlertaMensaje = ultMsg && ultMsg.emisor !== usuarioActual;

                    return (
                      <div key={req.id} className={`rounded-2xl border shadow-lg overflow-hidden flex flex-col md:flex-row transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className={`p-6 flex-1 md:border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>REQ-{req.id}</span>
                                {req.urgencia !== 'Normal' && <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide animate-pulse">{req.urgencia}</span>}
                                {rolUsuario === 'central' && req.estado === 'Solicitado' && <span className="bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-black tracking-wide animate-bounce shadow-sm">¡NUEVO!</span>}
                              </div>
                              <h3 className="text-xl font-bold">{req.obra}</h3>
                              <p className="text-sm text-gray-500">Solicitado por {req.solicitante} el {req.fecha}</p>
                            </div>
                          </div>
                          
                          <div className={`rounded-xl p-5 border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Lista de Insumos</p>
                            <ul className="space-y-3">
                              {req.detalles_requisicion?.map((item: any) => (
                                <li key={item.id} className="flex justify-between items-center">
                                  <span className="font-bold text-base">{item.material}</span>
                                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                                    <span className={`font-black text-lg ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{formatearNumero(item.cantidad)}</span>
                                    <span className={`font-light text-xl ${isDarkMode ? 'text-blue-600' : 'text-blue-300'}`}>/</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{item.unidad}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className={`p-6 md:w-80 flex flex-col justify-between ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estatus Actual</p>
                            
                            {rolUsuario === 'central' ? (
                              <select 
                                value={req.estado} 
                                onChange={(e) => actualizarEstadoPedido(req.id, e.target.value)}
                                className={`w-full rounded-xl p-3 font-bold text-sm text-center mb-6 border outline-none cursor-pointer appearance-none ${
                                  req.estado === 'Solicitado' ? (isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300') :
                                  req.estado === 'En Facturación' ? (isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200') :
                                  req.estado === 'En Camino' ? (isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200') :
                                  (isDarkMode ? 'bg-green-900/40 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-200')
                                }`}
                              >
                                <option value="Solicitado">1. Solicitado (Pendiente)</option>
                                <option value="En Facturación">2. En Compras / Facturación</option>
                                <option value="En Camino">3. En Camino (Despachado)</option>
                                <option value="Entregado">4. Entregado (Falta confirmación de Obra)</option>
                              </select>
                            ) : (
                              <div className={`rounded-xl p-3 font-bold text-sm text-center mb-6 border ${
                                req.estado === 'Solicitado' ? (isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300 shadow-sm') :
                                req.estado === 'En Facturación' ? (isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200') :
                                req.estado === 'En Camino' ? (isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200') :
                                (isDarkMode ? 'bg-green-900/40 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-200')
                              }`}>
                                {req.estado}
                              </div>
                            )}

                            {rolUsuario === 'obra' && req.estado === 'Entregado' && (
                              <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                <p className="text-xs font-bold text-green-800 dark:text-green-400 mb-3 text-center">La Central indica que el pedido llegó.</p>
                                <button onClick={() => confirmarRecepcionYDescontarStock(req)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition-all text-sm">
                                  Confirmar Recepción
                                </button>
                                <p className="text-[10px] text-center mt-2 text-gray-500 leading-tight">Al confirmar, el pedido se cerrará y se descontará del inventario.</p>
                              </div>
                            )}
                          </div>
                          
                          <button onClick={() => abrirChat(req)} className={`relative w-full flex items-center justify-center gap-2 mt-6 py-3 border rounded-xl font-bold shadow-sm transition-all text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                            <IconChat /> Comentarios y Chat
                            {/* NOTIFICACIÓN DE MENSAJE NUEVO NO LEÍDO */}
                            {tieneAlertaMensaje && (
                              <span className="absolute top-0 right-0 -mt-1.5 -mr-1.5 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className={`relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'}`}></span>
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA 2: HISTORIAL (CERRADOS / AUDITORÍA CENTRAL) */}
          {/* ========================================== */}
          {vistaActiva === 'historial' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{rolUsuario === 'central' ? 'Auditoría de Entregas' : 'Archivo Histórico'}</h2>
                  <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pedidos confirmados por Obra y descontados del stock.</p>
                </div>
                {rolUsuario === 'central' && (
                  <input type="text" placeholder="Buscar por obra o material..." value={busquedaHistorial} onChange={(e) => setBusquedaHistorial(e.target.value)} className={`w-full md:w-72 font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] shadow-sm transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                )}
              </div>

              {rolUsuario === 'central' ? (
                <div className={`rounded-2xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className={`text-sm border-b ${isDarkMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <tr><th className="p-5 font-bold">REQ</th><th className="p-5 font-bold">Obra Destino</th><th className="p-5 font-bold">Materiales Despachados</th><th className="p-5 font-bold">Fecha</th><th className="p-5 font-bold text-right">Bitácora</th></tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {pedidosFiltrados.filter(r => r.estado === 'Recibido' && (r.obra.toLowerCase().includes(busquedaHistorial.toLowerCase()) || r.detalles_requisicion?.some((i:any) => i.material.toLowerCase().includes(busquedaHistorial.toLowerCase())))).map(req => (
                          <tr key={req.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                            <td className="p-5 font-bold text-gray-500">REQ-{req.id}</td>
                            <td className="p-5 font-bold">{req.obra}</td>
                            <td className="p-5">
                              <div className="flex flex-col gap-1">
                                {req.detalles_requisicion?.map((item:any) => (
                                  <span key={item.id} className={`text-xs px-2 py-1 rounded font-bold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{formatearNumero(item.cantidad)} {item.unidad} - {item.material}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-5 text-sm text-gray-500 font-medium">{req.fecha}</td>
                            <td className="p-5 text-right">
                              <button onClick={() => abrirChat(req)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-lg inline-flex"><IconHistory /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pedidosFiltrados.filter(r => r.estado === 'Recibido').length === 0 && <div className="p-8 text-center text-gray-500 font-bold">No hay registros históricos.</div>}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pedidosFiltrados.filter(r => r.estado === 'Recibido').map(req => (
                    <div key={req.id} className={`rounded-2xl border p-6 relative overflow-hidden group hover:shadow-lg transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#011C39]"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-gray-500">REQ-{req.id}</span>
                          <h4 className="font-bold text-lg leading-tight mt-1">{req.obra}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>RECIBIDO</span>
                      </div>
                      <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-xs text-gray-500 truncate">{req.detalles_requisicion?.map((i:any)=>`${formatearNumero(i.cantidad)} ${i.material}`).join(', ')}</p>
                      </div>
                      <button onClick={() => abrirChat(req)} className="mt-4 text-sm font-bold text-[#011C39] dark:text-blue-400 hover:underline flex items-center gap-1"><IconHistory/> Ver bitácora completa</button>
                    </div>
                  ))}
                  {pedidosFiltrados.filter(r => r.estado === 'Recibido').length === 0 && (
                     <p className="text-gray-500 col-span-full font-bold">El historial está vacío.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA 3: NUEVA REQUISICIÓN (OBRA) */}
          {/* ========================================== */}
          {vistaActiva === 'nuevo' && rolUsuario === 'obra' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Solicitud de Materiales</h2>
                <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Construya su requisición a partir del catálogo central.</p>
              </div>
              
              <div className={`rounded-3xl shadow-lg border p-6 md:p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold mb-4 text-lg">1. Seleccionar Insumos</h3>
                <div className="flex flex-col md:flex-row gap-3 mb-8">
                  <select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)} className={`flex-1 font-bold p-4 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                    <option value="">Buscar en catálogo...</option>
                    {catalogoOrdenado.map(c => <option key={c.id} value={c.material}>{c.material} (Disp: {formatearNumero(c.stock)} {c.unidad})</option>)}
                  </select>
                  <div className="flex gap-3">
                    <input type="number" placeholder="Cant." value={cantidadItem} onChange={(e) => setCantidadItem(e.target.value)} className={`w-32 font-bold p-4 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} min="0.1" step="0.1" />
                    <button onClick={agregarItem} className="bg-[#011C39] text-white px-8 font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-md text-lg">+</button>
                  </div>
                </div>

                <h3 className="font-bold mb-4 text-lg">2. Resumen del Pedido</h3>
                <div className={`rounded-xl border min-h-[150px] p-2 mb-8 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  {itemsPedido.length === 0 ? <div className="flex flex-col items-center justify-center h-32 text-gray-400"><IconBox /><p className="text-sm mt-2 font-bold">Lista vacía</p></div> : (
                    <ul className="space-y-2">
                      {itemsPedido.map((item, i) => (
                        <li key={i} className={`flex justify-between items-center p-4 rounded-lg border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <span className="font-bold">{item.material}</span>
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                              <span className={`font-black text-lg ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{formatearNumero(item.cantidad)}</span>
                              <span className={`font-light text-xl ${isDarkMode ? 'text-blue-600' : 'text-blue-300'}`}>/</span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{item.unidad}</span>
                            </div>
                            <button onClick={()=> setItemsPedido(itemsPedido.filter((_, index) => index !== i))} className="text-red-400 hover:text-red-600 p-2"><IconTrash /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label className="block text-sm font-bold mb-2">Nivel de Prioridad</label>
                    <select value={nuevoPedido.urgencia} onChange={(e) => setNuevoPedido({...nuevoPedido, urgencia: e.target.value})} className={`w-full font-bold p-4 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                      <option value="Normal">Normal (Programada)</option>
                      <option value="Prioridad">Alta Prioridad</option>
                      <option value="Emergencia">Emergencia Operativa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Notas / Justificación</label>
                    <input type="text" value={nuevoPedido.notas} onChange={(e) => setNuevoPedido({...nuevoPedido, notas: e.target.value})} className={`w-full font-bold p-4 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} placeholder="Ej: Material para vaciado del viernes..." />
                  </div>
                </div>

                <button onClick={procesarNuevoPedido} disabled={cargando || itemsPedido.length === 0} className="w-full bg-[#011C39] text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {cargando ? 'Enviando al Servidor...' : 'Emitir Orden Oficial'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA 4: CATÁLOGO Y STOCK (CENTRAL) */}
          {/* ========================================== */}
          {vistaActiva === 'catalogo' && rolUsuario === 'central' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Inventario Maestro</h2>
                  <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gestión del catálogo y control de stock central.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <input type="text" placeholder="Buscar material..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={`flex-1 md:w-64 border font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#011C39] shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  <button onClick={() => abrirModalCatalogo()} className="bg-[#011C39] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 whitespace-nowrap">
                    + Añadir Insumo
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className={`text-sm ${isDarkMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border-b`}>
                      <tr>
                        <th className="p-5 font-bold">SKU</th><th className="p-5 font-bold">Nombre del Material</th><th className="p-5 font-bold">Categoría</th><th className="p-5 font-bold">Unidad</th><th className="p-5 font-bold text-center">Stock Central</th><th className="p-5 font-bold text-right">Opciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {catalogoOrdenado.filter(c => c.material.toLowerCase().includes(busqueda.toLowerCase())).map(item => (
                        <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                          <td className="p-5 text-gray-500 font-mono text-xs font-bold">{item.codigo_sku || 'N/A'}</td>
                          <td className="p-5 font-bold">{item.material}</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{item.categoria}</span>
                          </td>
                          <td className="p-5 text-gray-500 font-bold">{item.unidad}</td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1 rounded-lg font-black text-sm border ${item.stock > 10 ? (isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-200') : (isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-200')}`}>
                              {formatearNumero(item.stock)}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => abrirModalCatalogo(item)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-lg"><IconEdit /></button>
                              <button onClick={() => eliminarCatalogo(item.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-lg"><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA 5: USUARIOS (CENTRAL) */}
          {/* ========================================== */}
          {vistaActiva === 'usuarios' && rolUsuario === 'central' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Cuentas y Accesos</h2>
                  <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Control de usuarios del sistema.</p>
                </div>
                <button onClick={() => abrirModalUsuario()} className="bg-[#011C39] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900">
                  + Registrar Acceso
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuarios.map(user => (
                  <div key={user.id} className={`rounded-2xl p-6 border shadow-md relative group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-[#011C39] dark:text-blue-300 rounded-xl flex items-center justify-center font-black text-xl">{user.nombre.charAt(0)}</div>
                      <div className="flex gap-2">
                        <button onClick={() => abrirModalUsuario(user)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><IconEdit /></button>
                        <button onClick={() => eliminarUsuario(user.id)} disabled={user.email === 'javiandroa.r@gmail.com'} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-20"><IconTrash /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{user.nombre}</h3>
                    <p className={`text-sm mb-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                    <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.rol === 'central' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>{user.rol}</span>
                      <span className="text-sm font-bold truncate">{user.obra_asignada}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================== */}
      {/* MODALES FLOTANTES */}
      {/* ========================================== */}
      
      {/* MODAL: CHAT / COMENTARIOS */}
      {modalChat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b flex justify-between items-center z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div>
                <h3 className="font-bold text-xl">Requisición REQ-{modalChat.id}</h3>
                <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{modalChat.obra}</p>
              </div>
              <button onClick={() => setModalChat(null)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><IconClose /></button>
            </div>
            
            <div className={`flex-1 p-6 overflow-y-auto flex flex-col space-y-5 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              {mensajesChat.length === 0 ? (
                <div className="m-auto text-center">
                  <div className={`inline-flex p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'}`}><IconChat /></div>
                  <p className="font-bold text-gray-500">Aún no hay comentarios.</p>
                </div>
              ) : (
                mensajesChat.map((msg, idx) => {
                  const esMio = msg.emisor === usuarioActual;
                  return (
                    <div key={idx} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-gray-500 mb-1 ml-1">{msg.emisor}</span>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium shadow-md ${esMio ? 'bg-[#011C39] text-white rounded-tr-none' : isDarkMode ? 'bg-gray-700 text-white rounded-tl-none border border-gray-600' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}`}>
                        {msg.mensaje}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={enviarMensaje} className={`p-5 border-t flex gap-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <input type="text" value={nuevoMensaje} onChange={(e) => setNuevoMensaje(e.target.value)} placeholder="Escribe un mensaje..." className={`flex-1 border rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} required />
              <button type="submit" className="bg-[#011C39] text-white h-12 w-12 rounded-xl flex items-center justify-center hover:bg-blue-900 transition-colors shadow-md"><IconSend /></button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRUD USUARIOS */}
      {modalUsuario && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="font-bold text-xl">{usuarioEditando ? 'Editar Usuario' : 'Nuevo Registro'}</h3>
              <button onClick={() => setModalUsuario(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><IconClose /></button>
            </div>
            <form onSubmit={guardarUsuario} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">Nombre Completo</label>
                <input type="text" value={formUsuario.nombre} onChange={(e) => setFormUsuario({...formUsuario, nombre: e.target.value})} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Rol</label>
                  <select value={formUsuario.rol} onChange={(e) => setFormUsuario({...formUsuario, rol: e.target.value})} className={`w-full font-bold px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                    <option value="obra">Obra</option><option value="central">Central</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Asignación</label>
                  <input type="text" value={formUsuario.obra_asignada} onChange={(e) => setFormUsuario({...formUsuario, obra_asignada: e.target.value})} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} placeholder="Ej: Torre A" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Correo de Acceso</label>
                <input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({...formUsuario, email: e.target.value})} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} required disabled={!!usuarioEditando} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Contraseña</label>
                <input type="text" value={formUsuario.password} onChange={(e) => setFormUsuario({...formUsuario, password: e.target.value})} className={`w-full font-medium px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} required />
              </div>
              <button type="submit" disabled={cargando} className="w-full bg-[#011C39] text-white rounded-xl py-4 font-bold shadow-lg hover:bg-blue-900 transition-all mt-6">
                {cargando ? 'Guardando...' : 'Guardar Accesos'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRUD CATÁLOGO Y STOCK */}
      {modalCatalogo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="font-bold text-xl">{catalogoEditando ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
              <button onClick={() => setModalCatalogo(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><IconClose /></button>
            </div>
            <form onSubmit={guardarCatalogo} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">Nombre del Material</label>
                <input type="text" value={formCatalogo.material} onChange={(e) => setFormCatalogo({...formCatalogo, material: e.target.value})} className={`w-full font-bold px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Categoría</label>
                  <select value={formCatalogo.categoria} onChange={(e) => setFormCatalogo({...formCatalogo, categoria: e.target.value})} className={`w-full font-bold px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                    <option value="Obra Gris">Obra Gris</option>
                    <option value="Agregados">Agregados</option>
                    <option value="Plomería">Plomería</option>
                    <option value="Electricidad">Electricidad</option>
                    <option value="Acabados">Acabados</option>
                    <option value="Herramientas">Herramientas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Unidad</label>
                  <select value={formCatalogo.unidad} onChange={(e) => setFormCatalogo({...formCatalogo, unidad: e.target.value})} className={`w-full font-bold px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                    <option value="Sacos">Sacos</option>
                    <option value="m³">m³</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Metros">Metros</option>
                    <option value="Galones">Galones</option>
                    <option value="Cajas">Cajas</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">SKU (Opcional)</label>
                  <input type="text" value={formCatalogo.codigo_sku} onChange={(e) => setFormCatalogo({...formCatalogo, codigo_sku: e.target.value})} className={`w-full font-bold px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#011C39] transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-green-600 dark:text-green-400">Stock Inicial</label>
                  {/* Nota: En un input type="number" no se formatea con puntos porque rompe el HTML, se muestra el formato solo en lectura */}
                  <input type="number" value={formCatalogo.stock} onChange={(e) => setFormCatalogo({...formCatalogo, stock: Number(e.target.value)})} className={`w-full font-black px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-green-600 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} min="0" step="0.1" />
                </div>
              </div>
              <button type="submit" disabled={cargando} className="w-full bg-[#011C39] text-white rounded-xl py-4 font-bold shadow-lg hover:bg-blue-900 transition-all mt-6">
                {cargando ? 'Guardando...' : 'Guardar Insumo en Inventario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}