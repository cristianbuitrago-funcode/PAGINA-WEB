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

       // Docente = tiene un documento en docentes/{su correo} y su correo está verificado (Google)
       function esDocente() {
         return request.auth != null
           && request.auth.token.email_verified == true
           && exists(/databases/$(database)/documents/docentes/$(request.auth.token.email));
       }

       // Progreso: cada uno escribe el suyo; los docentes pueden leer todos
       match /usuarios/{uid} {
         allow read: if request.auth != null && (request.auth.uid == uid || esDocente());
         allow write: if request.auth != null && request.auth.uid == uid;
       }

       // Grupos: cualquiera puede comprobar un código (para registrarse con él),
       // pero solo los docentes los listan, y cada docente administra los suyos
       match /grupos/{code} {
         allow get: if true;
         allow list: if esDocente();
         allow create: if esDocente()
           && request.resource.data.teacherUid == request.auth.uid
           && request.resource.data.name is string
           && request.resource.data.name.size() > 0
           && request.resource.data.name.size() <= 60;
         allow update: if esDocente()
           && resource.data.teacherUid == request.auth.uid
           && request.resource.data.teacherUid == request.auth.uid;
         allow delete: if esDocente() && resource.data.teacherUid == request.auth.uid;
       }

       // Lista de docentes: cada uno puede comprobar si está en ella (se administra desde la consola)
       match /docentes/{email} {
         allow read: if request.auth != null && request.auth.token.email == email;
         allow write: if false;
       }

       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

5. Pulsa **Publicar**.

Estas reglas hacen que **cada estudiante solo pueda ver y modificar su propio progreso**, que solo los docentes puedan consultar el avance de los estudiantes y que cada docente administre únicamente sus propios grupos.

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

## Panel del docente 👩‍🏫

La plataforma trae un panel en **`#/docente`** (también se abre desde **Perfil → ¿Eres docente?**). Muestra:

- Número de estudiantes, progreso promedio, XP promedio, estudiantes activos en los últimos 7 días y cuántos completaron el curso.
- Gráficos de progreso promedio por curso y de estudiantes por nivel.
- **Temas donde más se equivocan**: los temas con más errores, ideales para repasar en clase.
- Una tabla con todos los estudiantes. Se puede filtrar por curso, buscar por nombre, ordenar por cualquier columna y hacer clic en un estudiante para ver su detalle.
- El botón **Descargar CSV** exporta la tabla a un archivo que abre directamente en Excel.

Para conocer el panel sin configurar nada, abre **`#/docente/demo`**, que usa datos inventados.

### Registrar a un docente

Por seguridad, solo pueden ver el panel las cuentas que tú agregues a mano:

1. El docente entra a la plataforma y **inicia sesión con Google**. El correo de Google ya viene verificado; las reglas exigen correo verificado.
2. En Firebase: **Firestore Database → Datos → Iniciar colección**.
3. ID de la colección: `docentes`.
4. ID del documento: **el correo del docente en minúsculas**, por ejemplo `profe.maria@gmail.com`.
5. Agrega un campo cualquiera, por ejemplo `nombre` (string) = `María Ruiz`, y pulsa **Guardar**.
6. Para más docentes, en la colección `docentes` pulsa **Agregar documento** y repite los pasos 4 y 5.

Además, **publica las reglas actualizadas**: copia de nuevo todo el contenido de `firestore.rules` en **Firestore → Reglas** y pulsa **Publicar**. Las reglas nuevas son las que permiten a los docentes leer el progreso de los estudiantes.

## Grupos y registro obligatorio

La plataforma está configurada con `requireLogin: true`: **nadie puede usarla sin cuenta**.

1. El docente entra con Google, abre **👩‍🏫 Docente** (en el menú; solo lo ven los docentes) y pulsa **➕ Crear grupo**, por ejemplo `9°A 2026`.
2. Se genera un **código de 6 caracteres**, por ejemplo `K7P2QX`. El docente lo comparte, o comparte el **enlace de registro**, que ya trae el código: `https://cristianbuitrago-funcode.github.io/PAGINA-WEB/#/cuenta/K7P2QX`.
3. Al crear su cuenta, el estudiante **debe** escribir ese código y queda en el grupo. Si entra con Google, la plataforma le pide el código antes de dejarlo continuar.
4. Si un grupo se **cierra** (🔒), no recibe estudiantes nuevos. Un grupo solo se puede eliminar si no tiene estudiantes.
5. Cada docente ve en su panel únicamente a los estudiantes de sus grupos.

Los estudiantes **no ven** el panel ni el enlace al panel. Si alguno escribe `#/docente`, la página lo devuelve al inicio, y además las reglas de Firestore le impiden leer datos de otros.

> Cuentas creadas **antes** de los grupos: la próxima vez que entren se les pedirá el código de su grupo.

## Ver a los estudiantes registrados en la consola

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
