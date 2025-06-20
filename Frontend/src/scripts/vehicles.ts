export class VehicleManager {
  private static instance: VehicleManager;
  private vehicleModal: HTMLElement | null;
  private vehicleModalContent: HTMLElement | null;
  private editVehicleModal: HTMLElement | null;
  private editVehicleModalContent: HTMLElement | null;
  private vehicleForm: HTMLFormElement | null;
  private editVehicleForm: HTMLFormElement | null;
  private vehicleList: HTMLElement | null;
  private addVehicleBtn: HTMLElement | null;
  private logoutBtn: HTMLElement | null;
  private imagePreview: HTMLElement | null;
  private editImagePreview: HTMLElement | null;
  private selectedFiles: File[] = [];
  private API_BASE_URL = '/api';
  private currentVehicleId: string | null = null;

  private constructor() {
    this.vehicleModal = document.getElementById('vehicleModal');
    this.vehicleModalContent = document.getElementById('vehicleModalContent');
    this.editVehicleModal = document.getElementById('editVehicleModal');
    this.editVehicleModalContent = document.getElementById('editVehicleModalContent');
    this.vehicleForm = document.getElementById('vehicleForm') as HTMLFormElement;
    this.editVehicleForm = document.getElementById('editVehicleForm') as HTMLFormElement;
    this.vehicleList = document.getElementById('vehicleList');
    this.addVehicleBtn = document.getElementById('addVehicleBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.imagePreview = document.getElementById('imagePreview');
    this.editImagePreview = document.getElementById('editImagePreview');

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
      this.currentVehicleId = null;
      this.openModal();
    });

    // Close Modal Buttons
    document.querySelectorAll('[data-modal-close="vehicleModal"]').forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal();
      });
    });

    document.querySelectorAll('[data-modal-close="editVehicleModal"]').forEach(button => {
      button.addEventListener('click', () => {
        this.closeEditModal();
      });
    });

    // Form Submit
    this.vehicleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    this.editVehicleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditFormSubmit();
    });

    // File Upload
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleFileUpload(Array.from(target.files));
      }
    });

    const editFileInput = document.getElementById('edit-file-upload') as HTMLInputElement;
    editFileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleEditFileUpload(Array.from(target.files));
      }
    });

    // Logout
    this.logoutBtn?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Add global functions for edit and delete
    (window as any).editVehicle = (id: string) => this.editVehicle(id);
    (window as any).deleteVehicle = (id: string) => this.deleteVehicle(id);
  }

  public async loadVehicles(): Promise<void> {
    try {
      const token = localStorage.getItem('mechanicToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Cargando vehículos con token:', token.substring(0, 20) + '...');
      const response = await fetch(`${this.API_BASE_URL}/vehiculos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta de vehículos:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error('Failed to load vehicles');
      }

      const vehicles = await response.json();
      console.log('Vehículos cargados:', vehicles);
      this.renderVehicles(vehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      this.showError('Error al cargar los vehículos');
    }
  }

  private renderVehicles(vehicles: any[]): void {
    if (!this.vehicleList) return;

    this.vehicleList.innerHTML = vehicles.map(vehicle => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${vehicle.patente}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vehicle.cliente_nombre || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${this.getStatusColor(vehicle.estado)}-100 text-${this.getStatusColor(vehicle.estado)}-800">
            ${vehicle.estado}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(vehicle.created_at).toLocaleDateString()}</td>
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

  private openEditModal(): void {
    if (!this.editVehicleModal || !this.editVehicleModalContent) return;
    
    this.editVehicleModal.classList.remove('modal-hidden');
    this.editVehicleModalContent.style.transform = 'scale(1)';
    this.editVehicleModalContent.style.opacity = '1';
    document.body.classList.add('modal-open');
  }

  private closeEditModal(): void {
    if (!this.editVehicleModal || !this.editVehicleModalContent) return;
    
    this.editVehicleModalContent.style.transform = 'scale(0.95)';
    this.editVehicleModalContent.style.opacity = '0';
    
    setTimeout(() => {
      this.editVehicleModal?.classList.add('modal-hidden');
      document.body.classList.remove('modal-open');
      this.resetEditForm();
    }, 150);
  }

  private resetEditForm(): void {
    if (!this.editVehicleForm) return;
    
    this.editVehicleForm.reset();
    this.selectedFiles = [];
    if (this.editImagePreview) {
      this.editImagePreview.innerHTML = '';
    }
  }

  private handleEditFileUpload(files: File[]): void {
    if (!this.editImagePreview) return;

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.className = 'w-full h-24 object-cover rounded-lg';
          this.editImagePreview?.appendChild(img);
        };
        
        reader.readAsDataURL(file);
      }
    });
  }

  private async editVehicle(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('mechanicToken');
      if (!token) {
        this.showError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${this.API_BASE_URL}/vehiculos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el vehículo');
      }

      const vehicle = await response.json();
      this.currentVehicleId = id;
      
      // Llenar el formulario con los datos del vehículo
      if (this.editVehicleForm) {
        const estadoSelect = this.editVehicleForm.querySelector('#edit-estado') as HTMLSelectElement;
        const observacionesInput = this.editVehicleForm.querySelector('#edit-observaciones') as HTMLTextAreaElement;
        
        if (estadoSelect) estadoSelect.value = vehicle.estado;
        if (observacionesInput) observacionesInput.value = vehicle.observaciones || '';

        // Mostrar información del vehículo
        const vehicleInfo = this.editVehicleForm.querySelector('#vehicle-info');
        if (vehicleInfo) {
          vehicleInfo.innerHTML = `
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700">Patente: ${vehicle.patente}</p>
              <p class="text-sm font-medium text-gray-700">Marca: ${vehicle.marca}</p>
              <p class="text-sm font-medium text-gray-700">Modelo: ${vehicle.modelo}</p>
              <p class="text-sm font-medium text-gray-700">Cliente: ${vehicle.cliente_nombre}</p>
            </div>
          `;
        }
      }

      this.openEditModal();
    } catch (error) {
      console.error('Error:', error);
      this.showError('Error al cargar el vehículo');
    }
  }

  private async deleteVehicle(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('mechanicToken');
      if (!token) {
        this.showError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${this.API_BASE_URL}/vehiculos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el vehículo');
      }

      this.loadVehicles();
    } catch (error) {
      console.error('Error:', error);
      this.showError('Error al eliminar el vehículo');
    }
  }

  private async handleFormSubmit(): Promise<void> {
    if (!this.vehicleForm) return;

    const token = localStorage.getItem('mechanicToken');
    if (!token) {
      this.showError('No hay sesión activa');
      return;
    }

    const formData = new FormData(this.vehicleForm);
    let vehicleData: any = {};

    if (this.currentVehicleId) {
      // Modo edición
      vehicleData = {
        estado: formData.get('estado'),
        observaciones: formData.get('observaciones')
      };
    } else {
      // Modo creación
      vehicleData = {
        patente: formData.get('patente'),
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        estado: formData.get('estado'),
        observaciones: formData.get('observaciones'),
        cliente_rut: formData.get('rut'),
        cliente_nombre: formData.get('nombre'),
        cliente_telefono: formData.get('telefono')
      };
    }

    try {
      const url = this.currentVehicleId ? 
        `${this.API_BASE_URL}/vehiculos/${this.currentVehicleId}` : 
        `${this.API_BASE_URL}/vehiculos`;
      
      const method = this.currentVehicleId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        // Upload images if any
        if (this.selectedFiles.length > 0) {
          const vehicleId = this.currentVehicleId || (await response.json()).toString();
          await this.uploadImages(vehicleId, this.selectedFiles);
        }
        
        this.closeModal();
        this.loadVehicles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Error saving vehicle');
      }
    } catch (error) {
      console.error('Error completo:', error);
      this.showError(error instanceof Error ? error.message : 'Error al guardar el vehículo');
    }
  }

  private async uploadImages(vehicleId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      await fetch(`${this.API_BASE_URL}/vehicles/${vehicleId}/images`, {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  }

  private async handleEditFormSubmit(): Promise<void> {
    if (!this.editVehicleForm || !this.currentVehicleId) return;

    const token = localStorage.getItem('mechanicToken');
    if (!token) {
      this.showError('No hay sesión activa');
      return;
    }

    const formData = new FormData(this.editVehicleForm);
    const vehicleData = {
      estado: formData.get('estado'),
      observaciones: formData.get('observaciones')
    };

    try {
      const response = await fetch(`${this.API_BASE_URL}/vehiculos/${this.currentVehicleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        // Upload images if any
        if (this.selectedFiles.length > 0) {
          await this.uploadImages(this.currentVehicleId, this.selectedFiles);
        }
        
        this.closeEditModal();
        this.loadVehicles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Error saving vehicle');
      }
    } catch (error) {
      console.error('Error completo:', error);
      this.showError(error instanceof Error ? error.message : 'Error al guardar el vehículo');
    }
  }

  private handleLogout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('mechanicToken');
    // Redirect to home page
    window.location.href = '/';
  }

  private showError(message: string): void {
    // Implement the logic to show an error message to the user
    alert(message);
  }
} 