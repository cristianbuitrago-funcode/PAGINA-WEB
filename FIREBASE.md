# Activar cuentas de estudiantes con Firebase

Con Firebase los estudiantes pueden **registrarse** (con correo o con Google) y su **progreso se guarda en la nube**. Así no se pierde al cambiar de computador o de celular.

Firebase tiene un plan **gratuito (Spark)** que alcanza para un colegio: 50.000 lecturas y 20.000 escrituras por día. No hay que poner tarjeta de crédito.

La plataforma ya trae todo el código. Tú solo tienes que crear el proyecto y pegar su configuración. Si no lo configuras, la página sigue funcionando igual que antes, guardando en el navegador.

---

## Paso 1 · Crear el proyecto

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. Pulsa **Crear un proyecto** (o *Agregar proyecto*).
3. Ponle un nombre, por ejemplo `ofimatica9`, y pulsa **Continuar**.
4. Google Analytics: puedes **desactivarlo**, no se necesita. Pulsa **Crear proyecto**.

## Paso 2 · Registrar la app web y copiar la configuración

1. En la página principal del proyecto, pulsa el ícono **`</>`** (Web).
2. Apodo de la app: `Ofimática 9°`. **No** marques "Firebase Hosting" por ahora. Pulsa **Registrar app**.
3. Firebase te muestra un bloque de código con `const firebaseConfig = { ... }`. **Copia solo lo que está entre las llaves `{ }`.**
   - Si lo necesitas después: ⚙️ **Configuración del proyecto → General → Tus apps**.

## Paso 3 · Activar el registro (Authentication)

1. Menú izquierdo: **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Método de acceso** (*Sign-in method*):
   - **Correo electrónico/contraseña** → **Habilitar** → Guardar.
   - **Google** (opcional pero recomendado) → **Habilitar** → elige tu correo de asistencia → Guardar.
3. Pestaña **Configuración → Dominios autorizados** → **Agregar dominio**:
   - `cristianbuitrago-funcode.github.io`

   Sin este paso, el inicio de sesión falla con "Este sitio no está autorizado".

## Paso 4 · Crear la base de datos (Firestore)

1. Menú izquierdo: **Compilación → Firestore Database** → **Crear base de datos**.
2. Ubicación: elige una cercana, por ejemplo `southamerica-east1` (São Paulo) o `nam5` (EE. UU.). **No se puede cambiar después.**
3. Elige **Iniciar en modo de producción** → **Crear**.
4. Abre la pestaña **Reglas**, borra lo que hay y pega esto, que es el contenido del archivo `firestore.rules`:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarios/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

5. Pulsa **Publicar**.

Estas reglas hacen que **cada estudiante solo pueda ver y modificar su propio progreso**.

## Paso 5 · Pegar la configuración en la página

1. En GitHub abre el archivo **`js/core/firebase-config.js`** y pulsa el lápiz ✏️ (*Edit this file*).
2. Cambia esta línea:

   ```js
   window.O9.firebaseConfig = null;
   ```

   por la tuya, pegando lo que copiaste en el paso 2:

   ```js
   window.O9.firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "ofimatica9.firebaseapp.com",
     projectId: "ofimatica9",
     storageBucket: "ofimatica9.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```

3. Opcional, en el mismo archivo:
   - `requireLogin: true` → los estudiantes **deben** registrarse o iniciar sesión para usar la plataforma.
   - `google: false` → oculta el botón "Continuar con Google".
4. Pulsa **Commit changes**. En uno o dos minutos GitHub Pages publica el cambio.

> Estos datos **no son secretos**: Firebase los diseñó para ir dentro de la página. La seguridad la dan las reglas del paso 4.

## Paso 6 · Probar

1. Abre **https://cristianbuitrago-funcode.github.io/PAGINA-WEB/#/cuenta**. Si ves la página vieja, recarga o usa una pestaña de incógnito.
2. Pulsa **Crear cuenta**, llena los datos y regístrate.
3. Completa algún tema. En Firebase → **Firestore Database → Datos** aparecerá la colección **`usuarios`** con un documento por estudiante.
4. Abre la página en otro navegador, inicia sesión con la misma cuenta y verás el mismo progreso.

---

## Cómo funciona

- Cada estudiante tiene un documento `usuarios/{uid}` con su nombre, curso, correo, XP, nivel, % de progreso, temas y retos completados, insignias y si completó el curso. También guarda el progreso completo en el campo `data`.
- El progreso se sube solo, unos segundos después de cada cambio.
- Si un estudiante ya había avanzado **antes** de registrarse, ese avance pasa a su cuenta.
- **Cerrar sesión** borra el progreso de ese navegador; queda guardado en la nube. Es ideal para los computadores compartidos del colegio.
- Si alguien olvida su contraseña, la pantalla de inicio de sesión tiene **"¿Olvidaste tu contraseña?"**, que envía un correo para crear una nueva.

## Ver a los estudiantes registrados

- **Authentication → Usuarios**: lista de cuentas (correo y fecha de registro). Desde aquí puedes eliminar cuentas o restablecer contraseñas.
- **Firestore → Datos → usuarios**: el avance de cada uno (xp, progress, course...).

## Problemas frecuentes

| Mensaje | Solución |
|---|---|
| "Este sitio no está autorizado en Firebase" | Paso 3.3: agrega `cristianbuitrago-funcode.github.io` a Dominios autorizados |
| "Este método de inicio de sesión no está activado" | Paso 3.2: habilita Correo/contraseña o Google |
| "Firebase rechazó el guardado" | Paso 4.4: revisa y publica las reglas |
| La página no muestra "Crear cuenta" | Revisa que `firebaseConfig` quedó bien pegado (llaves, comillas y comas) y recarga sin caché |
| En el colegio no carga el registro | La red puede estar bloqueando `gstatic.com` o `googleapis.com`; pide al área de sistemas que los permita |

## (Opcional) Publicar en Firebase Hosting en vez de GitHub Pages

Si prefieres la dirección `https://ofimatica9.web.app`:

1. Instala Node.js y luego ejecuta `npm install -g firebase-tools` en una terminal.
2. En la carpeta del proyecto: `firebase login` y después `firebase use --add` (elige tu proyecto).
3. `firebase deploy`. Publica la página y las reglas de Firestore con los archivos `firebase.json` y `firestore.rules` que ya están en el repositorio.

El dominio `.web.app` queda autorizado automáticamente para el inicio de sesión.
