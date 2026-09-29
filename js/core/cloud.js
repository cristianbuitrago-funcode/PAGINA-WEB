/**
 * NUBE (Firebase): cuentas de estudiantes y progreso sincronizado.
 *
 * - Autenticación: correo + contraseña, y Google (opcional).
 * - Firestore: un documento por estudiante en "usuarios/{uid}" con un
 *   resumen (nombre, curso, XP, nivel, progreso) y el estado completo en "data".
 * - Si no hay configuración (firebase-config.js), todo queda desactivado y la
 *   plataforma sigue funcionando solo con localStorage.
 *
 * El SDK de Firebase se carga desde gstatic.com únicamente si está configurado.
 */
(function (O9) {
  'use strict';

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const cfg = O9.firebaseConfig;
  const opts = O9.cloudOptions || {};

  let auth = null, db = null;
  let lastSync = null;
  let pushing = false;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  /** Mensajes de error de Firebase en lenguaje sencillo. */
  const ERRORS = {
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.',
    'auth/invalid-email': 'El correo no es válido. Revisa que esté bien escrito.',
    'auth/weak-password': 'La contraseña es muy corta: usa al menos 6 caracteres.',
    'auth/missing-password': 'Escribe tu contraseña.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña no es correcta.',
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/invalid-login-credentials': 'El correo o la contraseña no son correctos.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
    'auth/network-request-failed': 'No hay conexión a internet.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes.',
    'auth/unauthorized-domain': 'Este sitio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
    'auth/operation-not-allowed': 'Este método de inicio de sesión no está activado en Firebase.',
    'permission-denied': 'Firebase rechazó el guardado. Revisa las reglas de Firestore.'
  };
  const errorText = (e) => ERRORS[e && e.code] || (e && e.message) || 'Ocurrió un error. Intenta de nuevo.';

  /** Resumen del estudiante para consultas (por ejemplo, un futuro panel del profe). */
  function summary(state) {
    const info = O9.game.levelInfo(state.xp);
    const ov = O9.progress.overall();
    return {
      name: state.profile.name || '',
      course: state.profile.course || '',
      email: (cloud.user && cloud.user.email) || '',
      xp: state.xp,
      points: state.points,
      level: info.level.n,
      progress: ov.pct,
      topicsDone: ov.topicsDone,
      challengesDone: ov.challengesDone,
      badges: Object.keys(state.badges).length,
      courseComplete: !!state.courseComplete,
      projectWord: !!(state.projects.word || {}).done,
      projectExcel: !!(state.projects.excel || {}).done,
      diagnostic: state.diagnostic ? state.diagnostic.band : ''
    };
  }

  /** Sube el progreso local a Firestore. */
  async function push() {
    if (!cloud.user || !db || pushing) return;
    pushing = true;
    try {
      const state = O9.store.get();
      await db.collection('usuarios').doc(cloud.user.uid).set(Object.assign(summary(state), {
        data: JSON.stringify(state),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }), { merge: true });
      lastSync = Date.now();
      cloud.error = null;
    } catch (e) {
      cloud.error = errorText(e);
      console.warn('No se pudo guardar en la nube:', e);
    } finally {
      pushing = false;
      O9.util.emit('cloud:changed');
    }
  }
  const pushSoon = O9.util.debounce(push, 2500);

  /**
   * Al iniciar sesión: decide qué progreso conservar.
   * - Si el progreso local es de otra cuenta → se usa el de la nube.
   * - Si no, se queda el que tenga más XP (así no se pierde lo hecho antes de registrarse).
   */
  async function pull(user) {
    const local = O9.store.get();
    let remote = null;
    try {
      const snap = await db.collection('usuarios').doc(user.uid).get();
      if (snap.exists && snap.data().data) remote = JSON.parse(snap.data().data);
    } catch (e) {
      cloud.error = errorText(e);
      console.warn('No se pudo leer la nube:', e);
    }
    const otherOwner = local.ownerUid && local.ownerUid !== user.uid;
    if (remote && (otherOwner || O9.store.isEmpty() || (remote.xp || 0) >= (local.xp || 0))) {
      O9.store.replace(remote);
    } else if (otherOwner) {
      O9.store.reset();
    }
    O9.store.update((s) => {
      s.ownerUid = user.uid;
      if (!s.profile.name && user.displayName) s.profile.name = user.displayName;
    });
    await push();
    O9.util.emit('state:replaced');
  }

  const cloud = {
    enabled: !!(cfg && cfg.apiKey),
    requireLogin: !!opts.requireLogin,
    google: opts.google !== false,
    user: null,
    ready: false,
    error: null,
    lastSync: () => lastSync,
    errorText,

    /** Carga Firebase y espera a saber si hay una sesión abierta. */
    async init() {
      if (!cloud.enabled) { cloud.ready = true; return; }
      try {
        await loadScript(SDK + 'firebase-app-compat.js');
        await loadScript(SDK + 'firebase-auth-compat.js');
        await loadScript(SDK + 'firebase-firestore-compat.js');
        firebase.initializeApp(cfg);
        auth = firebase.auth();
        auth.languageCode = 'es';
        db = firebase.firestore();
      } catch (e) {
        console.warn(e);
        cloud.enabled = false;
        cloud.error = 'No se pudo conectar con Firebase. Se guardará solo en este navegador.';
        cloud.ready = true;
        return;
      }
      O9.util.on('state:changed', () => { if (cloud.user) pushSoon(); });
      await new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
          const first = !cloud.ready;
          cloud.user = user;
          if (user) await pull(user);
          cloud.ready = true;
          O9.util.emit('cloud:changed');
          O9.util.emit('cloud:auth', user);
          if (first) resolve();
        });
      });
    },

    async register({ name, course, email, password }) {
      const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
      await cred.user.updateProfile({ displayName: name });
      O9.store.update((s) => { s.profile.name = name; if (course) s.profile.course = course; });
      await push();
      return cred.user;
    },
    login: (email, password) => auth.signInWithEmailAndPassword(email.trim(), password),
    loginGoogle: () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),
    resetPassword: (email) => auth.sendPasswordResetEmail(email.trim()),

    /** Cierra sesión y limpia este navegador (importante en computadores compartidos del colegio). */
    async logout() {
      await push();
      await auth.signOut();
      O9.store.reset();
      O9.util.emit('state:replaced');
    },
    syncNow: push,

    /**
     * ¿La cuenta actual es de un docente?
     * Un docente es quien tiene un documento en "docentes/{su correo}" (se crea
     * a mano en la consola de Firebase; ver FIREBASE.md).
     */
    async isTeacher() {
      if (!cloud.user || !cloud.user.email) return false;
      if (cloud._teacher !== undefined && cloud._teacherUid === cloud.user.uid) return cloud._teacher;
      let ok = false;
      try {
        const snap = await db.collection('docentes').doc(cloud.user.email.toLowerCase()).get();
        ok = snap.exists;
      } catch (e) { ok = false; }
      cloud._teacher = ok;
      cloud._teacherUid = cloud.user.uid;
      return ok;
    },

    /** Lista de estudiantes registrados (solo docentes, lo controlan las reglas). */
    async listStudents() {
      const snap = await db.collection('usuarios').get();
      return snap.docs.map((d) => {
        const x = d.data();
        let state = null;
        try { state = x.data ? JSON.parse(x.data) : null; } catch (e) { state = null; }
        return Object.assign({}, x, {
          uid: d.id,
          state,
          updatedAt: x.updatedAt && x.updatedAt.toMillis ? x.updatedAt.toMillis() : null
        });
      });
    }
  };

  O9.cloud = cloud;
})(window.O9);
