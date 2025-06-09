// Tipos
interface FormDataValues {
  rut: string;
  pin?: string;
  patente?: string;
}

// Función para formatear RUT
function formatRut(rut: string): string {
  // Eliminar puntos y guión
  let rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  // Si está vacío, retornar vacío
  if (rutLimpio.length === 0) return '';
  
  // Separar el dígito verificador
  let dv = rutLimpio.slice(-1).toUpperCase();
  let rutNumerico = rutLimpio.slice(0, -1);
  
  // Formatear con puntos según la longitud
  let rutFormateado = '';
  if (rutNumerico.length <= 7) {
    // Formato para RUTs de 8 dígitos (X.XXX.XXX-X)
    for (let i = rutNumerico.length; i > 0; i -= 3) {
      rutFormateado = '.' + rutNumerico.slice(Math.max(0, i - 3), i) + rutFormateado;
    }
  } else {
    // Formato para RUTs de 9 dígitos (XX.XXX.XXX-X)
    rutFormateado = rutNumerico.slice(0, 2) + '.' + 
                    rutNumerico.slice(2, 5) + '.' + 
                    rutNumerico.slice(5);
  }
  
  // Eliminar el punto inicial y agregar el guión con el dígito verificador
  return rutFormateado + '-' + dv;
}

// Clase para manejar los modales
export class ModalManager {
  private static instance: ModalManager;
  private mechanicModal: HTMLElement | null;
  private vehicleModal: HTMLElement | null;
  private mechanicForm: HTMLFormElement | null;
  private vehicleForm: HTMLFormElement | null;

  private constructor() {
    this.mechanicModal = document.getElementById('mechanicModal');
    this.vehicleModal = document.getElementById('vehicleModal');
    this.mechanicForm = document.getElementById('mechanicForm') as HTMLFormElement;
    this.vehicleForm = document.getElementById('vehicleForm') as HTMLFormElement;

    this.initializeEventListeners();
    this.initializeRutFormatting();
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  private initializeEventListeners(): void {
    // Mechanic Login Button
    const mechanicLoginBtn = document.getElementById('mechanicLoginBtn');
    mechanicLoginBtn?.addEventListener('click', () => {
      this.openModal('mechanicModal');
    });

    // Vehicle Status Button
    const vehicleStatusBtn = document.getElementById('vehicleStatusBtn');
    vehicleStatusBtn?.addEventListener('click', () => {
      this.openModal('vehicleModal');
    });

    // Close Modal Buttons
    document.querySelectorAll('[data-modal-close]').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const modalId = target.getAttribute('data-modal-close');
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // Form Submissions
    this.mechanicForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMechanicLogin(e);
    });

    this.vehicleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleVehicleStatus();
    });
  }

  private initializeRutFormatting(): void {
    const rutInputs = document.querySelectorAll('input[name="rut"]');
    rutInputs.forEach(input => {
      // Formatear mientras se escribe
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = formatRut(target.value);
      });

      // Asegurar formato correcto antes de enviar
      input.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          target.value = formatRut(target.value);
        }
      });
    });
  }

  private openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    const modalContent = modal?.querySelector('[id$="ModalContent"]') as HTMLElement;
    
    if (!modal || !modalContent) return;
    
    modal.classList.remove('modal-hidden');
    modalContent.style.transform = 'scale(1)';
    modalContent.style.opacity = '1';
    document.body.classList.add('modal-open');
  }

  private closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    const modalContent = modal?.querySelector('[id$="ModalContent"]') as HTMLElement;
    
    if (!modal || !modalContent) return;
    
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
      modal.classList.add('modal-hidden');
      document.body.classList.remove('modal-open');
      if (modalId === 'mechanicModal') {
        this.mechanicForm?.reset();
      } else if (modalId === 'vehicleModal') {
        this.vehicleForm?.reset();
      }
    }, 150);
  }

  private async handleMechanicLogin(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const rut = form.querySelector<HTMLInputElement>('[name="rut"]')?.value;
    const pin = form.querySelector<HTMLInputElement>('[name="pin"]')?.value;

    if (!rut || !pin) {
      this.showError('Por favor complete todos los campos');
      return;
    }

    try {
      console.log('Intentando login con RUT:', rut);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rut, pin }),
      });

      console.log('Respuesta del login:', response.status);
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      console.log('Login exitoso, datos recibidos:', data);
      
      if (data.token) {
        console.log('Guardando token y datos del mecánico');
        localStorage.setItem('mechanicToken', data.token);
        localStorage.setItem('mechanicData', JSON.stringify(data.mechanic));
        console.log('Redirigiendo a página de mecánicos');
        window.location.replace('/mechanic');
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Error al iniciar sesión. Por favor intente nuevamente.');
    }
  }

  private async handleVehicleStatus(): Promise<void> {
    if (!this.vehicleForm) return;

    const formData = new FormData(this.vehicleForm);
    const searchData = {
      rut: formData.get('rut'),
      patente: formData.get('patente')
    };

    try {
      const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/vehicles/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        const vehicleData = await response.json();
        // Show vehicle status in a modal or redirect to status page
        this.showVehicleStatus(vehicleData);
      } else {
        throw new Error('Vehicle not found');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se encontró el vehículo. Por favor, verifique los datos ingresados.');
    }
  }

  private showVehicleStatus(vehicleData: any): void {
    // Create and show a modal with vehicle status
    const statusModal = document.createElement('div');
    statusModal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    statusModal.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl w-[500px]">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Estado del Vehículo</h2>
          <button type="button" class="text-indigo-400 hover:text-indigo-700 transition-colors p-2 hover:bg-indigo-100 rounded-full" onclick="this.closest('.fixed').remove()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-700">Información del Vehículo</h3>
            <p class="text-gray-600">Patente: ${vehicleData.patente}</p>
            <p class="text-gray-600">Marca: ${vehicleData.marca}</p>
            <p class="text-gray-600">Modelo: ${vehicleData.modelo}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700">Estado Actual</h3>
            <p class="text-gray-600">Estado: ${vehicleData.estado}</p>
            <p class="text-gray-600">Fecha de ingreso: ${new Date(vehicleData.fecha_ingreso).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700">Observaciones</h3>
            <p class="text-gray-600">${vehicleData.observaciones || 'Sin observaciones'}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(statusModal);
  }

  private showError(message: string): void {
    // Implement the logic to show an error message to the user
    console.error(message);
    alert(message);
  }
} 