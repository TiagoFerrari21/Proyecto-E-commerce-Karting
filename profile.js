import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env.js';
import { ICON_CHECK, ICON_CART } from './icons.js';
import { toast, toastError } from './general.js';



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

    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        const editForm = document.getElementById('edit-product-form');
        editForm.classList.add('hidden'); // Oculta el formulario
        editForm.reset(); // Limpia los campos del formulario
    });

    async function updateProductInAirtable(productId, updatedProduct) {
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${productId}`;

        try {
            const response = await fetch(airtableUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        Name: updatedProduct.name,
                        Price: updatedProduct.price,
                        Category: updatedProduct.category,
                        img: updatedProduct.img,
                        Stock: updatedProduct.stock,
                        detail: updatedProduct.detail
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el producto.');
            }

            const data = await response.json();
            console.log('Producto actualizado:', data);
        } catch (error) {
            console.error('Error en la solicitud PATCH:', error);
            throw error;
        }
    }

    const editForm = document.getElementById('edit-product-form');
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = editForm.getAttribute('data-product-id'); // Obtener el ID del producto
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            category: document.getElementById('edit-product-category').value,
            img: document.getElementById('edit-product-img').value,
            stock: parseInt(document.getElementById('edit-product-stock').value, 10),
            detail: document.getElementById('edit-product-detail').value
        };

        try {
            await updateProductInAirtable(productId, updatedProduct);
            toast('Producto actualizado exitosamente.');
            editForm.reset(); // Limpiar el formulario
            editForm.classList.add('hidden'); // Ocultar el formulario
            getProductsFromAirtable(); // Actualizar la lista de productos
        } catch (error) {
            console.error('Error actualizando producto:', error);
            toastError('Error al actualizar el producto.');
        }
    });

    function openEditForm(product) {
        const editForm = document.getElementById('edit-product-form');
        editForm.classList.remove('hidden'); // Mostrar el formulario

        // Precargar los datos del producto en el formulario
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-category').value = product.category;
        document.getElementById('edit-product-img').value = product.img;
        document.getElementById('edit-product-stock').value = product.stock;
        document.getElementById('edit-product-detail').value = product.detail;

        // Guardar el ID del producto en un atributo del formulario
        editForm.setAttribute('data-product-id', product.id);
    }

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
            toast('Producto agregado exitosamente.');
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

        // Botón para editar
        const buttonEdit = document.createElement('button');
        buttonEdit.innerText = "EDITAR";
        buttonEdit.className = "button-editar";
        buttonEdit.addEventListener('click', () => {
            openEditForm(product); // Abre el formulario de edición con los datos del producto
        });

        newDiv.append(newImg, newPName, newPPrice);
        newAnchor.appendChild(newDiv);
        newProduct.appendChild(newAnchor);
        newProduct.append(buttonAddToCart, buttonEdit);
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
                category: item.fields.Category,
                stock: item.fields.Stock,
                detail: item.fields.detail
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
                toastError('Producto eliminado exitosamente.');
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









