import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js'; 
import { ICON_CHECK, ICON_CART } from './icons.js';

document.addEventListener('DOMContentLoaded', () => {

    const airtableToken = AIRTABLE_TOKEN;
    const baseId = AIRTABLE_BASE_ID;
    const tableName = AIRTABLE_TABLE_NAME;



    //funciones


    async function fetchProductById(productId) {
        const filterFormula = `(RECORD_ID() = '${productId}')`;
        const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(filterFormula)}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${airtableToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        const productRecord = data.records[0];

        // Devolver solo el objeto 'fields' si se encontró el registro.
        if (productRecord && productRecord.fields) {
            return productRecord.fields;
        } else {
            throw new Error("Producto no encontrado.");
        }
    }

    async function loadProductDetails() {
        const productId = getProductIdFromUrl();
        const container = document.querySelector('.product-detail'); // Contenedor para mensajes de error
        
        if (!productId) {
            if (container) container.innerHTML = '<h2>Error: Producto no especificado.</h2>';
            return;
        }

        try {
            const productData = await fetchProductById(productId); 
            
            renderProduct(productData);

        } catch (error) {
            console.error("Error al cargar detalles del producto:", error);
            if (container) container.innerHTML = `<h2>Error de carga. Inténtalo de nuevo.</h2>`;
        }
    }

    





    /// Utilidades ///







    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('code'); 
    }

    
    
    function renderProduct(product) {

        const newPageContent = document.querySelector('.page-content');

        const newProductDetail = document.createElement('div');
        newProductDetail.className = "product-detail";

        const newProductDetailTop = document.createElement('div');
        newProductDetailTop.className = "product-detail-top";

        const newImgContainer = document.createElement('div');
        newImgContainer.className = "image-container";

        const newImg = document.createElement('img');
        newImg.src = product.img;
        newImg.className = "product-image";
        
        const newPrecioPagos = document.createElement('div');
        newPrecioPagos.className = "precio-pagos";
        newPrecioPagos.innerHTML = `<h3>${product.Name}</h2> <p class="product-price">$${product.Price}</p>`

        const newAgregarCarritoBtn = document.createElement('button');
        newAgregarCarritoBtn.className = "button-product";
        newAgregarCarritoBtn.textContent = "Agregar al Carrito";
        newAgregarCarritoBtn.addEventListener('click', (e) => {
            addtoCart(e, product);
            updateCartCount();
        });

        const newProductInfo = document.createElement('div');
        newProductInfo.className = "product-info";
        newProductInfo.innerHTML = `
            <h3> Descripcion</h3>
            <p class="product-description">${product.detail}</p>
        `;
        newPrecioPagos.appendChild(newAgregarCarritoBtn);
        newImgContainer.appendChild(newImg);
        newProductDetailTop.append(newImgContainer, newPrecioPagos);
        newProductDetail.append(newProductDetailTop);
        newPageContent.append(newProductDetail, newProductInfo);

        return newPageContent;
    }

    loadProductDetails();

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para obtener el carrito de localStorage
    function getCartItemsFromStorage() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return cart;
    }

    function addtoCart(elemento, product){
    
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
          <div>${product.Name} agregado al carrito</div>`;
    
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


})