# ¿Cuánto vale tu hora realmente? — Escuela de Posgrado USIL

Test interactivo de una sola página (5 pantallas + resultado) para profesionales
de la salud. Sitio 100% estático: HTML + CSS + JS vanilla, sin frameworks ni
proceso de build. Funciona abriendo `index.html` directamente o desplegado en
GitHub Pages.

## Estructura

```
/index.html
/assets/css/style.css
/assets/js/app.js
/assets/img/        → logo, favicons e imagen para redes sociales
/apps-script/Codigo.gs  → script para conectar el formulario a Google Sheets
/README.md
```

La carpeta `/apps-script/` no se sube a GitHub Pages ni la usa el sitio
directamente — es solo el código que copias al editor de Apps Script. Ver la
sección 4 más abajo.

## 1. Desplegar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (o usa uno existente) y sube todo el
   contenido de esta carpeta a la raíz del repositorio (o a la rama que uses).
2. En el repositorio, ve a **Settings → Pages**.
3. En **Source**, selecciona la rama (por ejemplo `main`) y la carpeta `/root`.
4. Guarda. GitHub te dará una URL del tipo:
   `https://TU-USUARIO.github.io/TU-REPO/`
5. Abre `index.html` y reemplaza `https://TU-USUARIO.github.io/TU-REPO/` en las
   etiquetas `og:url` (líneas cerca del `<head>`) por tu URL real, para que la
   vista previa al compartir en WhatsApp/redes se vea correcta.

El sitio usa únicamente rutas relativas (`assets/...`), así que funciona igual
en la raíz de un dominio o en una subcarpeta de GitHub Pages.

## 2. Dónde cambiar los colores

Todos los colores de marca están centralizados como variables CSS en la parte
superior de `assets/css/style.css`, dentro de `:root`:

```css
:root {
  --color-primario: #00195A;
  --color-acento: #1E50DC;
  --color-blanco: #FFFFFF;
  --color-texto: #1A1A1A;
  --color-gris-apoyo: #6B7280;
  ...
}
```

Cambia cualquiera de estos valores y se actualiza en todo el sitio (botones,
barra de progreso, tarjetas, acentos).

## 3. Dónde editar los textos

- **Textos generales del test** (títulos, preguntas, microcopy): directamente
  en `index.html`, dentro de cada `<section class="pantalla" ...>`.
- **Texto legal de consentimiento y correo del DPO**: en `index.html`, busca
  el comentario `EDITAR AQUÍ: texto legal provisional` (pantalla 5). Reemplaza
  el texto completo por el aprobado por el DPO y el `[CORREO DPO]` por el
  correo real.
- **URL de la Política de Privacidad**: mismo bloque, en el enlace con
  `id="enlace-privacidad"` — reemplaza el `href="#"` por la URL real.
- **Programas de la Escuela de Posgrado** (bloque de conversión, pantalla de
  resultado): busca el comentario `EDITAR AQUÍ: reemplazar los programas` y
  actualiza los tres enlaces `<a class="tarjeta-programa">` con el nombre real
  del programa y su URL.
- **Logo / imagen de redes sociales**: los archivos están en `assets/img/`.
  `logo-epg.png` es el logo institucional con fondo transparente (usado en la
  portada); `og-image.png` es la imagen que se muestra al compartir el enlace
  en WhatsApp/LinkedIn/redes, y los `favicon-*` se generaron a partir del
  mismo logo en alta resolución para verse nítidos en cualquier pantalla.

## 4. Conectar el formulario a Google Sheets (Apps Script)

GitHub Pages no ejecuta código de servidor, así que el formulario de la
pantalla 5 envía sus datos a un **Google Apps Script** desplegado como
aplicación web, que guarda cada registro en un Google Sheet. Es el mismo
patrón usado en otras landings de la Escuela de Posgrado.

