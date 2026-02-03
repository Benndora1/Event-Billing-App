<template>
  <div class="items-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>Items</h2>
          <p>Manage your service items and pricing</p>
        </div>
      </div>
    </div>

    <!-- Categories Overview -->
    <div class="categories-grid">
      <div class="category-card" v-for="category in categories" :key="category.name">
        <div class="category-header">
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            <i :class="category.icon"></i>
          </div>
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} items</p>
          </div>
        </div>
        <div class="category-stats">
          <div class="stat">
            <span class="label">Avg Price</span>
            <span class="value">${{ category.avgPrice }}</span>
          </div>
          <div class="stat">
            <span class="label">Total Value</span>
            <span class="value">${{ category.totalValue }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Card -->
    <div class="card">
      <div class="card-header">
        <h3>All Items ({{ items.length }})</h3>
        <div class="header-actions">
          <button @click="openCreateModal" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Item
          </button>
          <button @click="refreshItems" class="btn btn-secondary">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
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
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="clickable-row">
              <td><strong>{{ item.name }}</strong></td>
              <td>{{ item.description || '-' }}</td>
              <td><strong>${{ item.unit_price }}</strong></td>
              <td>
                <span class="category-badge" :style="{ backgroundColor: getCategoryColor(item.category) }">
                  {{ item.category }}
                </span>
              </td>
              <td>
                <span :class="['badge', `badge-${getStatusBadge(item.status)}`]">
                  {{ item.status }}
                </span>
              </td>
              <td @click.stop>
                <div class="table-actions">
                  <button @click="openEditModal(item)" class="action-btn edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteItem(item.id)" class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Item Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>Item Name *</label>
              <input v-model="formData.name" type="text" required placeholder="e.g., Wedding Photography" class="form-input" />
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select v-model="formData.category" required class="form-input">
                <option value="">Select category</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="decoration">Decoration</option>
                <option value="catering">Catering</option>
                <option value="entertainment">Entertainment</option>
                <option value="venue">Venue</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" placeholder="Detailed description..." class="form-input" rows="3"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Unit Price *</label>
              <input v-model="formData.unit_price" type="number" required min="0" step="0.01" placeholder="0.00" class="form-input" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="formData.status" class="form-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item') }}
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
      description: '',
      unit_price: 0,
      category: '',
      status: 'active'
    })

    const items = computed(() => store.items || [])

    // Categories configuration
    const categoryConfig = {
      photography: { icon: 'fas fa-camera', color: '#3b82f6' },
      videography: { icon: 'fas fa-video', color: '#8b5cf6' },
      decoration: { icon: 'fas fa-palette', color: '#f59e0b' },
      catering: { icon: 'fas fa-utensils', color: '#10b981' },
      entertainment: { icon: 'fas fa-music', color: '#ef4444' },
      venue: { icon: 'fas fa-building', color: '#6b7280' },
      transport: { icon: 'fas fa-car', color: '#06b6d4' },
      other: { icon: 'fas fa-box', color: '#8b5cf6' }
    }

    const categories = computed(() => {
      const categoryStats = {}
      
      // Initialize categories
      Object.keys(categoryConfig).forEach(cat => {
        categoryStats[cat] = {
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: categoryConfig[cat].icon,
          color: categoryConfig[cat].color,
          count: 0,
          avgPrice: 0,
          totalValue: 0,
          items: []
        }
      })

      // Calculate statistics
      items.value.forEach(item => {
        const category = item.category || 'other'
        if (categoryStats[category]) {
          categoryStats[category].count++
          categoryStats[category].totalValue += parseFloat(item.unit_price || 0)
          categoryStats[category].items.push(item)
        }
      })

      // Calculate average prices
      Object.keys(categoryStats).forEach(cat => {
        if (categoryStats[cat].count > 0) {
          categoryStats[cat].avgPrice = (categoryStats[cat].totalValue / categoryStats[cat].count).toFixed(2)
        }
        categoryStats[cat].totalValue = categoryStats[cat].totalValue.toFixed(2)
      })

      return Object.values(categoryStats).filter(cat => cat.count > 0)
    })

    const getCategoryColor = (category) => {
      return categoryConfig[category]?.color || categoryConfig.other.color
    }

    const getStatusBadge = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return 'success'
        case 'inactive':
          return 'danger'
        default:
          return 'secondary'
      }
    }

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
      formData.value = {
        name: '',
        description: '',
        unit_price: 0,
        category: '',
        status: 'active'
      }
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
      categories,
      loading,
      showModal,
      editingItem,
      formData,
      getCategoryColor,
      getStatusBadge,
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
/* Page Header */
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

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.category-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.category-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.category-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.category-stats {
  display: flex;
  gap: 2rem;
}

.category-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-stats .label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.category-stats .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-stats {
    gap: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.items-page {
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
