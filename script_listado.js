const API_URL = "https://practica-1-2-bckd.onrender.com/api/v1/heroes"
const tbody = document.getElementById("tabla-heroes")
const btnAnterior = document.getElementById('btn-anterior');
const btnSiguiente = document.getElementById('btn-siguiente');
const infoPagina = document.getElementById('info-pagina');
const formBusqueda = document.getElementById('form-busqueda');

const epocas = document.getElementById("filtro-epoca");
const movimientos = document.getElementById("filtro-movimiento");
const estadoNacimiento = document.getElementById("filtro-estado")

const datalistEpocas = document.getElementById("lista-epocas-datalist");
const datalistEstados = document.getElementById("lista-estados-datalist");

const chipsEpoca = document.getElementById("chips-epoca");
const chipsMovimiento = document.getElementById("chips-movimiento");

let listaEpoca = [];
let listaMovimiento = [];
let listaEstados = [];

let epocasSeleccionadas = [];
let movimientosSeleccionadas = [];

let todosLosRegistros = [];
let registrosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 5;

async function cargarDatos() {
  try {
    const respuesta = await fetch(API_URL);
    todosLosRegistros = await respuesta.json();
    registrosFiltrados = todosLosRegistros;
    cargarFiltros(todosLosRegistros);
    mostrarPagina(1);
  } catch (error) {
    console.error("Error al cargar datos:", error)
    mostrarToast('No se pudieron cargar los héroes. Verifica que el servidor esté activo.', 'error');
  }
}

function mostrarPagina(pagina) {
  paginaActual = pagina;
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina) || 1;

  // Calcular el rango de elementos (página 1: 0 a 5, página 2: 5 a 10)
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosVisibles = registrosFiltrados.slice(inicio, fin);

  tbody.innerHTML = '';
  registrosVisibles.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.apellido}</td>
      <td>${item.fechaNacimiento}</td>
      <td>${item.estadoNacimiento}</td>
      <td>${item.epoca}</td>
      <td>${item.movimiento}</td>
      <td><div class="texto-scroll">${item.descripcion}</div></td>
      <td>
        <div class="table__actions">
          <button class="icon-btn icon-btn--editar" type="button" data-id="${item.id}" aria-label="Editar héroe">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn icon-btn--eliminar" type="button" data-id="${item.id}" aria-label="Eliminar héroe">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const primerRegistro = registrosVisibles.length ? inicio + 1 : 0;
  const ultimoRegistro = inicio + registrosVisibles.length;
  infoPagina.textContent = `Registros ${primerRegistro} a ${ultimoRegistro} de ${registrosFiltrados.length} · Página ${paginaActual} de ${totalPaginas}`;

  // Deshabilitar flechas en los extremos
  btnAnterior.disabled = paginaActual <= 1;
  btnSiguiente.disabled = paginaActual >= totalPaginas;
}


function valoresSeparadosPorComa(texto) {
  return (texto || '').split(',').map(valor => valor.trim()).filter(Boolean);
}

function cargarFiltros(todosLosRegistros) {
  todosLosRegistros.forEach(item => {
    valoresSeparadosPorComa(item.epoca).forEach(epoca => {
      if (!listaEpoca.includes(epoca)) {
        listaEpoca.push(epoca);

        const option = document.createElement("option");
        option.innerText = epoca;
        epocas.appendChild(option);

        const optionDatalist = document.createElement("option");
        optionDatalist.value = epoca;
        datalistEpocas.appendChild(optionDatalist);
      }
    });

    valoresSeparadosPorComa(item.movimiento).forEach(movimiento => {
      if (!listaMovimiento.includes(movimiento)) {
        listaMovimiento.push(movimiento);

        const option = document.createElement("option");
        option.innerText = movimiento;
        movimientos.appendChild(option);
      }
    });

    if (!listaEstados.includes(item.estadoNacimiento)) {
      listaEstados.push(item.estadoNacimiento);

      const option = document.createElement("option");
      option.innerText = `${item.estadoNacimiento}`;
      estadoNacimiento.appendChild(option);

      const optionDatalist = document.createElement("option");
      optionDatalist.value = item.estadoNacimiento;
      datalistEstados.appendChild(optionDatalist);
    }
  });
}


btnAnterior.addEventListener('click', () => {
  if (paginaActual > 1) {
    mostrarPagina(paginaActual - 1);
  }
});

