<template>
  <div v-if="show" class="form-overlay">
    <div class="form-container">
      <div class="form-header">
        <h3>{{ isEditing ? 'Edit Receipt' : 'Create Receipt' }}</h3>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="receipt-form">
      <div class="form-section">
        <h3>Receipt Details</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="client">Client *</label>
            <select
              id="client"
              v-model="form.client_id"
              required
              :class="{ 'error': errors.client_id }"
            >
              <option value="">Select a client</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}{{ client.company ? ` - ${client.company}` : '' }}
              </option>
            </select>
            <span v-if="errors.client_id" class="error-message">{{ errors.client_id }}</span>
          </div>

          <div class="form-group">
            <label for="payment_method">Payment Method *</label>
            <select
              id="payment_method"
              v-model="form.payment_method"
              required
              :class="{ 'error': errors.payment_method }"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
            <span v-if="errors.payment_method" class="error-message">{{ errors.payment_method }}</span>
          </div>

          <div class="form-group">
            <label for="receipt_date">Receipt Date *</label>
            <input
              id="receipt_date"
              v-model="form.receipt_date"
              type="date"
              required
              :class="{ 'error': errors.receipt_date }"
              :max="maxDate"
            />
            <span v-if="errors.receipt_date" class="error-message">{{ errors.receipt_date }}</span>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select
              id="status"
              v-model="form.status"
              :class="{ 'error': errors.status }"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Items</h3>
        <div class="items-container">
          <div class="items-header">
            <div>Description</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total</div>
            <div></div>
          </div>
          
          <div v-for="(item, index) in form.items" :key="index" class="item-row">
            <div class="form-group">
              <input
                v-model="item.description"
                type="text"
                placeholder="Item description"
                required
                :class="{ 'error': errors[`items_${index}_description`] }"
              />
              <span v-if="errors[`items_${index}_description`]" class="error-message">
                {{ errors[`items_${index}_description`] }}
              </span>
            </div>
            
            <div class="form-group">
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                step="1"
                placeholder="Qty"
                required
                @input="calculateItemTotal(index)"
                :class="{ 'error': errors[`items_${index}_quantity`] }"
              />
              <span v-if="errors[`items_${index}_quantity`]" class="error-message">
                {{ errors[`items_${index}_quantity`] }}
              </span>
            </div>
            
            <div class="form-group">
              <input
                v-model.number="item.unit_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                @input="calculateItemTotal(index)"
                :class="{ 'error': errors[`items_${index}_unit_price`] }"
              />
              <span v-if="errors[`items_${index}_unit_price`]" class="error-message">
                {{ errors[`items_${index}_unit_price`] }}
              </span>
            </div>
            
            <div class="item-total">
              ${{ (item.total || 0).toFixed(2) }}
            </div>
            
            <div class="item-actions">
              <button type="button" class="btn-remove" @click="removeItem(index)" :disabled="form.items.length <= 1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <button type="button" class="btn-add-item" @click="addItem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <div class="form-section">
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="total-row">
            <span>Tax (10%):</span>
            <span>${{ tax.toFixed(2) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : (isEditing ? 'Update Receipt' : 'Create Receipt') }}
        </button>
      </div>
    </div>
    </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { clientAPI, receiptAPI } from '../services/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  receipt: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const isEditing = ref(false)
const clients = ref([])

const form = reactive({
  client_id: '',
  payment_method: '',
  receipt_date: '',
  status: 'paid',
  items: [
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ]
})

const errors = reactive({})

const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0] // Today
})

const subtotal = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.total || 0), 0)
})

const tax = computed(() => {
  return subtotal.value * 0.1 // 10% tax
})

const total = computed(() => {
  return subtotal.value + tax.value
})

const loadClients = async () => {
  try {
    const response = await clientAPI.getAll()
    clients.value = response.data
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

const addItem = () => {
  form.items.push({
    description: '',
    quantity: 1,
    unit_price: 0,
    total: 0
  })
}

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

const calculateItemTotal = (index) => {
  const item = form.items[index]
  item.total = (item.quantity || 0) * (item.unit_price || 0)
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  let isValid = true

  // Client validation
  if (!form.client_id) {
    errors.client_id = 'Please select a client'
    isValid = false
  }

  // Payment method validation
  if (!form.payment_method) {
    errors.payment_method = 'Please select a payment method'
    isValid = false
  }

  // Receipt date validation
  if (!form.receipt_date) {
    errors.receipt_date = 'Please select a receipt date'
    isValid = false
  }

  // Items validation
  form.items.forEach((item, index) => {
    if (!item.description?.trim()) {
      errors[`items_${index}_description`] = 'Description is required'
      isValid = false
    }
    
    if (!item.quantity || item.quantity < 1) {
      errors[`items_${index}_quantity`] = 'Quantity must be at least 1'
      isValid = false
    }
    
    if (!item.unit_price || item.unit_price < 0) {
      errors[`items_${index}_unit_price`] = 'Unit price must be positive'
      isValid = false
    }
  })

  return isValid
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'items') {
      form[key] = [{
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    } else if (key === 'status') {
      form[key] = 'paid'
    } else {
      form[key] = ''
    }
  })
  Object.keys(errors).forEach(key => delete errors[key])
  isEditing.value = false
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  
  try {
    const receiptData = {
      client_id: parseInt(form.client_id),
      payment_method: form.payment_method,
      receipt_date: form.receipt_date,
      status: form.status,
      items: form.items.map(item => ({
        description: item.description.trim(),
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    }

    if (isEditing.value && props.receipt) {
      await receiptAPI.update(props.receipt.id, receiptData)
    } else {
      await receiptAPI.create(receiptData)
    }

    emit('saved')
    emit('close')
    resetForm()
  } catch (error) {
    console.error('Error saving receipt:', error)
    // Handle server validation errors
    if (error.response?.data) {
      Object.keys(error.response.data).forEach(key => {
        errors[key] = error.response.data[key][0] || 'Validation error'
      })
    }
  } finally {
    loading.value = false
  }
}

// Watch for receipt prop changes (for editing)
watch(() => props.receipt, (newReceipt) => {
  if (newReceipt) {
    isEditing.value = true
    form.client_id = newReceipt.client_id || ''
    form.payment_method = newReceipt.payment_method || ''
    form.receipt_date = newReceipt.receipt_date || ''
    form.status = newReceipt.status || 'paid'
    form.items = newReceipt.items?.length ? [...newReceipt.items] : [{
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }]
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form when modal closes
watch(() => props.show, (newShow) => {
  if (!newShow) {
    setTimeout(() => resetForm(), 300)
  }
})

onMounted(() => {
  loadClients()
})
</script>

<style scoped>
.receipt-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section h3 {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
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
  grid-column: 1 / -1;
}

.form-group label,
.form-group select,
.form-group input,
.form-group textarea {
  font-size: 0.875rem;
}

.form-group label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-group select,
.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  transition: all 0.2s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group select::placeholder,
.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group select.error,
.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.items-container {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 40px;
  gap: 1rem;
  padding: 0.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 40px;
  gap: 1rem;
  align-items: start;
  padding: 0.5rem 0;
}

.item-total {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #10b981;
  font-size: 0.875rem;
}

.item-actions {
  display: flex;
  align-items: center;
}

.btn-remove {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-remove:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-add-item {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  color: #10b981;
  cursor: pointer;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.btn-add-item:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.total-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.total-row.grand-total {
  font-weight: 600;
  font-size: 1.125rem;
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .items-header,
  .item-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .item-total,
  .item-actions {
    margin-top: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

<style scoped>
.form-overlay {
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

.form-container {
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

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-header h3 {
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

.receipt-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
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
