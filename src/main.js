import { alerta } from "./alerta.js";
import { mostrarGastos, mostrarExtras } from "./mostrarGastos.js";

const inputPresupuesto = document.querySelector('#presupuesto'); 
const form1 = document.querySelector('#form-1'); 
const form2 = document.querySelector('#form-2'); 
const inputNombreGasto = document.querySelector('#nombre-gasto');
const inputDineroGasto = document.querySelector('#dinero-gasto');
const cantidadInicial = document.querySelector('#cantidad-inicial');
const cantidadRestante = document.querySelector('#cantidad-restante');
const divRestante = document.querySelector('#div-restante'); 
const btnReiniciar = document.querySelector('#btn-reiniciar')
const listaGastos = document.querySelector('#lista-gastos'); 
const listaExtra = document.querySelector('#lista-extra'); 
const gastosRealizados = document.querySelector('#gastos-realizados')
const tituloDineroAgregado = document.querySelector('#dinero-agregado'); 

form1.addEventListener('submit', validarPresupuesto)
form2.addEventListener('submit', validarGasto)
btnReiniciar.addEventListener('click', reiniciarApp)

let presupuestoInicial = 0; 
let dineroRestante = 0; 
let listaDeGastos = []; 
let dineroExtra = []; 
let idEnEdicion = null

listaGastos.addEventListener('click', (e) => {
  const id = e.target.getAttribute('data-id'); 
  if(e.target.classList.contains('btn-editar')){
    editarElemento(id, 'gasto');
    // Scroll al formulario (ideal para móvil)
    form2.scrollIntoView({ behavior: 'smooth' });
    inputNombreGasto.focus(); 

  }
  if(e.target.classList.contains('btn-eliminar')){
    eliminarElemento(id, 'gasto'); 
  }
})


