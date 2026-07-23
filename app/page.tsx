"use client";
import { useState, useEffect } from 'react';

export default function DashboardJMT() {
  // ==========================================
  // ESTADOS DE AUTENTICACIÓN Y UI MÓVIL
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false); // NUEVO: Control de menú móvil

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('jmt_auth');
    const usuarioGuardado = localStorage.getItem('jmt_usuario');
    if (sesionGuardada === 'true' && usuarioGuardado) {
      setIsLoggedIn(true);
      setUsuarioActual(usuarioGuardado);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'javiandroa.r@gmail.com' && password === 'prueba123') {
      setIsLoggedIn(true);
      setUsuarioActual('Javier Ávila');
      localStorage.setItem('jmt_auth', 'true');
      localStorage.setItem('jmt_usuario', 'Javier Ávila');
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jmt_auth');
    localStorage.removeItem('jmt_usuario');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // ==========================================
  // ESTADOS DE DATOS
  // ==========================================
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [obraSeleccionada, setObraSeleccionada] = useState<string | null>(null);
  
  const [catalogo, setCatalogo] = useState<any[]>([
    { id: 1, material: 'Botas de Seguridad Negras', categoria: 'Equipos', unidad: 'Pares', cantidad: 10, referencia: 'TRC-401', marca: 'Casterland', lugar: 'Almacén Central', observaciones: '', fecha: '2026-07-23', usuario: 'Javier Ávila' },
    { id: 2, material: 'Arena Lavada', categoria: 'Agregados', unidad: 'm³', cantidad: 4, referencia: 'ARE-01', marca: 'Local', lugar: 'Obra Torre A', observaciones: 'Bajo stock', fecha: '2026-07-22', usuario: 'Javier Ávila' },
    { id: 3, material: 'Cemento Portland Tipo I', categoria: 'Consumibles', unidad: 'Sacos', cantidad: 120, referencia: 'CEM-001', marca: 'Vencemos', lugar: 'Almacén Central', observaciones: '', fecha: '2026-07-21', usuario: 'Javier Ávila' },
    { id: 4, material: 'Tubo PVC 4" Aguas Negras', categoria: 'Consumibles', unidad: 'Unidades', cantidad: 5, referencia: 'PVC-4', marca: 'Pavco', lugar: 'Almacén Central', observaciones: '', fecha: '2026-07-20', usuario: 'Javier Ávila' },
  ]);

  const [obras, setObras] = useState<any[]>([
    { id: 1, nombre: 'Almacén Central', tipo: 'Principal', responsable: 'Javier Ávila', estado: 'Activo', protegida: true },
    { id: 2, nombre: 'Obra Torre A', tipo: 'Proyecto en Ejecución', responsable: 'Carlos Mendoza', estado: 'Activo', protegida: false },
    { id: 3, nombre: 'Residencias El Bosque', tipo: 'Proyecto en Ejecución', responsable: 'Ana Silva', estado: 'Concluido', protegida: false },
  ]);

  const [movimientos, setMovimientos] = useState<any[]>([
    { fecha: '23/07/2026 08:30', producto: 'Arena Lavada', cantidad: 15, ruta: 'Central → Torre A', usuario: 'J. Ávila', tipo: 'Transferencia' },
    { fecha: '22/07/2026 14:15', producto: 'Cemento Portland', cantidad: 50, ruta: 'Ingreso Proveedor', usuario: 'J. Ávila', tipo: 'Ingreso' }
  ]);

  // Modales
  const [modalMaterial, setModalMaterial] = useState(false);
  const [modalObra, setModalObra] = useState(false);
  const [modalTransferencia, setModalTransferencia] = useState(false);
  const [modalArchivar, setModalArchivar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [menuObraActivo, setMenuObraActivo] = useState<number | null>(null);

  // Formularios
  const [nuevoMaterial, setNuevoMaterial] = useState({ material: '', categoria: 'Consumibles', unidad: 'Sacos', cantidad: '', referencia: '', marca: '', lugar: 'Almacén Central', observaciones: '' });
  const [nuevaObra, setNuevaObra] = useState({ nombre: '', tipo: 'Proyecto en Ejecución', responsable: '' });
  const [transferencia, setTransferencia] = useState({ origen: 'Almacén Central', destino: '', item_id: '', cantidad: '' });
  const [materialAEditar, setMaterialAEditar] = useState<any>(null);
  
  // Archivo
  const [obraAArchivar, setObraAArchivar] = useState<any>(null);
  const [credencialesArchivo, setCredencialesArchivo] = useState({ email: '', password: '' });

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================
  const guardarMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const cantNum = parseFloat(nuevoMaterial.cantidad);
    let nuevoCatalogo = [...catalogo];
    const indexExistente = nuevoCatalogo.findIndex(c => c.material.trim().toLowerCase() === nuevoMaterial.material.trim().toLowerCase() && c.lugar === nuevoMaterial.lugar && c.unidad === nuevoMaterial.unidad);

    if (indexExistente >= 0) {
      nuevoCatalogo[indexExistente].cantidad += cantNum;
      nuevoCatalogo[indexExistente].fecha = new Date().toISOString().split('T')[0];
      nuevoCatalogo[indexExistente].usuario = usuarioActual;
      if(nuevoMaterial.referencia) nuevoCatalogo[indexExistente].referencia = nuevoMaterial.referencia;
    } else {
      nuevoCatalogo.push({ ...nuevoMaterial, id: Date.now(), cantidad: cantNum, fecha: new Date().toISOString().split('T')[0], usuario: usuarioActual });
    }

    setCatalogo(nuevoCatalogo);
    setMovimientos([{ fecha: new Date().toLocaleString('es-ES', {dateStyle: 'short', timeStyle: 'short'}), producto: nuevoMaterial.material, cantidad: cantNum, ruta: `Ingreso a ${nuevoMaterial.lugar.split(' ')[0]}`, usuario: 'J. Ávila', tipo: 'Ingreso' }, ...movimientos]);
    setModalMaterial(false);
    setNuevoMaterial({ material: '', categoria: 'Consumibles', unidad: 'Sacos', cantidad: '', referencia: '', marca: '', lugar: 'Almacén Central', observaciones: '' });
  };

  const guardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogo(catalogo.map(c => c.id === materialAEditar.id ? { ...materialAEditar, cantidad: parseFloat(materialAEditar.cantidad), fecha: new Date().toISOString().split('T')[0], usuario: usuarioActual } : c));
    setModalEditar(false);
  };

  const eliminarMaterial = (id: number) => {
    if(confirm("¿Estás seguro de eliminar este registro del sistema? Esta acción es irreversible.")) {
      setCatalogo(catalogo.filter(c => c.id !== id));
    }
  };

  const guardarObra = (e: React.FormEvent) => {
    e.preventDefault();
    setObras([...obras, { ...nuevaObra, id: Date.now(), estado: 'Activo', protegida: false }]);
    setModalObra(false);
    setNuevaObra({ nombre: '', tipo: 'Proyecto en Ejecución', responsable: '' });
  };

  const procesarTransferencia = (e: React.FormEvent) => {
    e.preventDefault();
    const origenItem = catalogo.find(c => c.id.toString() === transferencia.item_id);
    const cantTransferir = parseFloat(transferencia.cantidad);

    if (!origenItem || origenItem.cantidad < cantTransferir) return alert("Cantidad insuficiente en origen.");

    let nuevoCatalogo = [...catalogo];
    nuevoCatalogo.find(c => c.id === origenItem.id).cantidad -= cantTransferir;

    const indexDestino = nuevoCatalogo.findIndex(c => c.material === origenItem.material && c.lugar === transferencia.destino && c.unidad === origenItem.unidad);
    if (indexDestino >= 0) {
      nuevoCatalogo[indexDestino].cantidad += cantTransferir;
      nuevoCatalogo[indexDestino].fecha = new Date().toISOString().split('T')[0];
    } else {
      nuevoCatalogo.push({ ...origenItem, id: Date.now(), cantidad: cantTransferir, lugar: transferencia.destino, fecha: new Date().toISOString().split('T')[0] });
    }

    setCatalogo(nuevoCatalogo);
    setMovimientos([{ fecha: new Date().toLocaleString('es-ES', {dateStyle: 'short', timeStyle: 'short'}), producto: origenItem.material, cantidad: cantTransferir, ruta: `${transferencia.origen.split(' ')[0]} → ${transferencia.destino.split(' ')[0]}`, usuario: 'J. Ávila', tipo: 'Transferencia' }, ...movimientos]);
    setModalTransferencia(false);
    setTransferencia({ origen: 'Almacén Central', destino: '', item_id: '', cantidad: '' });
  };

  const solicitarArchivo = (obra: any) => {
    setObraAArchivar(obra);
    setModalArchivar(true);
    setMenuObraActivo(null);
  };

  const confirmarArchivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (credencialesArchivo.email === 'javiandroa.r@gmail.com' && credencialesArchivo.password === 'prueba123') {
      setObras(obras.map(o => o.id === obraAArchivar.id ? { ...o, estado: 'Concluido' } : o));
      setModalArchivar(false);
      setCredencialesArchivo({ email: '', password: '' });
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const exportarAExcel = () => {
    const inventarioExportar = obraSeleccionada ? catalogo.filter(c => c.lugar === obraSeleccionada) : catalogo;
    const encabezados = ['SKU/Referencia', 'Categoría', 'Material', 'Unidad de Medida', 'Cantidad/Stock', 'Ubicación', 'Última Modificación', 'Usuario', 'Observaciones'];
    const filas = inventarioExportar.map(item => [
      `"${item.referencia || 'N/A'}"`, `"${item.categoria}"`, `"${item.material}"`, `"${item.unidad}"`,
      item.cantidad, `"${item.lugar}"`, `"${item.fecha}"`, `"${item.usuario}"`, `"${item.observaciones || ''}"`
    ]);
    const contenidoCSV = [encabezados.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.setAttribute("download", `Inventario_JMT_${obraSeleccionada ? obraSeleccionada.replace(/\s+/g, '_') : 'General'}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const nombresMateriales = Array.from(new Set(catalogo.map(c => c.material)));
  const inventarioFiltrado = obraSeleccionada ? catalogo.filter(c => c.lugar === obraSeleccionada) : catalogo;
  const itemsEnOrigen = catalogo.filter(c => c.lugar === transferencia.origen && c.cantidad > 0);
  const itemsCriticos = catalogo.filter(c => c.cantidad < 10 && c.cantidad > 0);

  // Navegación con auto-cierre en móvil
  const navegarA = (vista: string) => {
    setVistaActiva(vista);
    setObraSeleccionada(null);
    setMenuAbierto(false); // Cierra el menú en móviles al hacer clic
  };

  // ==========================================
  // ICONOS
  // ==========================================
  const IconHome = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
  const IconGrid = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
  const IconBriefcase = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
  const IconArchive = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>;
  const IconAlert = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;
  const IconMore = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>;
  const IconDownload = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
  const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
  const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
  const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;

  // ==========================================
  // PANTALLA DE LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="h-14 w-14 bg-[#011C39] rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm"><span className="text-white text-xl font-bold">JMT</span></div>
            <h1 className="text-2xl font-semibold tracking-tight">Acceso Operativo</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#011C39]" required /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#011C39]" required /></div>
            {loginError && <p className="text-red-600 text-sm font-medium text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-[#011C39] text-white font-medium py-2.5 rounded-lg">Ingresar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTRUCTURA PRINCIPAL RESPONSIVA
  // ==========================================
  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900 overflow-hidden">
      
      {/* Header Móvil (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden bg-[#011C39] text-white px-4 py-3 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white rounded flex items-center justify-center"><span className="text-[#011C39] font-bold text-xs">JMT</span></div>
          <span className="font-semibold tracking-tight">Constructora</span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-1 focus:outline-none"><IconMenu /></button>
      </div>

      {/* Overlay oscuro para móvil cuando el menú está abierto */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-gray-900/50 z-30 md:hidden" onClick={() => setMenuAbierto(false)}></div>
      )}

      {/* Sidebar Responsivo */}
      <aside className={`fixed md:static inset-y-0 left-0 transform ${menuAbierto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out w-64 bg-white border-r border-gray-200 flex flex-col z-40 h-full`}>
        <div className="h-16 hidden md:flex items-center px-6 border-b border-gray-100">
          <div className="h-8 w-8 bg-[#011C39] rounded flex items-center justify-center mr-3"><span className="text-white font-bold text-xs">JMT</span></div>
          <h1 className="font-semibold text-gray-900 tracking-tight">Constructora</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Operaciones</p>
          <button onClick={() => navegarA('dashboard')} className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'dashboard' ? 'bg-blue-50 text-[#011C39]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><IconHome /> Resumen Ejecutivo</button>
          <button onClick={() => navegarA('catalogo')} className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'catalogo' && !obraSeleccionada ? 'bg-blue-50 text-[#011C39]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><IconGrid /> Inventario Maestro</button>
          <button onClick={() => navegarA('obras')} className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'obras' || obraSeleccionada ? 'bg-blue-50 text-[#011C39]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><IconBriefcase /> Gestión de Obras</button>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <button onClick={() => navegarA('archivo')} className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'archivo' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}><IconArchive /> Obras Concluidas</button>
          <div className="pt-4 mt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{usuarioActual.charAt(0)}</div><span className="text-sm font-medium text-gray-700 hidden lg:block">{usuarioActual.split(' ')[0]}</span></div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-800">Salir</button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50 w-full relative">
        
        {vistaActiva === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Visión Operativa</h2>
              <button onClick={() => setModalTransferencia(true)} className="w-full md:w-auto bg-[#011C39] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-900">+ Transferencia</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-500 mb-1">Obras Activas</p><div className="flex items-baseline gap-2"><p className="text-3xl font-semibold text-gray-900">{obras.filter(o => o.estado === 'Activo' && !o.protegida).length}</p></div></div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><IconBriefcase /></div>
              </div>
              <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <div className="pl-2"><p className="text-sm font-medium text-gray-500 mb-1">Alertas de Stock</p><div className="flex items-baseline gap-2"><p className="text-3xl font-semibold text-red-600">{itemsCriticos.length}</p><span className="text-xs text-gray-500 font-medium">Bajo stock</span></div></div>
                <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><IconAlert /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50"><h3 className="text-sm font-semibold text-gray-800">Últimos Movimientos</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="bg-white border-b border-gray-100">
                      <tr><th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th><th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Detalle</th><th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cant.</th><th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ruta</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {movimientos.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{m.fecha}</td><td className="px-6 py-3 font-medium text-gray-900">{m.producto}</td><td className="px-6 py-3 font-medium text-[#011C39]">{m.cantidad}</td><td className="px-6 py-3 text-xs text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded">{m.ruta}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50/30 flex items-center gap-2"><span className="text-red-500"><IconAlert /></span><h3 className="text-sm font-semibold text-red-900">Requieren Atención</h3></div>
                <div className="p-0 overflow-y-auto max-h-96">
                  {itemsCriticos.length === 0 ? <p className="text-sm text-gray-500 p-6 text-center">Niveles estables.</p> : <ul className="divide-y divide-gray-100">{itemsCriticos.map(item => <li key={item.id} className="p-4 hover:bg-gray-50"><p className="text-sm font-semibold text-gray-900">{item.material}</p><div className="flex justify-between items-center mt-1"><p className="text-xs text-gray-500">{item.lugar}</p><span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Quedan {item.cantidad} {item.unidad}</span></div></li>)}</ul>}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'catalogo' && (
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-6 pb-0 flex-shrink-0">
              {obraSeleccionada && (
                <button onClick={() => navegarA('obras')} className="text-xs font-medium text-gray-500 hover:text-[#011C39] mb-2 flex items-center gap-1">← Volver</button>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{obraSeleccionada ? obraSeleccionada : 'Inventario Maestro'}</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button onClick={exportarAExcel} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-green-700 flex items-center justify-center">
                    <IconDownload /> Exportar
                  </button>
                  <button onClick={() => setModalMaterial(true)} className="w-full sm:w-auto bg-[#011C39] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-900">
                    + Nuevo Registro
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 md:p-6 pt-2 overflow-hidden flex flex-col">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">Ref/Cat</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">Material</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">Unidad</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right border-b border-gray-200">Stock</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 pl-6">Ubicación</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {inventarioFiltrado.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/30' : 'bg-gray-50/30 hover:bg-blue-50/30'}>
                          <td className="px-4 py-2.5"><p className="text-gray-900 text-xs font-mono">{item.referencia || 'N/A'}</p><p className="text-gray-400 text-[10px] uppercase mt-0.5">{item.categoria}</p></td>
                          <td className="px-4 py-2.5"><p className="font-medium text-gray-900">{item.material}</p>{item.observaciones && <p className="text-xs text-gray-500 italic mt-0.5">{item.observaciones}</p>}</td>
                          <td className="px-4 py-2.5 text-gray-600">{item.unidad}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[#011C39]">{item.cantidad}</td>
                          <td className="px-4 py-2.5 pl-6"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">{item.lugar}</span></td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => {setMaterialAEditar(item); setModalEditar(true);}} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors" title="Editar"><IconEdit /></button>
                              <button onClick={() => eliminarMaterial(item.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors" title="Eliminar"><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventarioFiltrado.length === 0 && <div className="p-12 text-center text-gray-500">Inventario vacío.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'obras' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Obras y Almacenes</h2>
              <button onClick={() => setModalObra(true)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">+ Crear Obra</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {obras.filter(o => o.estado === 'Activo').map((obra) => (
                <div key={obra.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative group">
                  {!obra.protegida && (
                    <div className="absolute top-3 right-3 z-10">
                      <button onClick={(e) => { e.stopPropagation(); setMenuObraActivo(menuObraActivo === obra.id ? null : obra.id); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"><IconMore /></button>
                      {menuObraActivo === obra.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 text-sm z-50">
                          <button onClick={() => solicitarArchivo(obra)} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Concluir Obra</button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-5 flex-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-3 ${obra.protegida ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{obra.tipo}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-6">{obra.nombre}</h3>
                    <p className="text-sm text-gray-500">Responsable: {obra.responsable}</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <button onClick={() => {setObraSeleccionada(obra.nombre); setVistaActiva('catalogo');}} className="w-full bg-[#011C39] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900">Abrir Inventario</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vistaActiva === 'archivo' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Archivo de Obras</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {obras.filter(o => o.estado === 'Concluido').map((obra) => (
                <div key={obra.id} className="bg-gray-100 border border-gray-200 p-5 rounded-xl border-dashed">
                  <div className="flex items-center gap-2 mb-2"><IconArchive /> <h3 className="text-md font-semibold text-gray-700">{obra.nombre}</h3></div>
                  <p className="text-sm text-gray-500 mb-4">Responsable: {obra.responsable}</p>
                  <button onClick={() => {setObraSeleccionada(obra.nombre); setVistaActiva('catalogo');}} className="text-sm font-medium text-[#011C39] hover:underline">Auditar Inventario Final</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* MODALES RESPONSIVOS (max-w-[95%] para móvil) */}
      {/* ========================================== */}
      {modalMaterial && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between sticky top-0 bg-white z-10"><h3 className="text-lg font-semibold text-gray-900">Ingreso de Material</h3><button onClick={() => setModalMaterial(false)} className="text-gray-400">✕</button></div>
            <form onSubmit={guardarMaterial} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4"><p className="text-xs text-blue-800">Si el material ya existe en el destino, la cantidad se sumará automáticamente.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Material *</label><input type="text" list="lista-materiales" value={nuevoMaterial.material} onChange={(e) => setNuevoMaterial({...nuevoMaterial, material: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required /><datalist id="lista-materiales">{nombresMateriales.map(m => <option key={m} value={m} />)}</datalist></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label><select value={nuevoMaterial.categoria} onChange={(e) => setNuevoMaterial({...nuevoMaterial, categoria: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"><option value="Consumibles">Materiales Consumibles</option><option value="Agregados">Agregados (Arena, Piedra)</option><option value="Herramientas">Herramientas Menores</option><option value="Equipos">Equipos / EPP</option></select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label><select value={nuevoMaterial.unidad} onChange={(e) => setNuevoMaterial({...nuevoMaterial, unidad: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"><option value="Sacos">Sacos</option><option value="m³">m³</option><option value="Unidades">Unidades</option><option value="Pares">Pares</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label><input type="number" value={nuevoMaterial.cantidad} onChange={(e) => setNuevoMaterial({...nuevoMaterial, cantidad: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required min="0.01" step="0.01" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ref/SKU</label><input type="text" value={nuevoMaterial.referencia} onChange={(e) => setNuevoMaterial({...nuevoMaterial, referencia: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de Destino *</label>
                <select value={nuevoMaterial.lugar} onChange={(e) => setNuevoMaterial({...nuevoMaterial, lugar: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none">
                  {obras.filter(o => o.estado === 'Activo').map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100"><button type="button" onClick={() => setModalMaterial(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 text-sm font-medium bg-[#011C39] text-white rounded-lg">Registrar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalEditar && materialAEditar && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h3 className="text-lg font-semibold text-gray-900">Editar Registro</h3><button onClick={() => setModalEditar(false)} className="text-gray-400">✕</button></div>
            <form onSubmit={guardarEdicion} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Material</label><input type="text" value={materialAEditar.material} disabled className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock ({materialAEditar.unidad})</label><input type="number" value={materialAEditar.cantidad} onChange={(e) => setMaterialAEditar({...materialAEditar, cantidad: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required min="0" step="0.01" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label><input type="text" value={materialAEditar.referencia} onChange={(e) => setMaterialAEditar({...materialAEditar, referencia: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label><input type="text" value={materialAEditar.observaciones || ''} onChange={(e) => setMaterialAEditar({...materialAEditar, observaciones: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" /></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalEditar(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 text-sm font-medium bg-[#011C39] text-white rounded-lg">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalObra && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h3 className="text-lg font-semibold text-gray-900">Crear Obra</h3><button onClick={() => setModalObra(false)} className="text-gray-400">✕</button></div>
            <form onSubmit={guardarObra} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" value={nuevaObra.nombre} onChange={(e) => setNuevaObra({...nuevaObra, nombre: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label><input type="text" value={nuevaObra.responsable} onChange={(e) => setNuevaObra({...nuevaObra, responsable: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required /></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalObra(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 text-sm font-medium bg-[#011C39] text-white rounded-lg">Crear</button></div>
            </form>
          </div>
        </div>
      )}

      {modalTransferencia && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between sticky top-0 bg-white"><h3 className="text-lg font-semibold text-gray-900">Transferir</h3><button onClick={() => setModalTransferencia(false)} className="text-gray-400">✕</button></div>
            <form onSubmit={procesarTransferencia} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Origen</label><select value={transferencia.origen} onChange={(e) => setTransferencia({...transferencia, origen: e.target.value, item_id: ''})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]">{obras.filter(o => o.estado === 'Activo').map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Material</label><select value={transferencia.item_id} onChange={(e) => setTransferencia({...transferencia, item_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required><option value="">Seleccione...</option>{itemsEnOrigen.map(i => <option key={i.id} value={i.id}>{i.material} ({i.cantidad} disp.)</option>)}</select></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label><input type="number" value={transferencia.cantidad} onChange={(e) => setTransferencia({...transferencia, cantidad: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required min="0.01" step="0.01" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Destino</label><select value={transferencia.destino} onChange={(e) => setTransferencia({...transferencia, destino: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required><option value="">Seleccione...</option>{obras.filter(o => o.estado === 'Activo' && o.nombre !== transferencia.origen).map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}</select></div>
              </div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalTransferencia(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 text-sm font-medium bg-[#011C39] text-white rounded-lg">Transferir</button></div>
            </form>
          </div>
        </div>
      )}

      {modalArchivar && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Concluir {obraAArchivar?.nombre}</h3>
              <p className="text-sm text-gray-500 mb-5">Esta acción moverá la obra al archivo. Requiere confirmación.</p>
              <form onSubmit={confirmarArchivo} className="space-y-4">
                <input type="email" placeholder="Correo" value={credencialesArchivo.email} onChange={(e) => setCredencialesArchivo({...credencialesArchivo, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required />
                <input type="password" placeholder="Contraseña" value={credencialesArchivo.password} onChange={(e) => setCredencialesArchivo({...credencialesArchivo, password: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#011C39]" required />
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModalArchivar(false)} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Archivar</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}