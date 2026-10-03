const tbodyHeroes = document.getElementById('tabla-heroes');

const modalHeroe = document.getElementById('modal-heroe');
const modalHeroeTitle = document.getElementById('modal-heroe-title');
const formHeroe = modalHeroe.querySelector('form');
const modalEliminar = document.getElementById('modal-eliminar');
const btnNuevoHeroe = document.getElementById('btn-nuevo-heroe');
const btnConfirmarEliminar = modalEliminar.querySelector('.btn--danger');


formHeroe.elements['fechaNacimiento'].max = new Date().toISOString().split('T')[0];

let heroeSeleccionadoId = null;

function abrirModalRegistrar() {
  modalHeroeTitle.textContent = 'Registrar héroe';
  formHeroe.reset();
  formHeroe.elements['id'].value = '';
  modalHeroe.showModal();
}

function abrirModalEditar(id) {
  const heroe = todosLosRegistros.find(h => String(h.id) === String(id));
  if (!heroe) return;

  modalHeroeTitle.textContent = 'Modificar héroe';
  formHeroe.elements['id'].value = heroe.id;
  formHeroe.elements['nombre'].value = heroe.nombre ?? '';
  formHeroe.elements['apellido'].value = heroe.apellido ?? '';
  formHeroe.elements['fechaNacimiento'].value = heroe.fechaNacimiento ?? '';
  formHeroe.elements['estadoNacimiento'].value = heroe.estadoNacimiento ?? '';
  formHeroe.elements['epoca'].value = heroe.epoca ?? '';
  formHeroe.elements['movimiento'].value = heroe.movimiento ?? '';
  formHeroe.elements['descripcion'].value = heroe.descripcion ?? '';
  modalHeroe.showModal();
}

btnNuevoHeroe.addEventListener('click', abrirModalRegistrar);

tbodyHeroes.addEventListener('click', (evento) => {
  const btnEditar = evento.target.closest('.icon-btn--editar');
  const btnEliminar = evento.target.closest('.icon-btn--eliminar');

  if (btnEditar) {
    abrirModalEditar(btnEditar.dataset.id);
  }

  if (btnEliminar) {
    heroeSeleccionadoId = btnEliminar.dataset.id;
    modalEliminar.showModal();
  }
});

document.querySelectorAll('.modal__close, [data-close-modal]').forEach(boton => {
  boton.addEventListener('click', () => {
    boton.closest('dialog').close();
  });
});
