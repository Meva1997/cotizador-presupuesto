const listaGastos = document.querySelector('#lista-gastos'); 

export function mostrarGastos(lista){
    listaGastos.innerHTML = ''; // Limpiamos antes de mostrar

    if(lista.length === 0){
        const p = document.createElement('p')
        p.classList.add('text-center', 'my-3', 'text-gray-300')
        p.textContent = 'No hay gastos agregados'
        listaGastos.appendChild(p)
        return; 
    }

    lista.forEach(({ cantidad, nombre, id }) => {
        const div = document.createElement('div'); 
        div.classList.add('bg-gray-200', 'text-white', 'p-2', 'rounded', 'my-2', 'mostrarGastos-div');

        const p1 = document.createElement('p');
        p1.innerHTML = `<span class="font-bold text-xl text-black">Nombre del gasto:</span> <span class="text-black">${nombre}</span>`;

        const p2 = document.createElement('p');
        p2.innerHTML = `<span class="text-red-600 font-semibold">Monto: $${cantidad}</span>`;

        const btnEditar = document.createElement('button')
        btnEditar.classList.add('px-2', 'bg-blue-500', 'border-blue-800', 'rounded', 'text-white', 'transition', 'btn-editar', 'mr-2', 'hover:cursor-pointer', 'hover:bg-blue-700');
        btnEditar.textContent = `Editar` 
        btnEditar.dataset.id = id; 
        
        const btnEliminar = document.createElement('button')
        btnEliminar.classList.add('px-2', 'bg-red-500', 'border-red-800', 'rounded', 'text-white', 'transition', 'btn-eliminar', 'hover:cursor-pointer', 'hover:bg-red-700');
        btnEliminar.textContent = `Eliminar` 
        btnEliminar.dataset.id = id; 

        div.appendChild(p1);
        div.appendChild(p2);
        div.appendChild(btnEditar); 
        div.appendChild(btnEliminar);
        listaGastos.appendChild(div);
    });
}

const listaExtra = document.querySelector('#lista-extra'); 

export function mostrarExtras(lista){
    listaExtra.innerHTML = ''; 

    if(lista.length === 0){
        const p = document.createElement('p')
        p.classList.add('text-center', 'my-3', 'text-gray-300')
        p.textContent = 'No hay ingresos agregados'
        listaExtra.appendChild(p)
        return; 
    }

    lista.forEach(({cantidad, id}, index) => {
        const div = document.createElement('div'); 
        div.classList.add('bg-gray-200', 'text-white', 'p-2', 'rounded', 'my-2', 'mostrarExtras-div');

        const p = document.createElement('p');
        p.innerHTML = `<span class="font-bold text-lg text-black">${index === 0 ? 'Primer ingreso' : 'Ingreso Extra'}:</span> <span class="text-black">$${cantidad}</span>`;

        const btnEditar = document.createElement('button')
        btnEditar.classList.add('px-2', 'bg-blue-500', 'border-blue-800', 'rounded', 'text-white', 'transition', 'btn-editar-extra', 'mr-2', 'hover:cursor-pointer', 'hover:bg-blue-700');
        btnEditar.textContent = `Editar` 
        btnEditar.dataset.id = id; 
        
        const btnEliminar = document.createElement('button')
        btnEliminar.classList.add('px-2', 'bg-red-500', 'border-red-800', 'rounded', 'text-white', 'transition', 'btn-eliminar-extra', 'hover:cursor-pointer', 'hover:bg-red-700');
        btnEliminar.textContent = `Eliminar` 
        btnEliminar.dataset.id = id; 
        
        div.appendChild(p);
        div.appendChild(btnEditar); 
        div.appendChild(btnEliminar);
        listaExtra.appendChild(div);
    });  
}