btnSiguiente.addEventListener('click', () => {
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  if (paginaActual < totalPaginas) {
    mostrarPagina(paginaActual + 1);
  }
});

async function obtenerJson(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}`);
  }
  return respuesta.json();
}

async function obtenerUnion(construirUrl, valores) {
  const listas = await Promise.all(valores.map(valor => obtenerJson(construirUrl(valor))));
  const vistos = new Set();
  const union = [];
  listas.flat().forEach(heroe => {
    if (!vistos.has(heroe.id)) {
      vistos.add(heroe.id);
      union.push(heroe);
    }
  });
  return union;
}

async function buscarHeroes() {
  const estado = estadoNacimiento.value;

  if (epocasSeleccionadas.length === 0 && movimientosSeleccionadas.length === 0 && !estado) {
    registrosFiltrados = todosLosRegistros;
    mostrarPagina(1);
    return;
  }

  try {
    const resultadosPorTipo = [];

    if (epocasSeleccionadas.length > 0) {
      resultadosPorTipo.push(
        obtenerUnion(valor => `${API_URL}/epoca/${encodeURIComponent(valor)}`, epocasSeleccionadas)
      );
    }
    if (movimientosSeleccionadas.length > 0) {
      resultadosPorTipo.push(
        obtenerUnion(valor => `${API_URL}/movimiento?movimiento=${encodeURIComponent(valor)}`, movimientosSeleccionadas)
      );
    }
    if (estado) {
      resultadosPorTipo.push(obtenerJson(`${API_URL}/estado/${encodeURIComponent(estado)}`));
    }

    const listasPorTipo = await Promise.all(resultadosPorTipo);


    registrosFiltrados = listasPorTipo.reduce((interseccion, lista) =>
      interseccion.filter(heroe => lista.some(h => h.id === heroe.id))
    );

    mostrarPagina(1);

    if (registrosFiltrados.length === 0) {
      mostrarToast('No se encontraron héroes con esos criterios.', 'error');
    }
  } catch (error) {
    console.error('Error al buscar héroes:', error);
    mostrarToast('No se pudo realizar la búsqueda.', 'error');
  }
}

function renderChips(contenedor, valores, alQuitar) {
  contenedor.innerHTML = '';
  valores.forEach(valor => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${valor} <button type="button" class="chip__quitar" aria-label="Quitar ${valor}">&times;</button>`;
    chip.querySelector('.chip__quitar').addEventListener('click', () => alQuitar(valor));
    contenedor.appendChild(chip);
  });
}

function agregarEpoca() {
  const valor = epocas.value;
  if (valor && !epocasSeleccionadas.includes(valor)) {
    epocasSeleccionadas.push(valor);
    renderChips(chipsEpoca, epocasSeleccionadas, quitarEpoca);
    buscarHeroes();
  }
  epocas.value = '';
}

function quitarEpoca(valor) {
  epocasSeleccionadas = epocasSeleccionadas.filter(v => v !== valor);
  renderChips(chipsEpoca, epocasSeleccionadas, quitarEpoca);
  buscarHeroes();
}

function agregarMovimiento() {
  const valor = movimientos.value;
  if (valor && !movimientosSeleccionadas.includes(valor)) {
    movimientosSeleccionadas.push(valor);
    renderChips(chipsMovimiento, movimientosSeleccionadas, quitarMovimiento);
    buscarHeroes();
  }
  movimientos.value = '';
}

function quitarMovimiento(valor) {
  movimientosSeleccionadas = movimientosSeleccionadas.filter(v => v !== valor);
  renderChips(chipsMovimiento, movimientosSeleccionadas, quitarMovimiento);
  buscarHeroes();
}

formBusqueda.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarHeroes();
});

epocas.addEventListener('change', agregarEpoca);
movimientos.addEventListener('change', agregarMovimiento);
estadoNacimiento.addEventListener('change', buscarHeroes);

formBusqueda.addEventListener('reset', () => {
  epocasSeleccionadas = [];
  movimientosSeleccionadas = [];
  renderChips(chipsEpoca, epocasSeleccionadas, quitarEpoca);
  renderChips(chipsMovimiento, movimientosSeleccionadas, quitarMovimiento);
  registrosFiltrados = todosLosRegistros;
  mostrarPagina(1);
});

document.addEventListener('DOMContentLoaded', cargarDatos);