**Qué se envía:** nombres, apellidos, DNI, correo, teléfono, el arquetipo
resultante, fecha/hora y los parámetros UTM de la URL (si existen.
**Qué NO se envía ni se guarda:** el ingreso mensual ni las horas declaradas
por el usuario — esas cifras solo existen en el navegador para calcular el
resultado y se descartan.

### Pasos

1. **Crea el Google Sheet.** Ve a [sheets.google.com](https://sheets.google.com),
   crea uno nuevo (puedes llamarlo, por ejemplo, "Diagnóstico de hora real —
   Respuestas") y en la primera fila agrega estos encabezados (uno por
   columna, en este orden):
   `fechaHora | nombres | apellidos | dni | correo | telefono | arquetipo | urlOrigen | utm_source | utm_medium | utm_campaign`

2. **Abre el editor de Apps Script.** Dentro del Sheet, ve a
   **Extensiones → Apps Script**. Borra el contenido de `Código.gs` y pega
   el contenido completo del archivo `apps-script/Codigo.gs` incluido en este
   proyecto.

3. **Despliega como aplicación web.** Arriba a la derecha, clic en
   **Implementar → Nueva implementación**. Elige el tipo **Aplicación web**.
   Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
   Clic en **Implementar** y autoriza los permisos que te pida Google.

4. **Copia la URL del despliegue.** Termina en `/exec`. Ábrela en el
   navegador — deberías ver algo como una página en blanco o un error de
   método (es normal, ese endpoint solo acepta `POST`).

5. **Pega la URL en el código.** Abre `assets/js/app.js` y en la primera
   línea de configuración reemplaza:

   ```javascript
   const ENDPOINT_FORMULARIO = ""; // TODO: pegar aquí la URL /exec del Apps Script
   ```

   por:

   ```javascript
   const ENDPOINT_FORMULARIO = "https://script.google.com/macros/s/TU_ID/exec";
   ```

6. **Prueba el flujo completo** en el sitio y confirma que el registro
   aparece como una fila nueva en el Google Sheet.

Mientras `ENDPOINT_FORMULARIO` quede vacío, el test sigue funcionando de
principio a fin: los datos del formulario solo se imprimen en la consola del
navegador (`console.log`) con un `TODO` visible, sin bloquear al usuario.

### Nota sobre `mode: "no-cors"`

El envío en `app.js` usa `fetch(..., { mode: "no-cors" })` porque los Web Apps
de Apps Script no siempre devuelven encabezados CORS compatibles con lectura
desde el navegador. Esto significa que el sitio no puede leer la respuesta del
Apps Script (no sabe si fue exitosa), pero el envío sí llega y se guarda en el
Sheet. Si prefieres confirmar la respuesta en el navegador, puedes desplegar el
Apps Script detrás de un proxy propio que sí devuelva CORS, pero para este caso
de uso no es necesario.

## 5. Pendientes antes de publicar

- [ ] Reemplazar el texto legal de consentimiento por el aprobado por el DPO
- [ ] Reemplazar `[CORREO DPO]` por el correo real
- [ ] Pegar la URL real de la Política de Privacidad
- [ ] Configurar `ENDPOINT_FORMULARIO` en `assets/js/app.js`
- [ ] Reemplazar los 3 programas de ejemplo por programas reales de la EPG
- [ ] Actualizar `og:url`, `og:image` y `twitter:image` en `index.html` con la
      URL final de GitHub Pages (deben ser absolutas, no relativas)
- [ ] Revisar que el enlace del botón "Hablar con un asesor académico" apunte
      al destino correcto (WhatsApp, formulario de contacto, etc.)

## Accesibilidad y rendimiento

- Navegación completa por teclado, con foco visible en cada pantalla.
- Labels asociados a todos los campos, mensajes de error anunciados con
  `role="alert"`.
- Contraste de texto conforme a AA sobre los colores institucionales.
- `prefers-reduced-motion` respetado: las transiciones se desactivan si el
  usuario lo indica en su sistema operativo.
- Sin dependencias externas más allá de Google Fonts (opcional — puedes
  quitar el `<link>` de Google Fonts en `index.html` si prefieres no
  depender de un servicio externo; el sitio cae de vuelta a fuentes del
  sistema).
