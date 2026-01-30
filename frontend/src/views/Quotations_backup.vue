<template>
  <div>
    <div class="page-header">
      <h2>Quotations</h2>
      <p>Create and manage event quotations</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Quotation List</h3>
        <button @click="openCreateModal" class="btn btn-primary">+ Create Quotation</button>
      </div>

      <div v-if="loading" class="loading">Loading quotations...</div>

      <div v-else-if="quotations.length === 0" class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>No quotations yet. Create your first quotation!</p>
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Date</th>
              <th>Valid Until</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="quotation in quotations" 
              :key="quotation.id"
              :class="{ 'active-row': editingQuotation?.id === quotation.id }"
              @click="openEditModal(quotation)"
              @mouseenter="showActions(quotation.id)"
              @mouseleave="hideActions"
              class="clickable-row"
            >
              <td><strong>{{ quotation.quotation_number }}</strong></td>
              <td>{{ quotation.client_name }}</td>
              <td>{{ quotation.date }}</td>
              <td>{{ quotation.valid_until }}</td>
              <td><strong>${{ quotation.total }}</strong></td>
              <td>
                <span :class="['badge', `badge-${getStatusBadge(quotation.status)}`]">
                  {{ quotation.status }}
                </span>
              </td>
              <td>
                <!-- Action buttons container for hover -->
                <div class="actions-container">
                  <div class="icon edit-icon">
                    <i class="fas fa-edit"></i>
                  </div>
                  <button 
                    @click.stop="openEditModal(quotation)" 
                    class="action-btn" 
                    title="Edit"
                  >
                    <span class="btn-text">Edit</span>
                  </button>
                  <div class="icon send-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <button 
                    @click.stop="sendEmail(quotation.id)" 
                    class="action-btn" 
                    title="Send Email"
                  >
                    <span class="btn-text">Send Email</span>
                  </button>
                  <div class="icon delete-icon">
                    <i class="fas fa-trash"></i>
                  </div>
                  <button 
                    @click.stop="deleteQuotation(quotation.id)" 
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

    <!-- Custom Add Quotation Modal -->
    <div v-if="showAddModal" class="custom-modal-overlay" @click.self="closeAddModal">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>Create New Quotation</h3>
          <button class="close-btn" @click="closeAddModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddQuotation" class="add-quotation-form">
          <div class="form-section">
            <h4>Quotation Details</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="client">Client *</label>
                <select
                  id="client"
                  v-model="newQuotation.client_id"
                  required
                  class="form-input"
                >
                  <option value="">Select a client</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}{{ client.company ? ` - ${client.company}` : '' }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="valid_until">Valid Until *</label>
                <input
                  id="valid_until"
                  v-model="newQuotation.valid_until"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label for="terms">Terms</label>
              <textarea
                id="terms"
                v-model="newQuotation.terms"
                placeholder="Payment terms and conditions..."
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Items</h4>
            <div class="items-section">
              <div v-for="(item, index) in newQuotation.items" :key="index" class="item-row">
                <div class="form-group">
                  <label>Item Description *</label>
                  <input
                    v-model="item.description"
                    type="text"
                    required
                    placeholder="Item description"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label>Quantity *</label>
                  <input
                    v-model="item.quantity"
                    type="number"
                    required
                    min="1"
                    placeholder="1"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label>Unit Price *</label>
                  <input
                    v-model="item.unit_price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label>Total</label>
                  <input
                    :value="(item.quantity * item.unit_price).toFixed(2)"
                    type="text"
                    readonly
                    class="form-input readonly"
                  />
                </div>
                
                <button
                  v-if="newQuotation.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="btn btn-danger btn-sm"
                >
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
              
              <button
                type="button"
                @click="addItem"
                class="btn btn-secondary"
              >
                <i class="fas fa-plus"></i> Add Item
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeAddModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create Quotation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAppStore } from '../stores/appStore'

export default {
  name: 'Quotations',
  setup() {
    const store = useAppStore()

    const showModal = ref(false)
    const editingQuotation = ref(null)
    const activeActionsId = ref(null)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const newQuotation = ref({
      client_id: '',
      valid_until: '',
      terms: '',
      items: [{
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    })

    onMounted(() => {
      store.initializeStore();
    })

    onActivated(() => {
      store.initializeStore();
    })

    const openCreateModal = () => {
      showAddModal.value = true
    }

    const openEditModal = (quotation) => {
      editingQuotation.value = quotation
      showEditModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
      resetNewQuotation()
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingQuotation.value = null
    }

    const resetNewQuotation = () => {
      newQuotation.value = {
        client_id: '',
        valid_until: '',
        terms: '',
        items: [{
          description: '',
          quantity: 1,
          unit_price: 0,
          total: 0
        }]
      }
    }

    const addItem = () => {
      newQuotation.value.items.push({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      })
    }

    const removeItem = (index) => {
      newQuotation.value.items.splice(index, 1)
    }

    const handleAddQuotation = async () => {
      try {
        await store.createQuotation(newQuotation.value)
        closeAddModal()
        store.refreshQuotations() // Refresh list
      } catch (error) {
        alert('Error creating quotation')
      }
    }

    const handleEditQuotation = async () => {
      try {
        await store.updateQuotation(editingQuotation.value.id, editingQuotation.value)
        closeEditModal()
        store.refreshQuotations() // Refresh list
      } catch (error) {
        alert('Error updating quotation')
      }
    }

    const showActions = (id) => {
      activeActionsId.value = id
    }

    const hideActions = () => {
      activeActionsId.value = null
    }

    const handleQuotationSaved = () => {
      closeModal()
      store.refreshQuotations() // Refresh the list
    }

    const sendEmail = async (id) => {
      if (!confirm('Send quotation via email?')) return

      try {
        await store.sendQuotationEmail(id)
        alert('Quotation sent successfully!')
      } catch (error) {
        alert('Error sending quotation')
      }
    }

    const deleteQuotation = async (id) => {
      if (!confirm('Are you sure you want to delete this quotation?')) return

      try {
        await store.deleteQuotation(id)
      } catch (error) {
        alert('Error deleting quotation')
      }
    }

    const closeModal = () => {
      showModal.value = false
      editingQuotation.value = null
    }

    const getStatusBadge = (status) => {
      switch (status.toLowerCase()) {
        case 'draft':
          return 'warning'
        case 'sent':
          return 'info'
        case 'accepted':
          return 'success'
        case 'rejected':
          return 'danger'
        default:
          return 'secondary'
      }
    }

    return {
      quotations: computed(() => store.quotations),
      clients: computed(() => store.clients),
      loading: computed(() => store.loading),
      editingQuotation,
      showAddModal,
      showEditModal,
      newQuotation,
      openCreateModal,
      openEditModal,
      closeAddModal,
      closeEditModal,
      handleAddQuotation,
      handleEditQuotation,
      sendEmail,
      deleteQuotation,
      showActions,
      hideActions,
      addItem,
      removeItem,
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

.active-row:hover {
  background-color: rgba(59, 130, 246, 0.3) !important;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-secondary {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
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
  max-width: 800px;
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

.add-quotation-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section h4 {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.form-input.readonly {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.items-section {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.item-row:last-child {
  border-bottom: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-danger {
  background: var(--danger);
  border-color: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 0.8);
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
</style>
