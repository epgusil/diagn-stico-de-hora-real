/**
 * ================================================================
 * Codigo.gs — Recibe los datos del formulario "¿Cuánto vale tu hora
 * realmente?" y los guarda como una fila nueva en este Google Sheet.
 *
 * CÓMO USARLO:
 * 1. Crea un Google Sheet nuevo (ver README.md, sección 4).
 * 2. En el Sheet: Extensiones → Apps Script.
 * 3. Borra el contenido de Código.gs y pega TODO este archivo.
 * 4. Implementar → Nueva implementación → tipo "Aplicación web".
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario
 * 5. Copia la URL que termina en /exec y pégala en
 *    assets/js/app.js, en la constante ENDPOINT_FORMULARIO
 *    (al inicio del archivo).
 *
 * IMPORTANTE: este script solo guarda datos de contacto, el
 * arquetipo resultante y metadatos de la visita. Por diseño, el
 * formulario nunca envía el ingreso mensual ni las horas que
 * declaró la persona — esas cifras no llegan hasta acá.
 * ================================================================
 */

function doPost(e) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var datos = JSON.parse(e.postData.contents);

  hoja.appendRow([
    datos.fechaHora || new Date().toISOString(),
    datos.nombres || "",
    datos.apellidos || "",
    datos.dni || "",
    datos.correo || "",
    datos.telefono || "",
    datos.arquetipo || "",
    datos.urlOrigen || "",
    (datos.utm && datos.utm.utm_source) || "",
    (datos.utm && datos.utm.utm_medium) || "",
    (datos.utm && datos.utm.utm_campaign) || ""
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba opcional: ejecútala manualmente desde el editor
 * de Apps Script (botón ▶) para confirmar que el script puede
 * escribir en la hoja, sin necesidad de desplegar nada todavía.
 */
function pruebaManual_() {
  var datosDePrueba = {
    fechaHora: new Date().toISOString(),
    nombres: "Prueba",
    apellidos: "Manual",
    dni: "00000000",
    correo: "prueba@ejemplo.com",
    telefono: "900000000",
    arquetipo: "TRABAJAS POR ESPECIALIZACIÓN",
    urlOrigen: "https://TU-USUARIO.github.io/TU-REPO/",
    utm: { utm_source: "test", utm_medium: "manual", utm_campaign: "prueba" }
  };

  doPost({ postData: { contents: JSON.stringify(datosDePrueba) } });
}
