(() => {
  const { useState, useEffect, useRef } = React;
  const boxes = ['grupos@hotelguadiana.es', 'grupos@encumbria.es'];
  const states = ['Nueva', 'En gestión', 'Pendiente del cliente', 'Presupuestada', 'Ganada', 'Perdida'];
  const stamp = () => new Date().toISOString();
  const demoMembers = [{ uid: 'demo', name: 'Comercial de ejemplo', mailboxes: boxes }, { uid: 'demo2', name: 'Segundo comercial', mailboxes: boxes }];
  const seed = () => [
    { id: 'demo-1', mailbox: boxes[0], subject: 'Ejemplo: solicitud de 20 habitaciones', from: 'agencia@example.com', status: 'Nueva', assignee: '', version: 1, updatedAt: stamp(), needsReply: true },
    { id: 'demo-2', mailbox: boxes[1], subject: 'Ejemplo: grupo con media pensión', from: 'cliente@example.com', status: 'En gestión', assignee: 'demo', version: 1, updatedAt: stamp(), needsReply: true }
  ];
  function App() {
    const [demo, setDemo] = useState(true), [rows, setRows] = useState(seed), [members, setMembers] = useState(demoMembers);
    const [user, setUser] = useState({ uid: 'demo', name: 'Dirección de ejemplo', role: 'admin' });
    const [selected, setSelected] = useState(''), [detail, setDetail] = useState(null), [events, setEvents] = useState({});
    const [hotel, setHotel] = useState(''), [view, setView] = useState('all'), [search, setSearch] = useState('');
    const [error, setError] = useState(''), [busy, setBusy] = useState(false), [loadingDetail, setLoadingDetail] = useState(false);
    const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [note, setNote] = useState('');
    const [connections, setConnections] = useState([]), [showSetup, setShowSetup] = useState(false);
    const detailSequence = useRef(0);
    const call = async (name, data = {}) => {
      if (!window.firebase?.functions) throw new Error('No se pudo cargar la conexión. Recarga la página.');
      return (await firebase.app().functions('us-central1').httpsCallable(name)(data)).data;
    };
    const refresh = async () => {
      const result = await call('mailInbox');
      setRows(result.requests); setMembers(result.members); setUser(result.user); setConnections(result.mailboxes || []);
    };
    const run = async fn => {
      setBusy(true); setError('');
      try { await fn(); } catch (e) { setError(e.message || 'No se pudo completar la operación.'); }
      finally { setBusy(false); }
    };
    useEffect(() => {
      const sequence = ++detailSequence.current;
      setDetail(null); setNote('');
      if (!selected) { setLoadingDetail(false); return; }
      if (demo) {
        setLoadingDetail(false);
        setDetail({ messages: [{ from: 'agencia@example.com', receivedAt: stamp(), body: 'Mensaje ficticio para probar la bandeja. Necesitamos disponibilidad para un grupo. Las fechas y el número definitivo de personas están pendientes de confirmar.' }], events: events[selected] || [] });
        return;
      }
      setLoadingDetail(true);
      call('mailDetail', { id: selected }).then(d => { if (sequence === detailSequence.current) setDetail(d); })
        .catch(e => { if (sequence === detailSequence.current) setError(e.message); })
        .finally(() => { if (sequence === detailSequence.current) setLoadingDetail(false); });
    }, [selected, demo, events]);
    const item = rows.find(r => r.id === selected);
    const update = (action, value) => run(async () => {
      if (!item) return;
      if (demo) {
        setRows(old => old.map(r => r.id === item.id ? { ...r, ...(action === 'assign' ? { assignee: value } : action === 'status' ? { status: value } : {}), version: r.version + 1, updatedAt: stamp() } : r));
        setEvents(old => ({ ...old, [item.id]: [{ actor: user.name, action, value, at: stamp() }, ...(old[item.id] || [])] }));
      } else {
        await call('mailUpdate', { id: item.id, version: item.version, action, value });
        await refresh();
        setEvents(old => ({ ...old }));
      }
      setNote('');
    });
    const visible = rows.filter(r => (!hotel || r.mailbox === hotel) && (view === 'all' || (view === 'mine' ? r.assignee === user?.uid : !r.assignee)) && `${r.subject} ${r.from}`.toLowerCase().includes(search.toLowerCase()));
    const input = 'border border-slate-300 rounded-lg p-2 bg-white w-full';
    const button = 'rounded-lg bg-emerald-800 text-white px-4 py-2 disabled:opacity-50';
    const connectionLabel = connection => {
      if (demo || !connection || connection.status === 'pending') return 'Pendiente de conectar';
      if (connection.status === 'disabled') return 'Recepción automática desactivada';
      if (connection.status === 'error') return connection.errorCode === 'authentication-failed' ? 'Revisar el acceso al buzón' : connection.errorCode === 'mailbox-changed' ? 'El servidor ha cambiado: requiere revisión' : 'No se ha podido completar la sincronización';
      return connection.connected ? 'Recepción activa' : 'Sincronización sin confirmar: revisar conexión';
    };
    return <main className="max-w-7xl mx-auto p-5 pt-24">
      <div className="flex flex-wrap justify-between gap-4 mb-5"><div><h1 className="text-3xl font-bold">Peticiones de grupos</h1><p className="text-slate-500">Correos, responsables y seguimiento comercial.</p></div>
        <button disabled={busy} className={button} onClick={() => { ++detailSequence.current; setDemo(!demo); setSelected(''); setError(''); setDetail(null); setEvents({}); setRows(demo ? [] : seed()); setMembers(demo ? [] : demoMembers); setUser(demo ? null : { uid: 'demo', name: 'Dirección de ejemplo', role: 'admin' }); }}>{demo ? 'Acceso del equipo' : 'Ver demostración'}</button></div>
      <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 mb-5">{demo ? 'Demostración: datos ficticios, cambios temporales y ningún correo enviado.' : 'La bandeja muestra los mensajes incorporados desde la activación de cada buzón. Pulsa Actualizar para consultar los últimos cambios.'}</div>
      <div className="grid md:grid-cols-2 gap-3 mb-5">{(demo || !user ? boxes : connections.map(c => c.address)).map(address => { const c = !demo && connections.find(c => c.address === address); return <div key={address} className="bg-white border rounded-xl p-4"><strong className="break-all">{address}</strong><p className={`text-sm ${c?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>{connectionLabel(c)}</p>{c?.lastSuccessAt && <p className="text-xs text-slate-500">Última revisión: {new Date(c.lastSuccessAt).toLocaleString('es-ES')}</p>}{c?.issues?.length > 0 && <div className="mt-2 text-sm text-red-800"><p>{c.issues.length >= 20 ? '20 o más' : c.issues.length} mensajes requieren revisión en Outlook.</p>{c.issues.map(i => <p key={i.id}>Mensaje {i.uid}: {i.code === 'message-too-large' ? 'supera el límite de 10 MB' : 'no se pudo interpretar'}</p>)}</div>}</div>; })}</div>
      <button className="text-emerald-800 underline mb-4" onClick={() => setShowSetup(!showSetup)} aria-expanded={showSetup}>Qué falta para conectar los correos</button>
      {showSetup && <section className="border rounded-xl bg-white p-5 mb-5"><h2 className="font-bold mb-2">Datos que necesitamos de informática</h2><p>Para cada dirección: tipo de cuenta en Outlook (IMAP o Microsoft 365/Exchange), servidor de entrada y puerto. No escribas contraseñas en esta página ni en el chat.</p><p className="mt-2">La conexión IMAP está preparada para recepción segura por el puerto 993. Si las cuentas son Microsoft 365/Exchange, adaptaremos la conexión a ese servicio.</p><p className="mt-2">Al activar la recepción se tomarán los mensajes nuevos a partir de ese momento. Los anteriores y los adjuntos seguirán disponibles en Outlook.</p></section>}
      {error && <div role="alert" className="bg-red-50 text-red-800 rounded-xl p-4 mb-4">{error}</div>}
      {!demo && !user && <form className="bg-white border rounded-xl p-5 max-w-lg space-y-3 mb-5" onSubmit={e => { e.preventDefault(); run(async () => { await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION); await firebase.auth().signInWithEmailAndPassword(email, password); setPassword(''); await refresh(); }); }}>
        <h2 className="font-bold">Acceso seguro a peticiones</h2><p className="text-sm">El administrador debe dar de alta este acceso. La contraseña del correo no se utiliza aquí.</p>
        <label className="block">Correo de usuario<input required type="email" autoComplete="username" className={input} value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block">Contraseña de acceso<input required type="password" autoComplete="current-password" className={input} value={password} onChange={e => setPassword(e.target.value)} /></label><button disabled={busy} className={button}>Entrar</button>
      </form>}
      {(demo || user) && <>
        <div className="flex flex-wrap gap-3 mb-5"><select aria-label="Hotel" className="border rounded-lg p-2" value={hotel} onChange={e => setHotel(e.target.value)}><option value="">Ambos hoteles</option>{boxes.map(b => <option key={b}>{b}</option>)}</select>
          <select aria-label="Asignación" className="border rounded-lg p-2" value={view} onChange={e => setView(e.target.value)}><option value="all">Todas</option><option value="unassigned">Sin asignar</option><option value="mine">Mis peticiones</option></select>
          <input aria-label="Buscar peticiones" placeholder="Buscar asunto o remitente" className="border rounded-lg p-2 flex-1" value={search} onChange={e => setSearch(e.target.value)} />
          {!demo && <><button disabled={busy} className={button} onClick={() => run(refresh)}>Actualizar</button><button disabled={busy} onClick={() => run(async () => { await firebase.auth().signOut(); ++detailSequence.current; setUser(null); setRows([]); setSelected(''); setDetail(null); })}>Cerrar sesión</button></>}
        </div>
        <p className="text-sm text-slate-500 mb-3">{visible.length} peticiones{!demo && ' · hasta 100 recientes por buzón'}</p>
        <div className="grid lg:grid-cols-5 gap-5"><section aria-label="Lista de peticiones" className="lg:col-span-2 space-y-3">
          {!visible.length && <p className="bg-white border rounded-xl p-6">No hay peticiones para estos filtros.</p>}
          {visible.map(r => <button disabled={busy} key={r.id} className={`w-full text-left p-4 border rounded-xl ${selected === r.id ? 'bg-emerald-50 border-emerald-700' : 'bg-white'}`} onClick={() => setSelected(r.id)}><span className="text-xs text-slate-500">{r.mailbox}</span><h2 className="font-bold my-1">{r.subject}</h2><p className="text-sm break-all">{r.from}</p><p className="text-sm mt-3">{r.status} · {members.find(m => m.uid === r.assignee)?.name || (r.assignee ? 'Comercial no disponible' : 'Sin asignar')}</p>{r.needsReply && <span className="text-xs text-amber-700">Respuesta pendiente</span>}</button>)}
        </section><section aria-label="Detalle de petición" className="lg:col-span-3 bg-white border rounded-xl p-5">
          {!item ? <p className="text-slate-500">Selecciona una petición para ver su conversación y asignarla.</p> : <><h2 className="text-xl font-bold mb-4">{item.subject}</h2>
            <div className="grid sm:grid-cols-2 gap-3"><label>Responsable<select disabled={busy || user?.role !== 'admin'} className={input} value={item.assignee} onChange={e => update('assign', e.target.value)}><option value="">Sin asignar</option>{members.filter(m => m.mailboxes.includes(item.mailbox)).map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}</select></label>
              <label>Estado<select disabled={busy || (user?.role !== 'admin' && item.assignee !== user?.uid)} className={input} value={item.status} onChange={e => update('status', e.target.value)}>{states.map(s => <option key={s}>{s}</option>)}</select></label></div>
            {!item.assignee && <button disabled={busy} className={`${button} mt-3`} onClick={() => update('assign', user.uid)}>Asignarme</button>}
            <h3 className="font-bold mt-6 mb-2">Conversación</h3>{loadingDetail && <p>Cargando conversación…</p>}
            {detail?.messages.map((m, i) => <article key={i} className="bg-slate-50 rounded-lg p-4 mb-3"><p className="text-sm text-slate-500 break-all">{m.from} · {new Date(m.receivedAt).toLocaleString('es-ES')}</p><p className="whitespace-pre-wrap break-words mt-3">{m.body}</p>{m.truncated && <p className="text-amber-800 text-sm mt-2">Texto abreviado. Consulta el correo completo en Outlook.</p>}{m.attachmentCount > 0 && <div className="border-t mt-3 pt-3 text-sm"><p className="font-bold">{m.attachmentCount} adjuntos · disponibles en Outlook</p>{m.attachments?.map((a, j) => <p key={j} className="break-all">{a.filename} ({Math.ceil(a.size / 1024)} KB)</p>)}</div>}</article>)}
            <p className="text-sm text-slate-500 my-4">El envío de respuestas, los adjuntos y la conversión a presupuesto se incorporarán en la siguiente fase.</p>
            <form onSubmit={e => { e.preventDefault(); update('note', note.trim()); }}><label className="font-bold">Nota interna<textarea maxLength={4000} className={`${input} mt-2 font-normal`} value={note} onChange={e => setNote(e.target.value)} /></label><button disabled={busy || !note.trim() || (user?.role !== 'admin' && item.assignee !== user?.uid)} className={button}>Guardar nota</button></form>
            <h3 className="font-bold mt-6">Actividad</h3>{detail?.events.map((e, i) => <p className="text-sm border-b py-3 whitespace-pre-wrap break-words" key={i}>{e.actor} · {new Date(e.at).toLocaleString('es-ES')}<br />{e.action === 'note' ? e.value : e.action === 'status' ? `Estado: ${e.value}` : `Asignación: ${members.find(m => m.uid === e.value)?.name || e.value || 'Sin asignar'}`}</p>)}
          </>}
        </section></div>
      </>}
    </main>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
