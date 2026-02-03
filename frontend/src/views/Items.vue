<template>
  <div>
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>Items</h2>
          <p>Manage your service items and pricing</p>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Item
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Items List</h3>
        <button @click="refreshItems" class="btn btn-secondary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <div v-if="loading" class="loading">Loading items...</div>
      <div v-else-if="items.length === 0" class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>No items yet. Add your first service item!</p>
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" @click="openEditModal(item)" class="clickable-row">
              <td><strong>{{ item.name }}</strong></td>
              <td><strong>${{ item.unit_price }}</strong></td>
              <td>{{ item.category }}</td>
              <td @click.stop>
                <button @click="deleteItem(item.id)" class="btn btn-sm btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingItem ? 'Edit Item' : 'Add Item' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="formData.name" type="text" required class="form-input" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Price *</label>
              <input v-model="formData.unit_price" type="number" required min="0" step="0.01" class="form-input" />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="formData.category" class="form-input">
                <option value="">Select category</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="decoration">Decoration</option>
                <option value="catering">Catering</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (editingItem ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'

export default {
  name: 'Items',
  setup() {
    const store = useAppStore()
    const showModal = ref(false)
    const editingItem = ref(null)
    const loading = computed(() => store.loading)
    
    const formData = ref({
      name: '',
      unit_price: 0,
      category: ''
    })

    const items = computed(() => store.items || [])

    const openCreateModal = () => {
      editingItem.value = null
      resetForm()
      showModal.value = true
    }

    const openEditModal = (item) => {
      editingItem.value = item
      formData.value = { ...item }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingItem.value = null
      resetForm()
    }

    const resetForm = () => {
      formData.value = { name: '', unit_price: 0, category: '' }
    }

    const handleSubmit = async () => {
      try {
        if (editingItem.value) {
          await store.updateItem(editingItem.value.id, formData.value)
        } else {
          await store.createItem(formData.value)
        }
        closeModal()
        store.refreshItems()
      } catch (error) {
        alert('Error saving item')
      }
    }

    const deleteItem = async (itemId) => {
      if (!confirm('Delete this item?')) return
      try {
        await store.deleteItem(itemId)
        store.refreshItems()
      } catch (error) {
        alert('Error deleting item')
      }
    }

    const refreshItems = async () => {
      try {
        await store.refreshItems()
      } catch (error) {
        alert('Error refreshing items')
      }
    }

    onMounted(() => {
      store.refreshItems()
    })

    return {
      items,
      loading,
      showModal,
      editingItem,
      formData,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSubmit,
      deleteItem,
      refreshItems
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-overlay {
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

.modal {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--bg-tertiary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-sm {
  padding: 0.5rem;
  font-size: 0.875rem;
}
</style>
