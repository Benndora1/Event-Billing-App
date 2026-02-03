<template>
  <div class="clients-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>Clients</h2>
          <p>Manage your event company clients</p>
        </div>
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <h3>Client List</h3>
        <button @click="openCreateModal" class="btn btn-primary">
          + Add Client
        </button>
      </div>

      <div v-if="loading" class="loading">
        Loading clients...
      </div>

      <div v-else-if="clients.length === 0" class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No clients yet. Add your first client to get started!</p>
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="client in clients" 
              :key="client.id"
              :class="{ 'active-row': editingClient?.id === client.id }"
              @click="openEditModal(client)"
              @mouseenter="showActions(client.id)"
              @mouseleave="hideActions"
              class="clickable-row"
            >
              <td>{{ client.name }}</td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone || 'N/A' }}</td>
              <td>{{ client.company || 'N/A' }}</td>
              <td>
                <!-- Action buttons container for hover -->
                <div class="actions-container">
                  <div class="icon edit-icon">
                    <i class="fas fa-edit"></i>
                  </div>
                  <button 
                    @click.stop="openEditModal(client)" 
                    class="action-btn" 
                    title="Edit"
                  >
                    <span class="btn-text">Edit</span>
                  </button>
                  <div class="icon delete-icon">
                    <i class="fas fa-trash"></i>
                  </div>
                  <button 
                    @click.stop="deleteClient(client.id)" 
                    class="action-btn delete-btn" 
                    title="Delete"
                  >
                    <span class="btn-text">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Custom Add Client Modal -->
    <div v-if="showAddModal" class="custom-modal-overlay" @click.self="closeAddModal">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>Add New Client</h3>
          <button class="close-btn" @click="closeAddModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddClient" class="add-client-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Client Name *</label>
              <input
                id="name"
                v-model="newClient.name"
                type="text"
                required
                placeholder="Enter client name"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="newClient.email"
                type="email"
                required
                placeholder="client@example.com"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                id="phone"
                v-model="newClient.phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="company">Company</label>
              <input
                id="company"
                v-model="newClient.company"
                type="text"
                placeholder="Company name"
                class="form-input"
              />
            </div>
            
            <div class="form-group full-width">
              <label for="address">Address</label>
              <textarea
                id="address"
                v-model="newClient.address"
                placeholder="123 Main St, City, State 12345"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeAddModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Adding...' : 'Add Client' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Edit Client Modal -->
    <div v-if="showEditModal" class="custom-modal-overlay" @click.self="closeEditModal">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>Edit Client</h3>
          <button class="close-btn" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleEditClient" class="add-client-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="edit-name">Client Name *</label>
              <input
                id="edit-name"
                v-model="editingClient.name"
                type="text"
                required
                placeholder="Enter client name"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-email">Email *</label>
              <input
                id="edit-email"
                v-model="editingClient.email"
                type="email"
                required
                placeholder="client@example.com"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-phone">Phone</label>
              <input
                id="edit-phone"
                v-model="editingClient.phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-company">Company</label>
              <input
                id="edit-company"
                v-model="editingClient.company"
                type="text"
                placeholder="Company name"
                class="form-input"
              />
            </div>
            
            <div class="form-group full-width">
              <label for="edit-address">Address</label>
              <textarea
                id="edit-address"
                v-model="editingClient.address"
                placeholder="123 Main St, City, State 12345"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Client' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAppStore } from '../stores/appStore'

export default {
  name: 'Clients',
  setup() {
    const store = useAppStore()

    const showModal = ref(false)
    const editingClient = ref(null)
    const activeActionsId = ref(null)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const newClient = ref({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: ''
    })

    // Store is initialized globally in App.vue
    // No need to initialize here

    const openCreateModal = () => {
      showAddModal.value = true
    }

    const openEditModal = (client) => {
      editingClient.value = client
      showEditModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
      resetNewClient()
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingClient.value = null
    }

    const resetNewClient = () => {
      newClient.value = {
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      }
    }

    const handleAddClient = async () => {
      try {
        await store.createClient(newClient.value)
        closeAddModal()
        store.refreshClients() // Refresh list
      } catch (error) {
        console.error('Client creation failed:', error.message);
        alert(error.message || 'Error adding client');
      }
    }

    const handleEditClient = async () => {
      try {
        await store.updateClient(editingClient.value.id, editingClient.value)
        closeEditModal()
        store.refreshClients() // Refresh list
      } catch (error) {
        alert('Error updating client')
      }
    }

    const showActions = (id) => {
      activeActionsId.value = id
    }

    const hideActions = () => {
      activeActionsId.value = null
    }

    const deleteClient = async (id) => {
      if (!confirm('Are you sure you want to delete this client?')) return

      try {
        await store.deleteClient(id)
      } catch (error) {
        alert('Error deleting client')
      }
    }

    const handleClientSaved = () => {
      closeModal()
      store.refreshClients() // Refresh the list
    }

    const closeModal = () => {
      showModal.value = false
      editingClient.value = null
    }

    return {
      clients: computed(() => store.clients),
      loading: computed(() => store.loading),
      editingClient,
      showAddModal,
      showEditModal,
      newClient,
      openCreateModal,
      openEditModal,
      closeAddModal,
      closeEditModal,
      handleAddClient,
      handleEditClient,
      deleteClient,
      showActions,
      hideActions,
    }
  },
}
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.active-row {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border-left: 3px solid #3b82f6;
}

.actions-container {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none;
}

.actions-container.show {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: white;
}

/* Custom Modal Styles */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.custom-modal {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

.custom-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-modal .modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.add-client-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.clients-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1.1rem;
}
</style>