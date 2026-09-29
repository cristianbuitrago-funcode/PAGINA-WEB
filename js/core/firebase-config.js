/**
 * CONFIGURACIÓN DE FIREBASE (registro de estudiantes y progreso en la nube)
 * ------------------------------------------------------------------------
 * Mientras esto esté en null, la plataforma funciona sin cuentas y guarda
 * el progreso solo en el navegador (localStorage).
 *
 * Para activarlo, pega aquí el objeto "firebaseConfig" que te da Firebase
 * (Configuración del proyecto → Tus apps → App web). Ver FIREBASE.md.
 *
 * Estos datos NO son secretos: Firebase los diseñó para ir en el código de la
 * página. La seguridad la dan las reglas de Firestore (firestore.rules).
 */
window.O9 = window.O9 || {};

window.O9.firebaseConfig = null;
/* Ejemplo (reemplaza null por algo así):
window.O9.firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ofimatica9.firebaseapp.com",
  projectId: "ofimatica9",
  storageBucket: "ofimatica9.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
*/

window.O9.cloudOptions = {
  requireLogin: false, // true = los estudiantes deben registrarse o iniciar sesión para usar la plataforma
  google: true         // mostrar el botón "Continuar con Google"
};
