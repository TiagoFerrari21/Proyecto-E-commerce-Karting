import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js'; 

document.addEventListener('DOMContentLoaded', () => {
  // dom elements
  const productsDomElements = document.querySelector('.products-container');
  const inputSearch = document.getElementById('input-search-products');
  const categoryLinks = document.querySelectorAll('.category-product-filter');


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
//     currentFilters.text = event.target.value.toLowerCase();
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
      e.preventDefault();
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      const toast = document.getElementById('toast-carrito');
      toast.style.display = 'flex';
      toast.innerHTML = `
        ${ICON_CHECK}
        <div>${product.name} agregado al carrito</div>`;
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    });

    newDiv.append(newImg, newPName, newPPrice);
    newAnchor.appendChild(newDiv);
    newProduct.appendChild(newAnchor);
    newProduct.appendChild(buttonAddToCart);
    return newProduct;
  }

  function filterProducts() {
    return listProducts.filter(product =>
      product.name.toLowerCase().includes(currentFilters.text) &&
      (currentFilters.category === '' || product.category.toLowerCase() === currentFilters.category)
    );
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
});