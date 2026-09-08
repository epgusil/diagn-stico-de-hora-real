/* ================================================================
   ¿CUÁNTO VALE TU HORA REALMENTE? — LÓGICA DE LA APP
   Escuela de Posgrado USIL
   ================================================================ */

/* ----------------------------------------------------------------
   CONFIGURACIÓN DEL ENVÍO DE DATOS — EDITAR AQUÍ
   GitHub Pages es hosting estático (no ejecuta backend), así que el
   formulario de la pantalla 5 se envía a un Google Apps Script
   desplegado como Web App, conectado a un Google Sheet.

   1. Sigue las instrucciones del README.md ("Conectar el formulario
      a Google Sheets") para crear el Sheet y el Apps Script.
   2. Pega abajo la URL que te entrega el despliegue del Apps Script
      (termina en /exec).

   Mientras ENDPOINT_FORMULARIO esté vacío, el envío solo se
   registra en la consola del navegador (console.log) con un TODO
   visible, y el flujo del test sigue funcionando con normalidad.
   ---------------------------------------------------------------- */
const ENDPOINT_FORMULARIO = ""; // TODO: pegar aquí la URL /exec del Apps Script

(function () {
  "use strict";

  /* ==============================================================
     ESTADO DEL TEST
     ============================================================== */
  const estado = {
    pantallaActual: 1,
    ingresoMensual: 0,
    horasVisibles: 0,
    horasInvisibles: [0, 0, 0, 0, 0, 0],
    resultado: null, // { horaReal, horaCreida, horasNoPagadas, brecha, arquetipo }
  };

  const TOTAL_PANTALLAS = 6;

  /* ==============================================================
     REFERENCIAS DEL DOM
     ============================================================== */
  const el = {
    lienzo: document.getElementById("lienzo"),
    progresoHeader: document.getElementById("progreso-header"),
    progresoRelleno: document.getElementById("progreso-relleno"),
    progresoTexto: document.getElementById("progreso-texto"),

    btnEmpezar: document.getElementById("btn-empezar"),

    inputIngreso: document.getElementById("input-ingreso"),
    errorIngreso: document.getElementById("error-ingreso"),
    btnContinuar2: document.getElementById("btn-continuar-2"),

    inputHorasVisibles: document.getElementById("input-horas-visibles"),
    errorHorasVisibles: document.getElementById("error-horas-visibles"),
    btnContinuar3: document.getElementById("btn-continuar-3"),

    inputsHorasOcultas: [
      document.getElementById("hi-1"),
      document.getElementById("hi-2"),
      document.getElementById("hi-3"),
      document.getElementById("hi-4"),
      document.getElementById("hi-5"),
      document.getElementById("hi-6"),
    ],
    btnContinuar4: document.getElementById("btn-continuar-4"),

    formDatos: document.getElementById("form-datos"),
    fNombres: document.getElementById("f-nombres"),
    fApellidos: document.getElementById("f-apellidos"),
    fDni: document.getElementById("f-dni"),
    fTelefono: document.getElementById("f-telefono"),
    fCorreo: document.getElementById("f-correo"),
    fConsentimiento: document.getElementById("f-consentimiento"),
    btnVerResultado: document.getElementById("btn-ver-resultado"),

    resHoraReal: document.getElementById("res-hora-real"),
    resHoraCreida: document.getElementById("res-hora-creida"),
    resHorasNoPagadas: document.getElementById("res-horas-no-pagadas"),
    resBrechaPorcentaje: document.getElementById("res-brecha-porcentaje"),
    resBrechaBarra: document.getElementById("res-brecha-barra"),
    arquetipoEmoji: document.getElementById("arquetipo-emoji"),
    arquetipoTitulo: document.getElementById("arquetipo-titulo"),
    arquetipoDescripcion: document.getElementById("arquetipo-descripcion"),

    btnCompartirWhatsapp: document.getElementById("btn-compartir-whatsapp"),
    btnCompartirLinkedin: document.getElementById("btn-compartir-linkedin"),
    btnReiniciar: document.getElementById("btn-reiniciar"),
  };

  /* ==============================================================
     NAVEGACIÓN ENTRE PANTALLAS
     ============================================================== */
  function irAPantalla(numero) {
    document.querySelectorAll(".pantalla").forEach((seccion) => {
      seccion.classList.remove("activa");
    });
    const siguiente = document.getElementById("pantalla-" + numero);
    siguiente.classList.add("activa");
    estado.pantallaActual = numero;

    // La barra de progreso solo se muestra de la pantalla 2 a la 6
    // (paso 1 de 5 = pantalla 2 ... paso 5 de 5 = pantalla 6)
    if (numero >= 2) {
      const paso = numero - 1;
      el.progresoHeader.hidden = false;
      el.progresoRelleno.style.width = (paso / 5) * 100 + "%";
      el.progresoTexto.textContent = "Paso " + paso + " de 5";
    } else {
      el.progresoHeader.hidden = true;
    }

    el.lienzo.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    // Mueve el foco al primer campo o al titular de la nueva pantalla
    const foco = siguiente.querySelector("input, h1, h2");
    if (foco) foco.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-volver]").forEach((boton) => {
    boton.addEventListener("click", () => {
      irAPantalla(Math.max(1, estado.pantallaActual - 1));
    });
  });

  /* ==============================================================
     UTILIDADES DE VALIDACIÓN
     ============================================================== */
  function mostrarError(campoInput, elementoError, mensaje) {
    elementoError.textContent = mensaje;
    campoInput.closest(".campo-numero-grande, .campo-formulario")?.classList.add("con-error");
    campoInput.classList.add("con-error");
  }

  function limpiarError(campoInput, elementoError) {
    elementoError.textContent = "";
    campoInput.closest(".campo-numero-grande, .campo-formulario")?.classList.remove("con-error");
    campoInput.classList.remove("con-error");
  }

  function esNumeroValidoMayorQueCero(valor) {
    const n = parseFloat(valor);
    return !isNaN(n) && n > 0;
  }

  /* ==============================================================
     PANTALLA 1 → 2
     ============================================================== */
  el.btnEmpezar.addEventListener("click", () => irAPantalla(2));

  /* ==============================================================
     PANTALLA 2 — INGRESO MENSUAL
     ============================================================== */
  el.inputIngreso.addEventListener("input", () => limpiarError(el.inputIngreso, el.errorIngreso));

  el.btnContinuar2.addEventListener("click", () => {
    const valor = el.inputIngreso.value;
    if (!esNumeroValidoMayorQueCero(valor)) {
      mostrarError(el.inputIngreso, el.errorIngreso, "Ingresa un monto mayor a S/ 0.");
      el.inputIngreso.focus();
      return;
    }
    estado.ingresoMensual = parseFloat(valor);
    irAPantalla(3);
  });

  /* ==============================================================
     PANTALLA 3 — HORAS VISIBLES
     ============================================================== */
  el.inputHorasVisibles.addEventListener("input", () =>
    limpiarError(el.inputHorasVisibles, el.errorHorasVisibles)
  );

  el.btnContinuar3.addEventListener("click", () => {
    const valor = el.inputHorasVisibles.value;
    if (!esNumeroValidoMayorQueCero(valor)) {
      mostrarError(el.inputHorasVisibles, el.errorHorasVisibles, "Ingresa un número de horas mayor a 0.");
      el.inputHorasVisibles.focus();
      return;
    }
    estado.horasVisibles = parseFloat(valor);
    irAPantalla(4);
  });

  /* ==============================================================
     PANTALLA 4 — HORAS INVISIBLES
     ============================================================== */
  const errorHorasOcultas = document.getElementById("error-horas-ocultas");

  el.btnContinuar4.addEventListener("click", () => {
    let valido = true;
    const valores = el.inputsHorasOcultas.map((input) => {
      const n = parseFloat(input.value);
      if (input.value !== "" && (isNaN(n) || n < 0)) {
        valido = false;
        return 0;
      }
      return isNaN(n) ? 0 : n;
    });

    if (!valido) {
      errorHorasOcultas.textContent = "Revisa los valores: no pueden ser negativos.";
      return;
    }
    errorHorasOcultas.textContent = "";
    estado.horasInvisibles = valores;
    irAPantalla(5);
  });

  /* ==============================================================
     PANTALLA 5 — FORMULARIO
     ============================================================== */
  const validadoresFormulario = {
    "f-nombres": (v) => v.trim().length >= 2 || "Ingresa tus nombres.",
    "f-apellidos": (v) => v.trim().length >= 2 || "Ingresa tus apellidos.",
    "f-dni": (v) => /^\d{8}$/.test(v.trim()) || "El DNI debe tener 8 dígitos numéricos.",
    "f-telefono": (v) => /^\d{9}$/.test(v.trim()) || "El teléfono debe tener 9 dígitos numéricos.",
    "f-correo": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Ingresa un correo electrónico válido.",
  };

  function validarCampoFormulario(input) {
    const validador = validadoresFormulario[input.id];
    const errorEl = document.getElementById("error-" + input.id);
    if (!validador) return true;

    const resultado = validador(input.value);
    if (resultado === true) {
      limpiarError(input, errorEl);
      return true;
    } else {
      mostrarError(input, errorEl, resultado);
      return false;
    }
  }

  function formularioEsValido() {
    const camposTexto = [el.fNombres, el.fApellidos, el.fDni, el.fTelefono, el.fCorreo];
    // Solo mostramos errores visualmente si el campo ya tiene contenido o fue tocado;
    // pero para habilitar el botón, todos deben ser válidos.
    const todosValidos = camposTexto.every((input) => {
      const validador = validadoresFormulario[input.id];
      return validador ? validador(input.value) === true : true;
    });
    return todosValidos && el.fConsentimiento.checked;
  }

  function actualizarEstadoBoton() {
    el.btnVerResultado.disabled = !formularioEsValido();
  }

  [el.fNombres, el.fApellidos, el.fDni, el.fTelefono, el.fCorreo].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.id === "f-dni" || input.id === "f-telefono") {
        input.value = input.value.replace(/\D/g, "");
      }
      // No mostrar error mientras el campo está vacío y no ha perdido foco aún
      if (input.value.trim() !== "") {
        validarCampoFormulario(input);
      } else {
        limpiarError(input, document.getElementById("error-" + input.id));
      }
      actualizarEstadoBoton();
    });
    input.addEventListener("blur", () => {
      if (input.value.trim() !== "") validarCampoFormulario(input);
    });
  });

  el.fConsentimiento.addEventListener("change", () => {
    document.getElementById("error-f-consentimiento").textContent = "";
    actualizarEstadoBoton();
  });

  el.formDatos.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const camposTexto = [el.fNombres, el.fApellidos, el.fDni, el.fTelefono, el.fCorreo];
    let todosValidos = true;
    camposTexto.forEach((input) => {
      if (!validarCampoFormulario(input)) todosValidos = false;
    });

    if (!el.fConsentimiento.checked) {
      document.getElementById("error-f-consentimiento").textContent =
        "Debes aceptar el tratamiento de datos para continuar.";
      todosValidos = false;
    }

    if (!todosValidos) return;

    calcularResultado();
    pintarResultado();
    enviarDatosFormulario();
    irAPantalla(6);
  });

  /* ==============================================================
     CÁLCULO DEL RESULTADO Y ARQUETIPO
     ============================================================== */
  function calcularResultado() {
    const totalHorasInvisibles = estado.horasInvisibles.reduce((suma, h) => suma + h, 0);
    const horaCreida = estado.ingresoMensual / estado.horasVisibles;
    const horaReal = estado.ingresoMensual / (estado.horasVisibles + totalHorasInvisibles);
    const brecha = (horaCreida - horaReal) / horaCreida;

    let arquetipo;
    if (brecha >= 0.4) {
      arquetipo = {
        emoji: "🕯️",
        titulo: "TRABAJAS POR VOCACIÓN",
        descripcion: "Tu hora real cayó casi a la mitad. La institución cuenta con eso. Por eso no cambia.",
      };
    } else if (brecha >= 0.15) {
      arquetipo = {
        emoji: "⚙️",
        titulo: "TRABAJAS POR VOLUMEN",
        descripcion: "Ganas más porque trabajas más. Sin techo de crecimiento, con techo de cuerpo.",
      };
    } else {
      arquetipo = {
        emoji: "🎯",
        titulo: "TRABAJAS POR ESPECIALIZACIÓN",
        descripcion: "Te pagan por lo que sabes, no por lo que aguantas.",
      };
    }

    estado.resultado = {
      horaReal,
      horaCreida,
      horasNoPagadas: totalHorasInvisibles,
      brecha,
      arquetipo,
    };
  }

  function formatearSoles(numero) {
    if (!isFinite(numero)) return "S/ 0.00";
    return "S/ " + numero.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pintarResultado() {
    const r = estado.resultado;
    el.resHoraReal.textContent = formatearSoles(r.horaReal);
    el.resHoraCreida.textContent = formatearSoles(r.horaCreida);
    el.resHorasNoPagadas.textContent = r.horasNoPagadas.toLocaleString("es-PE") + " horas al mes";

    const brechaPorcentaje = Math.max(0, Math.round(r.brecha * 100));
    el.resBrechaPorcentaje.textContent = brechaPorcentaje + "%";
    // Pequeño retraso para que la transición de la barra sea visible
    el.resBrechaBarra.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.resBrechaBarra.style.width = Math.min(100, brechaPorcentaje) + "%";
      });
    });

    el.arquetipoEmoji.textContent = r.arquetipo.emoji;
    el.arquetipoTitulo.textContent = r.arquetipo.titulo;
    el.arquetipoDescripcion.textContent = r.arquetipo.descripcion;

    prepararBotonesCompartir(r.arquetipo.titulo);
  }

  /* ==============================================================
     COMPARTIR EN WHATSAPP Y LINKEDIN
     ============================================================== */
  function prepararBotonesCompartir(nombreArquetipo) {
    const url = window.location.href.split("?")[0];
    const texto =
      "Calculé cuánto vale mi hora de verdad y salí " + nombreArquetipo + ". Hazlo tú: " + url;

    el.btnCompartirWhatsapp.onclick = () => {
      window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank", "noopener");
    };

    el.btnCompartirLinkedin.onclick = () => {
      // LinkedIn no soporta texto pre-cargado en el share oficial más allá de la URL;
      // usamos el share dialog estándar. El texto queda disponible para copiar si el
      // usuario prefiere pegarlo manualmente en su publicación.
      const urlCompartir =
        "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);
      window.open(urlCompartir, "_blank", "noopener");
    };
  }

  /* ==============================================================
     REINICIAR TEST
     ============================================================== */
  el.btnReiniciar.addEventListener("click", () => {
    estado.ingresoMensual = 0;
    estado.horasVisibles = 0;
    estado.horasInvisibles = [0, 0, 0, 0, 0, 0];
    estado.resultado = null;

    el.inputIngreso.value = "";
    el.inputHorasVisibles.value = "";
    el.inputsHorasOcultas.forEach((input) => (input.value = "0"));
    el.formDatos.reset();
    el.btnVerResultado.disabled = true;
    limpiarError(el.inputIngreso, el.errorIngreso);
    limpiarError(el.inputHorasVisibles, el.errorHorasVisibles);

    irAPantalla(1);
  });

  /* ==============================================================
     ENVÍO DE DATOS DEL FORMULARIO
     Función aislada: si ENDPOINT_FORMULARIO no está configurado,
     solo registra los datos en consola (modo desarrollo) y el
     flujo del test continúa con normalidad.

     IMPORTANTE: por indicación del brief, NUNCA se envían ni se
     almacenan las cifras de ingreso ni de horas del usuario — solo
     sus datos de contacto, el arquetipo resultante y metadatos.
     ============================================================== */
  function obtenerParametrosUTM() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((clave) => {
      if (params.has(clave)) utm[clave] = params.get(clave);
    });
    return utm;
  }

  function enviarDatosFormulario() {
    const payload = {
      nombres: el.fNombres.value.trim(),
      apellidos: el.fApellidos.value.trim(),
      dni: el.fDni.value.trim(),
      correo: el.fCorreo.value.trim(),
      telefono: el.fTelefono.value.trim(),
      arquetipo: estado.resultado.arquetipo.titulo,
      fechaHora: new Date().toISOString(),
      urlOrigen: window.location.href,
      utm: obtenerParametrosUTM(),
      // Nota: intencionalmente NO se incluyen ingresoMensual, horasVisibles
      // ni horasInvisibles — el brief exige no enviar ni almacenar esas cifras.
    };

    if (!ENDPOINT_FORMULARIO) {
      // TODO: configurar ENDPOINT_FORMULARIO al inicio de este archivo
      // con la URL /exec del Google Apps Script (ver README.md).
      console.log("[TODO] ENDPOINT_FORMULARIO no configurado. Datos que se habrían enviado:", payload);
      return;
    }

    fetch(ENDPOINT_FORMULARIO, {
      method: "POST",
      mode: "no-cors", // Apps Script Web Apps suelen requerir no-cors desde el navegador
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error("No se pudo enviar el formulario al endpoint configurado:", error);
    });
  }

  /* ==============================================================
     INICIALIZACIÓN
     ============================================================== */
  irAPantalla(1);
})();
