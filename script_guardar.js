const toastContainer = document.querySelector('.toast-container');

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

formHeroe.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!formHeroe.checkValidity()) {
    formHeroe.reportValidity();
    return;
  }

  const id = formHeroe.elements['id'].value;
  const heroe = {
    nombre: formHeroe.elements['nombre'].value.trim(),
    apellido: formHeroe.elements['apellido'].value.trim(),
    fechaNacimiento: formHeroe.elements['fechaNacimiento'].value,
    estadoNacimiento: formHeroe.elements['estadoNacimiento'].value.trim(),
    epoca: formHeroe.elements['epoca'].value.trim(),
    movimiento: formHeroe.elements['movimiento'].value.trim(),
    descripcion: formHeroe.elements['descripcion'].value.trim(),
  };

  const hoy = new Date().toISOString().split('T')[0];
  if (heroe.fechaNacimiento > hoy) {
    mostrarToast('La fecha de nacimiento no puede ser posterior a hoy.', 'error');
    return;
  }

  const nombreCompleto = `${heroe.nombre} ${heroe.apellido}`.toLowerCase();
  const yaExiste = todosLosRegistros.some(h =>
    String(h.id) !== String(id) &&
    `${h.nombre} ${h.apellido}`.toLowerCase() === nombreCompleto
  );
  if (yaExiste) {
    mostrarToast('Ya existe un héroe registrado con ese nombre y apellido.', 'error');
    return;
  }

  const url = id ? `${API_URL}/${id}` : API_URL;
  const metodo = id ? 'PUT' : 'POST';
  const btnGuardar = formHeroe.querySelector('button[type="submit"]');

  try {
    btnGuardar.disabled = true;

    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heroe),
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}`);
    }

    modalHeroe.close();
    mostrarToast(id ? 'Héroe actualizado correctamente.' : 'Héroe registrado correctamente.');
    await cargarDatos();
  } catch (error) {
    console.error('Error al guardar héroe:', error);
    mostrarToast('No se pudo guardar el héroe. Intenta de nuevo.', 'error');
  } finally {
    btnGuardar.disabled = false;
  }
});

btnConfirmarEliminar.addEventListener('click', async () => {
  if (!heroeSeleccionadoId) return;

  const url = `${API_URL}/${heroeSeleccionadoId}`;

  try {
    btnConfirmarEliminar.disabled = true;

    const respuesta = await fetch(url, { method: 'DELETE' });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}`);
    }

    modalEliminar.close();
    mostrarToast('Héroe eliminado correctamente.');
    heroeSeleccionadoId = null;
    await cargarDatos();
  } catch (error) {
    console.error('Error al eliminar héroe:', error);
    mostrarToast('No se pudo eliminar el héroe. Intenta de nuevo.', 'error');
  } finally {
    btnConfirmarEliminar.disabled = false;
  }
});
