document.addEventListener('DOMContentLoaded', () => {

    function updateCartTotal(products) {
        const totalPriceElement = document.querySelector('.total-price');
        // El price de Airtable suele ser string, lo convertimos a número antes de operar
        const total = products.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        if (totalPriceElement) {
            totalPriceElement.textContent = total.toFixed(2);
        }
    }

    function assignEventListeners() {
        // Asignar listeners a botones de AUMENTAR (+)
        document.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                handleQuantityChange(productId, 1);
            });
        });

        // Asignar listeners a botones de DISMINUIR (-)
        document.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                handleQuantityChange(productId, -1);
            });
        });

        // Asignar listeners a botones de ELIMINAR
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                removeItem(productId);
            });
        });
    }

    function createProductCartItem(product) {
        const newItem = document.createElement('div');
        newItem.className = "cart-item";

        const newAnchorImg = document.createElement('a');
        newAnchorImg.href = `./product-detail.html?code=${encodeURIComponent(product.id)}`;
        newAnchorImg.className = "item-link-image";

        const newImg = document.createElement('img');
        newImg.src = product.img;
        newImg.alt = product.name;
        newImg.className = "cart-item-image";

        const newAnchorDetails = document.createElement('a');
        newAnchorDetails.href = `./product-detail.html?code=${encodeURIComponent(product.id)}`;
        newAnchorDetails.className = "item-link-details";

        const newDetails = document.createElement('div');
        newDetails.className = "cart-item-details";

        const newTitle = document.createElement('h3');
        newTitle.innerText = product.name;

        const newPrice = document.createElement('p');
        newPrice.innerText = `Precio: $${product.price}`;

        const newCartItemActions = document.createElement('div');
        newCartItemActions.className = "cart-item-actions";

        const newQuantityItemsControls = document.createElement('div');
        newQuantityItemsControls.className = "quantity-controls";

        const newQuantityDecreaseButton = document.createElement('button');
        newQuantityDecreaseButton.className = "cantidad-btn quantity-decrease";
        newQuantityDecreaseButton.setAttribute('data-id', product.id);
        newQuantityDecreaseButton.innerText = "-";

        const newQuantityValue = document.createElement('span');
        newQuantityValue.className = "item-quantity";
        newQuantityValue.innerText = product.quantity;

        const newQuantityIncreaseButton = document.createElement('button');
        newQuantityIncreaseButton.className = "cantidad-btn quantity-increase";
        newQuantityIncreaseButton.setAttribute('data-id', product.id);
        newQuantityIncreaseButton.innerText = "+";

        const newRemoveButton = document.createElement('button');
        newRemoveButton.className = "remove-item";
        newRemoveButton.setAttribute('data-id', product.id);
        newRemoveButton.innerText = "Eliminar";

        newQuantityItemsControls.append(newQuantityDecreaseButton, newQuantityValue, newQuantityIncreaseButton);
        newCartItemActions.append(newQuantityItemsControls, newRemoveButton);
        newDetails.append(newTitle, newPrice);
        newAnchorImg.appendChild(newImg);
        newAnchorDetails.appendChild(newDetails);
        newItem.append(newAnchorImg, newAnchorDetails, newCartItemActions);
        
        return newItem;
    }

    function getCartItemsFromStorage() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        return cart;
    }

    function renderCartItems(products) {
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';
        products.forEach(product => {
            cartItemsContainer.appendChild(createProductCartItem(product));
        });

        updateCartTotal(products);    
        assignEventListeners();

    }
    
    renderCartItems(getCartItemsFromStorage());

        
    function handleQuantityChange(productId, change) {
            let cart = getCartItemsFromStorage();
            const index = cart.findIndex(item => item.id === productId);

            if (index > -1) {
                cart[index].quantity += change;

                // Si la cantidad llega a 0 o menos, elimina el producto
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
                
                saveCart(cart);
                renderCartItems(cart); // Volver a dibujar el carrito
                // Asumiendo que la función updateCartTotal se llama dentro de renderCartItems
            }
            
            updateCartCount();
        }

    function removeItem(productId) {
            let cart = getCartItemsFromStorage();
            
            // Filtrar y crear un nuevo array sin el producto a eliminar
            cart = cart.filter(item => item.id !== productId);
            
            saveCart(cart);
            renderCartItems(cart); // Volver a dibujar el carrito
        }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
})
