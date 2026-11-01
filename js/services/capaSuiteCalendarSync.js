(function () {
    'use strict';
    if (window.CapaSuiteCalendarSync) return;
    var session, ready, stopData, stopAuth, stopConnection, refreshPending;
    var generation = 0, revision = 0, retryTimer, retryDelay = 5000, sourceError = '';
    var state = { status: 'Conectando con CapaSuite...', connected: false, authenticated: false, data: null, updatedAt: null };
    var stores = { compData: 'revenue_data_v2', hotelData: 'hotel_manager_db_v2', customEvents: 'custom_events', manualCupos: 'manual_cupos_v1' };

    function notify() {
        window.dispatchEvent(new CustomEvent('capasuite-calendar-state', { detail: state }));
    }
    function cancelRetry() {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
    }
    function retry(work) {
        if (retryTimer) return;
        retryTimer = setTimeout(function () {
            retryTimer = null;
            work();
        }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 60000);
    }
    function listen(version) {
        if (version !== generation || !state.uid) return;
        if (stopData) stopData();
        stopData = session.listen(state.uid, function (snapshot) { apply(snapshot, version); }, function () {
            if (version !== generation) return;
            sourceError = 'Error de acceso al calendario de CapaSuite';
            state.status = sourceError;
            notify();
            retry(function () { listen(version); });
        });
    }
    function apply(snapshot, version) {
        if (version !== generation) return;
        try {
            var raw = snapshot.val();
            if (!raw || raw.compData == null) throw new Error('Sin calendario');
            var values = {};
            Object.keys(stores).forEach(function (field) {
                var value = raw[field];
                values[stores[field]] = value == null ? (field === 'customEvents' ? [] : {}) : typeof value === 'string' ? JSON.parse(value) : value;
            });
            var revenue = values.revenue_data_v2;
            var production = values.hotel_manager_db_v2;
            if (!revenue || typeof revenue !== 'object' || !production || typeof production !== 'object' || Array.isArray(production) ||
                !Array.isArray(values.custom_events) || !values.manual_cupos_v1 || typeof values.manual_cupos_v1 !== 'object') throw new Error('Formato de calendario no válido');
            var days = Array.isArray(revenue) ? revenue : revenue.data !== undefined ? revenue.data : revenue;
            if (!days || typeof days !== 'object') throw new Error('Fechas no válidas');
            Object.values(days).forEach(function (day) {
                if (!day || typeof day !== 'object' || Array.isArray(day) ||
                    (day.hotels !== undefined && (!day.hotels || typeof day.hotels !== 'object'))) throw new Error('Precio diario no válido');
            });
            sourceError = '';
            cancelRetry();
            retryDelay = 5000;
            revision++;
            state.data = values;
            state.updatedAt = new Date();
            state.status = state.connected ? 'CapaSuite actualizado' : 'CapaSuite: datos guardados, sin conexión';
            // Memory is authoritative; storage is an optional offline copy.
            Object.keys(values).forEach(function (key) {
                try { localStorage.setItem('v3_' + key, JSON.stringify(values[key])); } catch (error) {}
            });
            try { localStorage.setItem('v3_capasuite_last_sync', state.updatedAt.toISOString()); } catch (error) {}
            notify();
        } catch (error) {
            sourceError = 'CapaSuite: no se pudo leer el calendario';
            state.status = sourceError;
            notify();
        }
    }
    function start() {
        if (ready) return ready;
        ready = import('./capaSuiteSession.mjs?v=1').then(function (sdk) {
            session = sdk.createSession();
            stopConnection = session.observeConnection(function (connected) {
                state.connected = connected;
                if (state.authenticated) {
                    state.status = connected ? (sourceError || (state.data ? 'CapaSuite actualizado' : 'Recibiendo calendario de CapaSuite...')) : 'CapaSuite sin conexión';
                } else if (!connected) {
                    state.status = 'CapaSuite sin conexión';
                }
                notify();
            });
            return new Promise(function (resolve, reject) {
                stopAuth = session.observeAuth(function (user) {
                    generation++;
                    if (stopData) stopData();
                    stopData = null;
                    cancelRetry();
                    sourceError = '';
                    state.authenticated = !!user;
                    state.data = null;
                    state.updatedAt = null;
                    state.uid = user ? user.uid : null;
                    state.status = user ? 'Recibiendo calendario de CapaSuite...' : 'CapaSuite: inicia sesión para sincronizar';
                    notify();
                    if (user) {
                        listen(generation);
                    } else if (typeof localStorage !== 'undefined') {
                        try {
                            var savedAuth = localStorage.getItem('nexus_capasuite_auth');
                            if (savedAuth) {
                                var creds = JSON.parse(savedAuth);
                                if (creds && creds.email && creds.pass) {
                                    state.status = 'Restaurando sesión de CapaSuite...';
                                    notify();
                                    session.signIn(creds.email, atob(creds.pass)).catch(function () {
                                        state.status = 'CapaSuite: inicia sesión para sincronizar';
                                        notify();
                                    });
                                }
                            }
                        } catch (e) {}
                    }
                    resolve();
                }, reject);
            });
        }).catch(function (error) {
            if (typeof stopAuth === 'function') stopAuth();
            if (typeof stopConnection === 'function') stopConnection();
            ready = null;
            state.status = 'No se pudo conectar con CapaSuite';
            notify();
            retry(function () { start().catch(function () {}); });
            throw error;
        });
        return ready;
    }
    window.CapaSuiteCalendarSync = {
        state: state,
        start: start,
        signIn: async function (email, password) {
            await start();
            var res = await session.signIn(email, password);
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('nexus_capasuite_auth', JSON.stringify({ email: email, pass: btoa(password) }));
                }
            } catch (e) {}
            return res;
        },
        signOut: function () {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('nexus_capasuite_auth');
                }
            } catch (e) {}
        },
        refresh: function () {
            if (refreshPending) return refreshPending;
            refreshPending = (async function () {
                await start();
                if (!state.uid) return false;
                var version = generation, initialRevision = revision;
                try {
                    var snapshot = await session.read(state.uid);
                    // A slower manual/focus read must not replace a newer live snapshot.
                    if (revision === initialRevision) apply(snapshot, version);
                    return true;
                } catch (error) {
                    if (version === generation && revision === initialRevision) {
                        sourceError = 'No se pudo actualizar CapaSuite';
                        state.status = sourceError;
                        notify();
                        retry(function () { window.CapaSuiteCalendarSync.refresh().catch(function () {}); });
                    }
                    throw error;
                }
            })().finally(function () { refreshPending = null; });
            return refreshPending;
        }
    };
    if (typeof document !== 'undefined') {
        start().catch(function () {});
    }
    window.addEventListener('load', function () { start().catch(function () {}); });
    window.addEventListener('online', function () {
        window.CapaSuiteCalendarSync.refresh().catch(function () {
            state.status = 'No se pudo actualizar CapaSuite';
            notify();
        });
    });
    window.addEventListener('focus', function () {
        window.CapaSuiteCalendarSync.refresh().catch(function () {});
    });
})();
