export class VehicleManager {
  private static instance: VehicleManager;
  private vehicleModal: HTMLElement | null;
  private vehicleModalContent: HTMLElement | null;
  private vehicleForm: HTMLFormElement | null;
  private vehicleList: HTMLElement | null;
  private addVehicleBtn: HTMLElement | null;
  private logoutBtn: HTMLElement | null;
  private imagePreview: HTMLElement | null;
  private selectedFiles: File[] = [];

  private constructor() {
    this.vehicleModal = document.getElementById('vehicleModal');
    this.vehicleModalContent = document.getElementById('vehicleModalContent');
    this.vehicleForm = document.getElementById('vehicleForm') as HTMLFormElement;
    this.vehicleList = document.getElementById('vehicleList');
    this.addVehicleBtn = document.getElementById('addVehicleBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.imagePreview = document.getElementById('imagePreview');

    this.initializeEventListeners();
    this.loadVehicles();
  }

  public static getInstance(): VehicleManager {
    if (!VehicleManager.instance) {
      VehicleManager.instance = new VehicleManager();
    }
    return VehicleManager.instance;
  }

  private initializeEventListeners(): void {
    // Add Vehicle Button
    this.addVehicleBtn?.addEventListener('click', () => {
      this.openModal();
    });

    // Close Modal Buttons
    document.querySelectorAll('[data-modal-close="vehicleModal"]').forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Form Submit
    this.vehicleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // File Upload
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleFileUpload(Array.from(target.files));
      }
    });

    // Logout
    this.logoutBtn?.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  private async loadVehicles(): Promise<void> {
    try {
      const token = localStorage.getItem('mechanicToken');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/vehiculos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('mechanicToken');
        window.location.href = '/';
        return;
      }

      const vehicles = await response.json();
      this.renderVehicles(vehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }

  private renderVehicles(vehicles: any[]): void {
    if (!this.vehicleList) return;

    this.vehicleList.innerHTML = vehicles.map(vehicle => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${vehicle.patente}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vehicle.cliente.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${this.getStatusColor(vehicle.estado)}-100 text-${this.getStatusColor(vehicle.estado)}-800">
            ${vehicle.estado}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(vehicle.fecha_ingreso).toLocaleDateString()}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editVehicle('${vehicle.id}')">Editar</button>
          <button class="text-red-600 hover:text-red-900" onclick="deleteVehicle('${vehicle.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'En espera': 'yellow',
      'En revisión': 'blue',
      'En reparación': 'purple',
      'Listo para entrega': 'green',
      'Entregado': 'gray'
    };
    return colors[status] || 'gray';
  }

  private openModal(): void {
    if (!this.vehicleModal || !this.vehicleModalContent) return;
    
    this.vehicleModal.classList.remove('modal-hidden');
    this.vehicleModalContent.style.transform = 'scale(1)';
    this.vehicleModalContent.style.opacity = '1';
    document.body.classList.add('modal-open');
  }

  private closeModal(): void {
    if (!this.vehicleModal || !this.vehicleModalContent) return;
    
    this.vehicleModalContent.style.transform = 'scale(0.95)';
    this.vehicleModalContent.style.opacity = '0';
    
    setTimeout(() => {
      this.vehicleModal?.classList.add('modal-hidden');
      document.body.classList.remove('modal-open');
      this.resetForm();
    }, 150);
  }

  private resetForm(): void {
    if (!this.vehicleForm) return;
    
    this.vehicleForm.reset();
    this.selectedFiles = [];
    if (this.imagePreview) {
      this.imagePreview.innerHTML = '';
    }
  }

  private handleFileUpload(files: File[]): void {
    if (!this.imagePreview) return;

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.className = 'w-full h-24 object-cover rounded-lg';
          this.imagePreview?.appendChild(img);
        };
        
        reader.readAsDataURL(file);
      }
    });
  }

  private async handleFormSubmit(): Promise<void> {
    if (!this.vehicleForm) return;

    const formData = new FormData(this.vehicleForm);
    const vehicleData = {
      cliente: {
        rut: formData.get('rut'),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono')
      },
      vehiculo: {
        patente: formData.get('patente'),
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        estado: formData.get('estado'),
        observaciones: formData.get('observaciones')
      }
    };

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        // Upload images if any
        if (this.selectedFiles.length > 0) {
          const vehicleId = await response.json();
          await this.uploadImages(vehicleId, this.selectedFiles);
        }
        
        this.closeModal();
        this.loadVehicles();
      } else {
        throw new Error('Error saving vehicle');
      }
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
    }
  }

  private async uploadImages(vehicleId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  }

  private handleLogout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('mechanicToken');
    // Redirect to home page
    window.location.href = '/';
  }
} 