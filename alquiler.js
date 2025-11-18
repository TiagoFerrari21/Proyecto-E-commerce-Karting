import { AIRTABLE_TOKEN, AIRTABLE_BASE_ID} from './env.js';
import { ICON_CHECK } from './icons.js';
const AIRTABLE_TABLE_NAME = "Alquiler";

document.addEventListener('DOMContentLoaded', () => {

    const alquilerForm = document.getElementById('alquiler-form');

    alquilerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = {
            name: document.getElementById('nombre').value,
            mail: document.getElementById('email').value,
            date: document.getElementById('fecha').value,
            hour: document.getElementById('hora').value,
            people: parseInt(document.getElementById('num-personas').value),
        };

        try {
            await addFormToAirtable(form);
            toast("¡Reserva enviada con éxito!");
            alquilerForm.reset(); // Limpiar el formulario
        } catch (error) {
            console.error('Error agregando producto:', error);
            alert('Hubo un error al agregar el producto.');
        }
    });

    async function addFormToAirtable(form) {
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
                        name: form.name,
                        mail: form.mail,
                        date: form.date,
                        hour: form.hour,
                        people: form.people,
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Form agregado:', data);
            } else {
                console.error('Error agregando producto:', await response.json());
            }
        } catch (error) {
            console.error('Error en la solicitud POST:', error);
        }
    }

    function toast(mensaje) {
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

   






















})