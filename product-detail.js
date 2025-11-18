import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js';
import { ICON_CHECK } from './icons.js';
import { updateCartCount } from './general.js';


document.addEventListener('DOMContentLoaded', () => {

    const airtableToken = AIRTABLE_TOKEN;
    const baseId = AIRTABLE_BASE_ID;
    const tableName = AIRTABLE_TABLE_NAME;



    //funciones

    function normalizeProductKeys(product) {
        const normalizedProduct = {};
        Object.keys(product).forEach(key => {
            normalizedProduct[key.toLowerCase()] = product[key];
        });
        return normalizedProduct;
    }

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
            return { ...productRecord.fields, id: productRecord.id };
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
        console.log('Producto renderizado:', product); // Verifica que el objeto tenga el campo 'id'

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


    function addtoCart(elemento, product) {
        elemento.preventDefault();

        // Normalizar las claves del producto
        const normalizedProduct = normalizeProductKeys(product);
        console.log('Producto normalizado:', normalizedProduct);

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Carrito antes de actualizar:', cart);

        const existingProductIndex = cart.findIndex(item => item.id === normalizedProduct.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ ...normalizedProduct, quantity: 1 });
        }

        console.log('Carrito después de actualizar:', cart);

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Carrito guardado en localStorage:', JSON.parse(localStorage.getItem('cart')));

        // Crear el Toast
        const toastContainer = document.getElementById('toast-container');
        const newToast = document.createElement('div');
        newToast.id = 'toast-exito';
        newToast.innerHTML = `
        ${ICON_CHECK || '✅'}
        <div>${normalizedProduct.name} agregado al carrito</div>`;

        toastContainer.appendChild(newToast);
        newToast.style.display = 'flex';

        setTimeout(() => {
            newToast.style.display = 'none';
            setTimeout(() => {
                toastContainer.removeChild(newToast);
            }, 3000);
        }, 3000);

    }


})