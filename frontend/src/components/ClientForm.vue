<template>
  <div v-if="show" class="form-overlay">
    <div class="form-container">
      <div class="form-header">
        <h3>{{ isEditing ? 'Edit Client' : 'Add New Client' }}</h3>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="client-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Client Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :class="{ 'error': errors.name }"
            placeholder="Enter client name"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :class="{ 'error': errors.email }"
            placeholder="client@example.com"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :class="{ 'error': errors.phone }"
            placeholder="+1 (555) 123-4567"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="company">Company</label>
          <input
            id="company"
            v-model="form.company"
            type="text"
            :class="{ 'error': errors.company }"
            placeholder="Company name (optional)"
          />
          <span v-if="errors.company" class="error-message">{{ errors.company }}</span>
        </div>

        <div class="form-group full-width">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
            :class="{ 'error': errors.address }"
            placeholder="Enter client address"
          ></textarea>
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : (isEditing ? 'Update Client' : 'Add Client') }}
        </button>
      </div>
    </div>
    </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { clientAPI } from '../services/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  client: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const isEditing = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: ''
})

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
  let isValid = true

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Client name is required'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'Email address is required'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Phone validation (optional but if provided, should be valid)
  if (form.phone && form.phone.trim()) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number'
      isValid = false
    }
  }

  return isValid
}

const resetForm = () => {
  Object.keys(form).forEach(key => form[key] = '')
  Object.keys(errors).forEach(key => errors[key] = '')
  isEditing.value = false
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  
  try {
    const clientData = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      address: form.address.trim() || null
    }

    if (isEditing.value && props.client) {
      await clientAPI.update(props.client.id, clientData)
    } else {
      await clientAPI.create(clientData)
    }

    emit('saved')
    emit('close')
    resetForm()
  } catch (error) {
    console.error('Error saving client:', error)
    // Handle server validation errors
    if (error.response?.data) {
      Object.keys(error.response.data).forEach(key => {
        if (errors.hasOwnProperty(key)) {
          errors[key] = error.response.data[key][0] || 'Validation error'
        }
      })
    }
  } finally {
    loading.value = false
  }
}

// Watch for client prop changes (for editing)
watch(() => props.client, (newClient) => {
  if (newClient) {
    isEditing.value = true
    Object.keys(form).forEach(key => {
      form[key] = newClient[key] || ''
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form when modal closes
watch(() => props.show, (newShow) => {
  if (!newShow) {
    setTimeout(() => resetForm(), 300) // Wait for modal transition
  }
})
</script>

<style scoped>
.client-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

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
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
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
  max-width: 600px;
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

.client-form {
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
