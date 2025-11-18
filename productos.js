import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js';
import { ICON_CHECK, ICON_CART } from './icons.js';

document.addEventListener('DOMContentLoaded', () => {
  // dom elements
  const productsDomElements = document.querySelector('.products-container');
  const inputSearch = document.getElementById('input-search-products');
  const categoryLinks = document.querySelectorAll('#categorias-dropdown a');
  const orderLinks = document.querySelectorAll('#ordenar-dropdown a');

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalItemsCount = cart.reduce((sum, item) => {
      // Aseguramos que item.quantity sea un número, por si acaso
      const quantity = Number(item.quantity) || 0;
      return Number(sum) + quantity;
    }, 0);

    if (totalItemsCount > 0) {
      const cartCountElement = document.getElementById('cart-count');
      cartCountElement.innerText = totalItemsCount;
      cartCountElement.style.display = 'block';
    }
  }
  // airtable config
  const airtableToken = AIRTABLE_TOKEN;
  const baseId = AIRTABLE_BASE_ID;
  const tableName = AIRTABLE_TABLE_NAME;
  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

  // estado global
  let listProducts = [];
  const currentFilters = { text: '', category: '' };

  // eventos
  inputSearch.addEventListener('keyup', (event) => {
    currentFilters.text = event.target.value.toLowerCase();
    renderProducts(filterProducts());
  });


  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const category = event.target.innerText.toLowerCase();
      currentFilters.category = (currentFilters.category === category) ? '' : category;
      renderProducts(filterProducts());
    });
  });

  orderLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const orderType = event.target.innerText.includes('Bajo a Alto') ? 'low-to-high' : 'high-to-low';
            currentFilters.order = orderType;
            renderProducts(filterProducts());
        });
    });


  // funciones
  function createProduct(product) {
    const newProduct = document.createElement('div');
    newProduct.className = "product-item";

    const newAnchor = document.createElement('a');
    newAnchor.href = `./product-detail.html?code=${encodeURIComponent(product.id)}`;

    const newDiv = document.createElement('div');
    newDiv.className = "product-card";

    const newImg = document.createElement('img');
    newImg.src = product.img;
    newImg.alt = product.Name;

    const newPName = document.createElement('p');
    newPName.className = "product-name";
    newPName.innerText = product.name;

    const newPPrice = document.createElement('p');
    newPPrice.className = "product-price";
    newPPrice.innerText = `Precio: $${product.price}.00`;


    const buttonAddToCart = document.createElement('button');
    buttonAddToCart.innerText = "Agregar al carrito";
    buttonAddToCart.className = "button-product";
    buttonAddToCart.addEventListener('click', (e) => {
      addtoCart(e, product);
      updateCartCount();
    });

    newDiv.append(newImg, newPName, newPPrice);
    newAnchor.appendChild(newDiv);
    newProduct.appendChild(newAnchor);
    newProduct.appendChild(buttonAddToCart);
    return newProduct;
  }

  function filterProducts() {
    let filteredProducts = listProducts.filter(product =>
      product.name.toLowerCase().includes(currentFilters.text) &&
      (currentFilters.category === '' || product.category.toLowerCase() === currentFilters.category)
    );

    if (currentFilters.order === 'low-to-high') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentFilters.order === 'high-to-low') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    return filteredProducts;

  }


  function renderProducts(products) {
    productsDomElements.innerHTML = '';
    products.forEach(product => {
      productsDomElements.appendChild(createProduct(product));
    });
  }

  // obtener productos de Airtable
  async function getProductsFromAirtable() {
    try {
      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Airtable data:', data);
      listProducts = data.records.map(item => ({
        id: item.id,
        name: item.fields.Name,
        price: item.fields.Price,
        img: item.fields.img,
        category: item.fields.Category
      }));
      renderProducts(listProducts);
    } catch (error) {
      console.error('Error fetching products from Airtable:', error);
    }
  }

  getProductsFromAirtable();
  updateCartCount();
});

function addtoCart(elemento, product) {

  elemento.preventDefault();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProductIndex = cart.findIndex(item => item.id === product.id);



  if (existingProductIndex > -1) {
    // 2. Si existe (índice >= 0), incrementamos la cantidad
    cart[existingProductIndex].quantity += 1;

    // El producto en el carrito debe tener la propiedad `quantity` inicializada.
    // Si no la tiene, debemos asegurarnos de inicializarla en 1 si es la primera vez que se añade.
  } else {
    // 3. Si no existe, lo añadimos con cantidad inicial de 1.
    // Usamos el spread operator ({...product}) para no modificar el objeto original `product`.
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  // 1. Crear el Toast
  const toastContainer = document.getElementById('toast-container');
  const newToast = document.createElement('div');
  newToast.id = 'toast-exito';
  newToast.innerHTML = `
      ${ICON_CHECK || '✅'}
      <div>${product.name} agregado al carrito</div>`;

  // 2. Añadir el Toast al DOM (lo mejor es al <body> o a un contenedor fijo)
  toastContainer.appendChild(newToast);
  newToast.style.display = 'flex';


  // 4. Ocultar el Toast después de unos segundos y eliminarlo del DOM
  setTimeout(() => {
    newToast.style.display = 'none';
    setTimeout(() => {
      document.toastContainer.removeChild(newToast);
    }, 3000);
  }, 3000);
}
