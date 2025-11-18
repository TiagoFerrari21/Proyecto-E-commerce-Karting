import { ICON_CHECK, ICON_ERROR} from './icons.js';


document.addEventListener('DOMContentLoaded', () => {

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
})

function updateCartCount() {
    // 1. Obtener los ítems del carrito (asumiendo que esta lógica es global o se repite)
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 2. Calcular el total de ítems
    const totalItemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    
    // 3. Actualizar el elemento en el HTML
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        cartCountElement.innerText = totalItemsCount;
        // Mostrar u ocultar el contador si es 0
        cartCountElement.style.display = totalItemsCount > 0 ? 'block' : 'none';
    }
}

export function toast(mensaje) {
        const toastContainer = document.getElementById('toast-container');
        const newToast = document.createElement('div');
        newToast.id = 'toast-exito'; 
        newToast.innerHTML = `
            ${ICON_CHECK || '✅'}
            <div>${mensaje}</div>`;
    
        toastContainer.appendChild(newToast);
        newToast.style.display = 'flex';

        setTimeout(() => {
          newToast.style.display = 'none';
          setTimeout(() => {
              document.toastContainer.removeChild(newToast);
          }, 3000); 
      }, 3000);
    }

export function toastError(mensaje) {
        const toastContainer = document.getElementById('toast-container');
        const newToast = document.createElement('div');
        newToast.id = 'toast-error'; 
        newToast.innerHTML = `
            ${ICON_ERROR || '✅'}
            <div>${mensaje}</div>`;
    
        toastContainer.appendChild(newToast);
        newToast.style.display = 'flex';

        setTimeout(() => {
          newToast.style.display = 'none';
          setTimeout(() => {
              document.toastContainer.removeChild(newToast);
          }, 3000); 
      }, 3000);
    }