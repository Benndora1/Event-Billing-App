<template>
  <div>
    <div class="page-header">
      <h2>Receipts</h2>
      <p>Create and manage payment receipts</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Receipt List</h3>
        <button @click="openCreateModal" class="btn btn-primary">+ Create Receipt</button>
      </div>

      <div v-if="loading" class="loading">Loading receipts...</div>

      <div v-else-if="receipts.length === 0" class="empty-state">
        <div class="empty-state-icon">🧾</div>
        <p>No receipts yet. Create your first receipt!</p>
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="receipt in receipts" 
              :key="receipt.id"
              :class="{ 'active-row': editingReceipt?.id === receipt.id }"
              @click="openEditModal(receipt)"
              @mouseenter="showActions(receipt.id)"
              @mouseleave="hideActions"
              class="clickable-row"
            >
              <td><strong>{{ receipt.receipt_number }}</strong></td>
              <td>{{ receipt.client_name }}</td>
              <td>{{ receipt.receipt_date }}</td>
              <td>{{ receipt.payment_method }}</td>
              <td><strong>${{ receipt.total }}</strong></td>
              <td>
                <span :class="['badge', `badge-${getStatusBadge(receipt.status)}`]">
                  {{ receipt.status }}
                </span>
              </td>
              <td>
                <!-- Action buttons container for hover -->
                <div class="actions-container">
                  <div class="icon edit-icon">
                    <i class="fas fa-edit"></i>
                  </div>
                  <button 
                    @click.stop="openEditModal(receipt)" 
                    class="action-btn" 
                    title="Edit"
                  >
                    <span class="btn-text">Edit</span>
                  </button>
                  <div class="icon send-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <button 
                    @click.stop="sendEmail(receipt.id)" 
                    class="action-btn" 
                    title="Send Email"
                  >
                    <span class="btn-text">Send Email</span>
                  </button>
                  <div class="icon delete-icon">
                    <i class="fas fa-trash"></i>
                  </div>
                  <button 
                    @click.stop="deleteReceipt(receipt.id)" 
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

    <!-- Custom Add Receipt Modal -->
    <div v-if="showAddModal" class="custom-modal-overlay" @click.self="closeAddModal">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>Create New Receipt</h3>
          <button class="close-btn" @click="closeAddModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddReceipt" class="add-receipt-form">
          <div class="form-section">
            <h4>Receipt Details</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="client">Client *</label>
                <select
                  id="client"
                  v-model="newReceipt.client_id"
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
                <label for="payment_method">Payment Method *</label>
                <select
                  id="payment_method"
                  v-model="newReceipt.payment_method"
                  required
                  class="form-input"
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="receipt_date">Receipt Date *</label>
                <input
                  id="receipt_date"
                  v-model="newReceipt.receipt_date"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Items</h4>
            <div class="items-section">
              <div v-for="(item, index) in newReceipt.items" :key="index" class="item-row">
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
                  v-if="newReceipt.items.length > 1"
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
              {{ loading ? 'Creating...' : 'Create Receipt' }}
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
  name: 'Receipts',
  setup() {
    const store = useAppStore()

    const showModal = ref(false)
    const editingReceipt = ref(null)
    const activeActionsId = ref(null)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const newReceipt = ref({
      client_id: '',
      payment_method: '',
      receipt_date: '',
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

    const openEditModal = (receipt) => {
      editingReceipt.value = receipt
      showEditModal.value = true
    }

    const closeAddModal = () => {
      showAddModal.value = false
      resetNewReceipt()
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingReceipt.value = null
    }

    const resetNewReceipt = () => {
      newReceipt.value = {
        client_id: '',
        payment_method: '',
        receipt_date: '',
        items: [{
          description: '',
          quantity: 1,
          unit_price: 0,
          total: 0
        }]
      }
    }

    const addItem = () => {
      newReceipt.value.items.push({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      })
    }

    const removeItem = (index) => {
      newReceipt.value.items.splice(index, 1)
    }

    const handleAddReceipt = async () => {
      try {
        await store.createReceipt(newReceipt.value)
        closeAddModal()
        store.refreshReceipts() // Refresh list
      } catch (error) {
        alert('Error creating receipt')
      }
    }

    const handleEditReceipt = async () => {
      try {
        await store.updateReceipt(editingReceipt.value.id, editingReceipt.value)
        closeEditModal()
        store.refreshReceipts() // Refresh list
      } catch (error) {
        alert('Error updating receipt')
      }
    }

    const showActions = (id) => {
      activeActionsId.value = id
    }

    const hideActions = () => {
      activeActionsId.value = null
    }

    const handleReceiptSaved = () => {
      closeModal()
      store.refreshReceipts() // Refresh the list
    }

    const sendEmail = async (id) => {
      if (!confirm('Send receipt via email?')) return

      try {
        await store.sendReceiptEmail(id)
        alert('Receipt sent successfully!')
      } catch (error) {
        alert('Error sending receipt')
      }
    }

    const deleteReceipt = async (id) => {
      if (!confirm('Are you sure you want to delete this receipt?')) return

      try {
        await store.deleteReceipt(id)
      } catch (error) {
        alert('Error deleting receipt')
      }
    }

    const closeModal = () => {
      showModal.value = false
      editingReceipt.value = null
    }

    const getStatusBadge = (status) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'warning'
        case 'paid':
          return 'success'
        case 'cancelled':
          return 'danger'
        default:
          return 'secondary'
      }
    }

    return {
      receipts: computed(() => store.receipts),
      clients: computed(() => store.clients),
      loading: computed(() => store.loading),
      editingReceipt,
      showAddModal,
      showEditModal,
      newReceipt,
      openCreateModal,
      openEditModal,
      closeAddModal,
      closeEditModal,
      handleAddReceipt,
      handleEditReceipt,
      sendEmail,
      deleteReceipt,
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
  background-color: rgba(16, 185, 129, 0.1);
}

.active-row {
  background-color: rgba(16, 185, 129, 0.2) !important;
  border-left: 3px solid #10b981;
}

.active-row:hover {
  background-color: rgba(16, 185, 129, 0.3) !important;
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

.add-receipt-form {
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
