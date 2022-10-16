const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {}

// let url = "https://quiet-semolina-fcaeb4.netlify.app/";
let url = "/";
document.getElementById('inicio').setAttribute('href', url);

// Eventos
// El evento DOMContentLoaded es disparado cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener('DOMContentLoaded', e => { 
    fetchDataProducts()
    fetchDataCategories()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
});
cards.addEventListener('click', e => { addCarrito(e) });
items.addEventListener('click', e => { btnAumentarDisminuir(e) })

// Traer productos
const fetchDataProducts = async () => {
    const res = await fetch(`/https://bsale-backend-laos.herokuapp.com/api/productos`);
    const data = await res.json()
    pintarCards(data)
}
// Traer productos por nombre
const fetchDataProductsByName = async (name) => {
    const res = await fetch(`/https://bsale-backend-laos.herokuapp.com/api/productos?name=${name}`);
    const data = await res.json()
    pintarCards(data)
}

// Traer productos por categoria
const fetchDataProductsByCategory = async (category) => {
    const res = await fetch(`/https://bsale-backend-laos.herokuapp.com/api/productos/${category}`);
    const data = await res.json()
    pintarCards(data)
}

// Traer Id de catergorias por nombre
const fetchCategoryIdByName = async (category) => {
    const res = await fetch(`/https://bsale-backend-laos.herokuapp.com/api/categorias/${category}`);
    const data = await res.json()
    return data.id;
}

let arrayCategories = [];
// Traer categorias
const fetchDataCategories = async () => {
    const res = await fetch(`/https://bsale-backend-laos.herokuapp.com/api/categorias`);
    const data = await res.json()
    pintarCategories(data)
    data.forEach(item => {
        arrayCategories.push(item);
    });
}

// Pintar productos
const pintarCards = data => {
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.name
        templateCard.querySelector('p').textContent = item.price
        templateCard.querySelector('button').dataset.id = item.id
        templateCard.querySelector('img').setAttribute('src', item.url_image)
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.replaceChildren(fragment)
}
// Pintar categorias
const pintarCategories = data => {
    let html = '';
    data.forEach(item => {
        html += `<li><a class="dropdown-item" id="dropItem${item.id}" href="${url}?category=${item.name}"  role="button">${item.name}</a></li>`;
        document.querySelector('.dropdown-menu').innerHTML = html;
    })
}

let urlParams = new URLSearchParams(window.location.search);
let category = urlParams.get('category');
if (category) {
    fetchCategoryIdByName(category).then((id) => {
        fetchDataProductsByCategory(id)
    });
}

// Agregar al carrito
const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}

const setCarrito = item => {
    const producto = {
        title: item.querySelector('h5').textContent,
        precio: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = { ...producto }
    
    pintarCarrito()
}

const pintarCarrito = () => {
    items.innerHTML = ''

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

const pintarFooter = () => {
    footer.innerHTML = ''
    
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `
        return
    }
    
    // sumar cantidad y sumar totales
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)

    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
    })

}

const btnAumentarDisminuir = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = {...producto}
        }
        pintarCarrito()
    }
    e.stopPropagation()
}