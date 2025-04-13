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
    editarElemento(id, 'gasto');; 

  }
  if(e.target.classList.contains('btn-eliminar')){
    eliminarElemento(id, 'gasto'); 
  }
})


listaExtra.addEventListener('click', (e) => {
  const id = e.target.getAttribute('data-id');
  if (e.target.classList.contains('btn-editar-extra')) {
    editarElemento(id, 'ingreso');
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

function validarPresupuesto(e){
  e.preventDefault()

  const input1 = parseFloat(inputPresupuesto.value.trim())

  if(isNaN(input1) || input1 <= 0){
    alerta('Ingrese un numero valido mayor a 0', form1, 'error'); 
    return
  }

  presupuestoInicial += input1; 
  dineroRestante += input1

  cantidadInicial.textContent = '$' + presupuestoInicial; 
  cantidadRestante.textContent = '$' + presupuestoInicial; 
  
  alerta('Agregado correctamente', form1, 'exito'); 

  dineroExtra.push({
    id: generarId(),
    cantidad: input1
  })

  mostrarExtras(dineroExtra); 
  guardarIngresosEnLocalStorage(); 

  inputPresupuesto.value = ''; 

  if(dineroRestante >= 0){
    form2.style.display = 'flex'; 

    const mensajeError = document.querySelector('.mensaje-error-gasto'); 
    if(mensajeError){
      mensajeError.remove(); 
    }
  }
}

function validarGasto(e){
  e.preventDefault()   

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
  }

  cantidadRestante.textContent = `$${dineroRestante}`;
  // cantidadInicial.textContent = `$${presupuestoInicial}`; 
  mostrarGastos(listaDeGastos); 
  guardarGastosEnLocalStorage(); 
  alerta('Guardado correctamente', form2, 'exito'); 



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

function sinDinero(){
  if(dineroRestante <= 0){
    const yaExiste = document.querySelector('.mensaje-error-gasto'); 
    
    if(!yaExiste){

      alerta('Excediste tu presupuesto', divRestante, 'error' )

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
  } 
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
    // Revertir el efecto del ingreso al presupuesto
    presupuestoInicial -= item.cantidad;
    dineroRestante -= item.cantidad;

    // Actualizar valores en pantalla
    cantidadInicial.textContent = `$${presupuestoInicial}`;
    cantidadRestante.textContent = `$${dineroRestante}`;

    // Quitar el ingreso del array y localStorage
    dineroExtra = dineroExtra.filter(el => el.id !== id);
    guardarIngresosEnLocalStorage();
    mostrarExtras(dineroExtra);

    // Colocar cantidad en input para re-editar
    inputPresupuesto.value = item.cantidad;
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
  } else if (tipo === 'ingreso') {
    // Buscar el ingreso a eliminar
    const ingreso = dineroExtra.find(item => item.id === id);
    if (!ingreso) return;

    // Al eliminar un ingreso, se reduce el presupuesto y el dinero restante
    presupuestoInicial -= ingreso.cantidad;
    dineroRestante -= ingreso.cantidad;

    cantidadInicial.textContent = `$${presupuestoInicial}`;
    cantidadRestante.textContent = `$${dineroRestante}`;

    // Eliminar el ingreso del array
    dineroExtra = dineroExtra.filter(item => item.id !== id);

    // Guardar cambios y actualizar DOM
    guardarIngresosEnLocalStorage();
    mostrarExtras(dineroExtra);

    alerta('Ingreso eliminado', listaExtra, 'exito');
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

