import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js';
import { ICON_CHECK, ICON_CART } from './icons.js';



document.addEventListener('DOMContentLoaded', () => {

    const productsDomElements = document.querySelector('.products-container');
    const inputSearch = document.getElementById('input-search-products');
    const categoryLinks = document.querySelectorAll('.category-product-filter');
    const toggleFormButton = document.getElementById('toggle-form-button');
    const addProductForm = document.getElementById('add-product-form');

    toggleFormButton.addEventListener('click', () => {
        // Verificar si el formulario está visible
        if (addProductForm.style.display === 'none' || !addProductForm.style.display) {
            addProductForm.style.display = 'flex'; // Mostrar el formulario
            addProductForm.style.flexDirection = 'column'; // Asegurar que sea columna
            toggleFormButton.innerText = 'Cerrar Formulario';
        } else {
            addProductForm.style.display = 'none'; // Ocultar el formulario
            toggleFormButton.innerText = 'Agregar Producto';
        }
    });

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const product = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            img: document.getElementById('product-img').value,
            stock: parseInt(document.getElementById('product-stock').value, 10),
            detail: document.getElementById('product-detail').value
        };

        try {
            await addProductToAirtable(product);
            alert('Producto agregado exitosamente.');
            addProductForm.reset(); // Limpiar el formulario
            addProductForm.style.display = 'none'; // Ocultar el formulario después de agregar
            toggleFormButton.innerText = 'Agregar Producto'; // Cambiar el texto del botón
        } catch (error) {
            console.error('Error agregando producto:', error);
            alert('Hubo un error al agregar el producto.');
        }
    });

    async function addProductToAirtable(product) {
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

        try {
            const response = await fetch(airtableUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        Name: product.name,
                        Price: product.price,
                        Category: product.category,
                        img: product.img,
                        Stock: product.stock,
                        detail: product.detail
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Producto agregado:', data);
                // Actualiza la lista de productos después de agregar
                getProductsFromAirtable();
            } else {
                console.error('Error agregando producto:', await response.json());
            }
        } catch (error) {
            console.error('Error en la solicitud POST:', error);
        }
    }

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
        buttonAddToCart.innerText = "ELIMINAR";
        buttonAddToCart.className = "button-eliminar";
        buttonAddToCart.addEventListener('click', (e) => {
            deleteProductFromAirtable(product.id);
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

    async function deleteProductFromAirtable(productId) {
        const airtableToken = AIRTABLE_TOKEN;
        const baseId = AIRTABLE_BASE_ID;
        const tableName = AIRTABLE_TABLE_NAME;
        const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

        try {
            const response = await fetch(`${airtableUrl}?records[]=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${airtableToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Producto eliminado:', productId);
                // Actualiza la lista de productos después de eliminar
                getProductsFromAirtable();
            } else {
                console.error('Error eliminando producto:', await response.json());
            }
        } catch (error) {
            console.error('Error en la solicitud DELETE:', error);
        }
    }

    getProductsFromAirtable();
    updateCartCount();

});