listaExtra.addEventListener('click', (e) => {
  const id = e.target.getAttribute('data-id');
  if (e.target.classList.contains('btn-editar-extra')) {
    editarElemento(id, 'ingreso');
    // Scroll al formulario (ideal para móvil)
    form1.scrollIntoView({ behavior: 'smooth' });
    inputPresupuesto.focus()
  }
  if (e.target.classList.contains('btn-eliminar-extra')) {
    eliminarElemento(id, 'ingreso'); 
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const gastosGuardados = JSON.parse(localStorage.getItem('gastos')) || []; 
  const ingresosGuardados = JSON.parse(localStorage.getItem('ingresos')) || []; 

  listaDeGastos = gastosGuardados; 
  dineroExtra = ingresosGuardados

  mostrarGastos(listaDeGastos); 
  mostrarExtras(dineroExtra); 

  // Calcular el total del presupuesto y el restante 
  presupuestoInicial = dineroExtra.reduce((acc, item) => acc + Number(item.cantidad), 0)
  //creamos una variable para restarlo a presupuesto inicial
  const totalGastado = listaDeGastos.reduce((acc, item) => acc + Number(item.cantidad), 0)
  dineroRestante = presupuestoInicial - totalGastado; 

  cantidadInicial.textContent = `$${presupuestoInicial}`; 
  cantidadRestante.textContent = `$${dineroRestante}`; 

  if(dineroRestante > 0){
    form2.style.display = 'flex'
  } 

})

function validarPresupuesto(e) {
  e.preventDefault();

  const input1 = parseFloat(inputPresupuesto.value.trim());

  if (isNaN(input1) || input1 <= 0) {
    alerta('Ingrese un número válido mayor a 0', form1, 'error');
    return;
  }

  if (idEnEdicion) {
    // Estamos editando un ingreso
    const ingreso = dineroExtra.find(i => i.id === idEnEdicion);
    if (!ingreso) return;

    const totalGastado = listaDeGastos.reduce((acc, item) => acc + Number(item.cantidad), 0);

    // Calcular el nuevo presupuesto simulado
    const presupuestoSinIngreso = presupuestoInicial - ingreso.cantidad;
    const nuevoPresupuesto = presupuestoSinIngreso + input1;

    if (nuevoPresupuesto < totalGastado) {
      alerta('No puedes disminuir este ingreso porque superas tus gastos actuales', form1, 'error');
      return;
    } 

    ingreso.cantidad = input1;

    presupuestoInicial = nuevoPresupuesto;
    dineroRestante = presupuestoInicial - totalGastado;

    cantidadInicial.textContent = `$${presupuestoInicial}`;
    cantidadRestante.textContent = `$${dineroRestante}`;

    guardarIngresosEnLocalStorage();
    alerta('Editado Correctamente', form1, 'exito')
    mostrarExtras(dineroExtra);

    sinDinero(); 

    const elementoEditado = document.querySelector(`#lista-extra [data-id="${idEnEdicion}"]`);
    if (elementoEditado) {
      requestAnimationFrame(() => {
        elementoEditado.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elementoEditado.classList.add('resaltado');
        setTimeout(() => {
          elementoEditado.classList.remove('resaltado');
        }, 1000);
      });
    }
    

    idEnEdicion = null;
    const btn = document.querySelector('#btn-submit-ingreso') || form1.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Calcular';

  } else {
    // Nuevo ingreso
    presupuestoInicial += input1;
    const totalGastado = listaDeGastos.reduce((acc, item) => acc + Number(item.cantidad), 0);
    dineroRestante = presupuestoInicial - totalGastado;

    dineroExtra.push({
      id: generarId(),
      cantidad: input1
    });

    guardarIngresosEnLocalStorage();
    alerta('Agregado correctamente', form1, 'exito')
    mostrarExtras(dineroExtra);

    // Scroll al último ingreso agregado
    setTimeout(() => {
      const ultimoIngreso = document.querySelector(`#lista-extra [data-id="${dineroExtra[dineroExtra.length - 1].id}"]`);
      if (ultimoIngreso) {
        ultimoIngreso.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ultimoIngreso.classList.add('resaltado');
        setTimeout(() => {
          ultimoIngreso.classList.remove('resaltado');
        }, 1000);
      }
    }, 100);

  }

  cantidadInicial.textContent = `$${presupuestoInicial}`;
  cantidadRestante.textContent = `$${dineroRestante}`;

  inputPresupuesto.value = '';

  if (dineroRestante >= 0) {
    form2.style.display = 'flex';
    const mensajeError = document.querySelector('.mensaje-error-gasto');
    if (mensajeError) mensajeError.remove();
  }

  sinDinero()
}


function validarGasto(e){
  e.preventDefault()   

  if(dineroExtra.length <= 0){
    form2.style.display = 'none'
    alerta('Primero ingresa tu presupuesto', form1, 'error')
    return
  } else {
    form2.style.display = 'flex'

  }

  const input1 = inputNombreGasto.value.trim(); 
  const input2 = parseFloat(inputDineroGasto.value.trim()); 

  if(input1 === '' || input2 <= 0 || isNaN(input2)){
    alerta('Campos de gasto incompletos o invalido', form2, 'error'); 
    return
  }

  if(idEnEdicion){
    const gasto = listaDeGastos.find(g => g.id === idEnEdicion); 

    if(gasto){

      const disponible = dineroRestante + gasto.cantidad;

      if (input2 > disponible) {
        alerta('El gasto excede tu dinero restante', form2, 'error');
        return;
      }

      dineroRestante += gasto.cantidad //regreso el dinero del gasto anterior
      dineroRestante -= input2 //le restamos el nuevo valor
      
      gasto.nombre = input1; 
      gasto.cantidad = input2; 
      
      guardarGastosEnLocalStorage(); 
      mostrarGastos(listaDeGastos);

      setTimeout(() => {
        const elementoEditado = document.querySelector(`#lista-gastos [data-id="${idEnEdicion}"]`);
        if (elementoEditado) {
          elementoEditado.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elementoEditado.classList.add('resaltado');
          setTimeout(() => {
            elementoEditado.classList.remove('resaltado');
          }, 1000);
        }
      }, 100);
    }

    idEnEdicion = null; 
    document.querySelector('#btn-submit').textContent = 'Calcular';

  } else {
    //nuevo gasto
    dineroRestante -= input2; 

    listaDeGastos.push({
      nombre: input1,
      cantidad: input2,
      id: generarId()
    })

    sinDinero(); 
  }

  cantidadRestante.textContent = `$${dineroRestante}`;
  // cantidadInicial.textContent = `$${presupuestoInicial}`; 
  mostrarGastos(listaDeGastos); 
  guardarGastosEnLocalStorage(); 
  alerta('Guardado correctamente', form2, 'exito'); 

  // Scroll al último gasto agregado
  setTimeout(() => {
    const ultimoGasto = document.querySelector(`#lista-gastos [data-id="${listaDeGastos[listaDeGastos.length - 1].id}"]`);
    if (ultimoGasto) {
      ultimoGasto.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ultimoGasto.classList.add('resaltado');
      setTimeout(() => {
        ultimoGasto.classList.remove('resaltado');
      }, 1000);
    }
  }, 100);



  inputNombreGasto.value = ''; 
  inputDineroGasto.value = ''; 


  sinDinero(); 
}


function guardarGastosEnLocalStorage(){
  localStorage.setItem('gastos', JSON.stringify(listaDeGastos)); 
}

function guardarIngresosEnLocalStorage() {
  localStorage.setItem('ingresos', JSON.stringify(dineroExtra));
}

function editarElemento(id, tipo) {
  const lista = tipo === 'gasto' ? listaDeGastos : dineroExtra;
  const item = lista.find(el => el.id === id);
  if (!item) return;

  if (tipo === 'gasto') {
    // Mostrar formulario de edición de gasto
    form2.style.display = 'flex';

    // Ocultar alerta si existe
    const alertaError = document.querySelector('.mensaje-error-gasto');
    if (alertaError) alertaError.remove();

    // Llenar inputs con el gasto
    inputNombreGasto.value = item.nombre;
    inputDineroGasto.value = item.cantidad;

    // Guardar ID en edición
    idEnEdicion = id;

    // Cambiar el texto del botón
    const btn = document.querySelector('#btn-submit');
    btn.textContent = 'Guardar Cambios';

  } else if (tipo === 'ingreso') {
    // Llenar el input con el valor actual del ingreso
    inputPresupuesto.value = item.cantidad;

    // Guardar ID del ingreso en edición
    idEnEdicion = id;

    // Cambiar texto del botón
    const btn = document.querySelector('#btn-submit-ingreso') || form1.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Guardar Cambios';
  }

}


function eliminarElemento(id, tipo) {
  if (tipo === 'gasto') {
    // Buscar el gasto a eliminar
    const gasto = listaDeGastos.find(g => g.id === id);
    if (!gasto) return;

    // Al eliminar un gasto, recuperas el dinero que se había restado
    dineroRestante += gasto.cantidad;
    cantidadRestante.textContent = `$${dineroRestante}`;

    // Eliminar el gasto del array
    listaDeGastos = listaDeGastos.filter(g => g.id !== id);

    // Guardar cambios y actualizar DOM
    guardarGastosEnLocalStorage();
    mostrarGastos(listaDeGastos);

    // Mostrar alerta (se usa un contenedor de alertas, por ejemplo, "gastosRealizados")
    alerta('Gasto eliminado', gastosRealizados, 'exito');

    // Si después de eliminar hay dinero suficiente, se muestra el formulario de gasto
    if (dineroRestante > 0) {
      form2.style.display = 'flex';
      const mensajeError = document.querySelector('.mensaje-error-gasto');
      if (mensajeError) {
        mensajeError.remove();
      }
    }

    sinDinero();

  } else if (tipo === 'ingreso') {

    // Buscar el ingreso a eliminar
    const ingreso = dineroExtra.find(item => item.id === id);
    if (!ingreso) return;

    const totalGastado = listaDeGastos.reduce((acc, item) => acc + Number(item.cantidad), 0);
    const nuevoPresupuesto = presupuestoInicial - ingreso.cantidad;
    
    if (nuevoPresupuesto < totalGastado) {
      alerta('No puedes eliminar este ingreso, supera los gastos actuales', listaExtra, 'error');
      return;
    }
    
    presupuestoInicial = nuevoPresupuesto;
    dineroRestante = presupuestoInicial - totalGastado;
    

    cantidadInicial.textContent = `$${presupuestoInicial}`;
    cantidadRestante.textContent = `$${dineroRestante}`;

    sinDinero(); 

    // Eliminar el ingreso del array
    dineroExtra = dineroExtra.filter(item => item.id !== id);

    // Guardar cambios y actualizar DOM
    guardarIngresosEnLocalStorage();
    mostrarExtras(dineroExtra);

    alerta('Ingreso eliminado', tituloDineroAgregado, 'exito');
  }
} 

function generarId(){
  return Math.random().toString(36).substring(2) + Date.now(); 
}

function reiniciarApp(){
  localStorage.removeItem('gastos');
  localStorage.removeItem('ingresos');
  location.reload();
}

function sinDinero(){
  if(listaDeGastos.length >= 1 && dineroExtra.length >= 1){

    if(dineroRestante <= 0 || dineroRestante === 0){
      const yaExiste = document.querySelector('.mensaje-error-gasto'); 
      
      if(!yaExiste){
        
        const div = document.createElement('div'); 
        div.classList.add('bg-red-500', 'border-red-800', 'px-2', 'rounded', 'my-2', 'mensaje-error-gasto');
        
        const p = document.createElement('p')
        p.classList.add( 'text-white', 'text-center')
        p.textContent = 'No puedes gastar mas dinero, aumenta tu presupuesto'; 
        
        div.appendChild(p); 
        divRestante.appendChild(div); 
      }
      
      //Ocultamos el formulario
      form2.style.display = 'none'; 
      alerta('Excediste tu presupuesto', divRestante, 'error' )
    } 
  }

}