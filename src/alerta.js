

export function alerta(msg, referencia, tipo = 'error'){

  // Elimina cualquier alerta previa dentro del contenedor
  const alertaPrevia = referencia.querySelector('.alerta-error, .alerta-exito');
  if (alertaPrevia) {
    alertaPrevia.remove();
  }

  const alerta = document.createElement('div'); 

  // Agregar clases comunes
  alerta.classList.add('px-2', 'rounded', 'my-2', 'text-white', 'text-center');

  if(tipo === 'error'){
    alerta.classList.add('bg-red-500', 'border-red-800', 'alerta-error'); 

  } else if(tipo === 'exito'){
    alerta.classList.add('bg-green-500', 'border-green-800', 'alerta-exito')
  }


  alerta.textContent = msg; 
  referencia.appendChild(alerta); 

  setTimeout(() => {
    alerta.remove(); 
  }, 1500);
}