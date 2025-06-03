// Tipos
interface FormDataValues {
  rut: string;
  pin?: string;
  patente?: string;
}

// Clase para manejar los modales
export class ModalManager {
  private static instance: ModalManager;
  private activeModal: HTMLElement | null = null;

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  private initializeEventListeners(): void {
    // Botones de apertura
    const mechanicLoginBtn = document.getElementById('mechanicLoginBtn');
    const vehicleStatusBtn = document.getElementById('vehicleStatusBtn');

    if (mechanicLoginBtn) {
      mechanicLoginBtn.addEventListener('click', () => this.openModal('mechanicModal'));
    }

    if (vehicleStatusBtn) {
      vehicleStatusBtn.addEventListener('click', () => this.openModal('vehicleModal'));
    }

    // Configurar los botones de cierre
    const closeButtons = document.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = (e.currentTarget as HTMLElement).getAttribute('data-modal-close');
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.activeModal && this.activeModal?.id) {
        this.closeModal(this.activeModal.id);
      }
    });

    // Configurar los inputs
    this.setupInputs();
  }

  private setupInputs(): void {
    // Inputs del formulario de mecánicos
    const mechanicRutInput = document.querySelector('#mechanicForm input[name="rut"]') as HTMLInputElement;
    const mechanicPinInput = document.querySelector('#mechanicForm input[name="pin"]') as HTMLInputElement;

    if (mechanicRutInput) {
      mechanicRutInput.addEventListener('input', () => this.formatRut(mechanicRutInput));
    }

    if (mechanicPinInput) {
      mechanicPinInput.addEventListener('input', () => this.validateNumbers(mechanicPinInput));
      mechanicPinInput.maxLength = 6;
    }

    // Inputs del formulario de vehículos
    const vehicleRutInput = document.querySelector('#vehicleForm input[name="rut"]') as HTMLInputElement;
    const vehiclePatenteInput = document.querySelector('#vehicleForm input[name="patente"]') as HTMLInputElement;

    if (vehicleRutInput) {
      vehicleRutInput.addEventListener('input', () => this.formatRut(vehicleRutInput));
    }

    if (vehiclePatenteInput) {
      vehiclePatenteInput.addEventListener('input', () => this.formatPatente(vehiclePatenteInput));
    }

    // Configurar formularios
    this.setupForms();
  }

  private setupForms(): void {
    const mechanicForm = document.getElementById('mechanicForm') as HTMLFormElement;
    const vehicleForm = document.getElementById('vehicleForm') as HTMLFormElement;

    if (mechanicForm) {
      mechanicForm.addEventListener('submit', (e: Event) => this.handleMechanicSubmit(e));
    }

    if (vehicleForm) {
      vehicleForm.addEventListener('submit', (e: Event) => this.handleVehicleSubmit(e));
    }
  }

  public openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    const modalContent = document.getElementById(`${modalId}Content`);
    
    if (modal && modalContent) {
      this.activeModal = modal;
      document.body.classList.add('modal-open');
      modal.classList.remove('modal-hidden');
      
      setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
      }, 10);
    }
  }

  public closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    const modalContent = document.getElementById(`${modalId}Content`);
    
    if (modal && modalContent) {
      modalContent.classList.remove('scale-100', 'opacity-100');
      modalContent.classList.add('scale-95', 'opacity-0');
      
      setTimeout(() => {
        modal.classList.add('modal-hidden');
        document.body.classList.remove('modal-open');
        this.activeModal = null;
      }, 300);
    }
  }

  private formatRut(input: HTMLInputElement): void {
    let value = input.value.replace(/[^0-9kK]/g, '');
    
    // Limitar a 9 caracteres (8 números + 1 dígito verificador)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    if (value.length > 1) {
      const dv = value.slice(-1);
      const rut = value.slice(0, -1);
      
      let rutFormatted = '';
      for (let i = rut.length; i > 0; i -= 3) {
        rutFormatted = '.' + rut.slice(Math.max(0, i - 3), i) + rutFormatted;
      }
      rutFormatted = rutFormatted.slice(1);
      
      value = rutFormatted + '-' + dv;
    }
    
    input.value = value;
  }

  private formatPatente(input: HTMLInputElement): void {
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '-' + value.slice(2);
    }
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5);
    }
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    input.value = value;
  }

  private validateNumbers(input: HTMLInputElement): void {
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  private validateRut(rut: string): boolean {
    const rutRegex = /^(\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/;
    return rutRegex.test(rut);
  }

  private validatePatente(patente: string): boolean {
    const patenteRegex = /^[A-Z]{2}-[A-Z]{2}-[0-9]{2}$/;
    return patenteRegex.test(patente);
  }

  private async handleMechanicSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: FormDataValues = {
      rut: formData.get('rut') as string,
      pin: formData.get('pin') as string
    };

    if (!this.validateRut(data.rut)) {
      alert('Por favor, ingrese un RUT válido');
      return;
    }

    if (!data.pin || data.pin.length !== 6 || !/^\d+$/.test(data.pin)) {
      alert('El PIN debe contener exactamente 6 dígitos');
      return;
    }

    // Aquí irá la lógica para enviar los datos al backend
    console.log('Datos del mecánico:', data);
  }

  private async handleVehicleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: FormDataValues = {
      rut: formData.get('rut') as string,
      patente: formData.get('patente') as string
    };

    if (!this.validateRut(data.rut)) {
      alert('Por favor, ingrese un RUT válido');
      return;
    }

    if (!data.patente || !this.validatePatente(data.patente)) {
      alert('Por favor, ingrese una patente válida (formato: XX-XX-XX)');
      return;
    }

    // Aquí irá la lógica para enviar los datos al backend
    console.log('Datos del vehículo:', data);
  }
} 