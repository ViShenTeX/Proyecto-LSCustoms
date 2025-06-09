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
  private mechanicForm: HTMLFormElement | null;

  private constructor() {
    this.mechanicModal = document.getElementById('mechanicModal');
    this.mechanicForm = document.getElementById('mechanicForm') as HTMLFormElement;

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

    // Vehicle Status Button - This button now redirects directly from index.astro
    // No longer handled by modals.ts, so no listener needed here.

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

    // The vehicle status form submission is now handled in index.astro via redirection.
    // No event listener needed here for vehicleForm submission.
  }

  private initializeRutFormatting(): void {
    const mechanicRutInput = document.getElementById('mechanicRut') as HTMLInputElement;
    if (mechanicRutInput) {
      mechanicRutInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = formatRut(target.value);
      });

      mechanicRutInput.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          target.value = formatRut(target.value);
        }
      });
    }
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

  private showError(message: string): void {
    alert(message);
  }
} 