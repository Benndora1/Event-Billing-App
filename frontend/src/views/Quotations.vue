<template>
  <div>
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>Quotations</h2>
          <p>Create and manage event quotations</p>
        </div>
        <!-- <button @click="openCreateModal" class="btn btn-primary header-btn">
          <i class="fas fa-plus"></i> Create Quotation
        </button> -->
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Quotation List</h3>
        <div class="header-actions">
          <button @click="openCreateModal" class="btn btn-primary">
            <i class="fas fa-plus"></i> Create Quotation
          </button>
          <button @click="refreshAllData" class="btn btn-secondary">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button @click="printSelectedQuotations" class="btn btn-outline">
            <i class="fas fa-print"></i> Print Selected
          </button>
          <button @click="downloadSelectedPDFs" class="btn btn-outline">
            <i class="fas fa-file-pdf"></i> Download PDFs
          </button>
          <button @click="shareSelectedQuotations" class="btn btn-outline">
            <i class="fas fa-share"></i> Share Selected
          </button>
          <button @click="exportAllQuotations" class="btn btn-outline">
            <i class="fas fa-download"></i> Export All
          </button>
        </div>
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
              <th>Select</th>
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
              :class="{ 'active-row': editingQuotation?.id === quotation.id, 'selected-row': selectedQuotations.includes(quotation.id) }"
              @click="openEditModal(quotation)"
              class="clickable-row"
            >
              <td @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedQuotations.includes(quotation.id)"
                  @change="toggleQuotationSelection(quotation.id)"
                  class="quotation-checkbox"
                />
              </td>
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Custom Add Quotation Modal -->
    <div v-if="showAddModal" class="custom-modal-overlay" @click.self="closeAddModal">
      <div class="custom-modal compact-modal">
        <div class="modal-header">
          <h3>Create Quotation</h3>
          <button class="close-btn" @click="closeAddModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddQuotation" class="compact-form">
          <div class="form-row">
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
              <label for="valid-until">Valid Until *</label>
              <input
                id="valid-until"
                v-model="newQuotation.valid_until"
                type="date"
                required
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="terms">Terms</label>
            <textarea
              id="terms"
              v-model="newQuotation.terms"
              placeholder="Payment terms and conditions..."
              class="form-input"
              rows="2"
            ></textarea>
          </div>
          
          <div class="items-section">
            <div class="section-header">
              <h4>Items</h4>
              <button type="button" @click="addItem" class="btn btn-sm btn-secondary">
                <i class="fas fa-plus"></i> Add Item
              </button>
            </div>
            
            <div class="compact-items">
              <div v-for="(item, index) in newQuotation.items" :key="index" class="compact-item-row">
                <div class="item-inputs">
                  <input
                    v-model="item.description"
                    type="text"
                    required
                    placeholder="Item description"
                    class="form-input item-desc"
                  />
                  <input
                    v-model="item.quantity"
                    type="number"
                    required
                    min="1"
                    placeholder="Qty"
                    class="form-input item-qty"
                  />
                  <input
                    v-model="item.unit_price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    class="form-input item-price"
                  />
                  <input
                    :value="(item.quantity * item.unit_price).toFixed(2)"
                    type="text"
                    readonly
                    class="form-input item-total"
                  />
                </div>
                <button
                  v-if="newQuotation.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="btn btn-sm btn-danger"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
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

    <!-- Edit Quotation Modal -->
    <div v-if="showEditModal" class="custom-modal-overlay" @click.self="closeEditModal">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>Edit Quotation</h3>
          <button class="close-btn" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleEditQuotation" class="add-quotation-form">
          <div class="form-section">
            <h4>Quotation Details</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="edit-client">Client *</label>
                <select
                  id="edit-client"
                  v-model="editingQuotation.client_id"
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
                <label for="edit-valid-until">Valid Until *</label>
                <input
                  id="edit-valid-until"
                  v-model="editingQuotation.valid_until"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label for="edit-terms">Terms</label>
              <textarea
                id="edit-terms"
                v-model="editingQuotation.terms"
                placeholder="Payment terms and conditions..."
                class="form-input"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Items</h4>
            <div class="items-section">
              <div v-for="(item, index) in editingQuotation.items" :key="index" class="item-row">
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
                  v-if="editingQuotation.items.length > 1"
                  type="button"
                  @click="removeEditItem(index)"
                  class="btn btn-danger btn-sm"
                >
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
              
              <button
                type="button"
                @click="addEditItem"
                class="btn btn-secondary"
              >
                <i class="fas fa-plus"></i> Add Item
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Quotation' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Quotation Modal -->
    <div v-if="showViewModal" class="view-modal-overlay" @click.self="closeViewModal">
      <div class="view-modal">
        <div class="modal-header">
          <div class="header-content">
            <h3>Quotation #{{ viewQuotation?.quotation_number }}</h3>
            <span :class="['badge', `badge-${getStatusBadge(viewQuotation?.status)}`]">
              {{ viewQuotation?.status }}
            </span>
          </div>
          <button class="close-btn" @click="closeViewModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="quotation-details">
          <!-- Client Information -->
          <div class="detail-section">
            <h4><i class="fas fa-user"></i> Client Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ viewQuotation?.client_name }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ viewQuotation?.client_email || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>{{ viewQuotation?.client_phone || 'N/A' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Quotation Details -->
          <div class="detail-section">
            <h4><i class="fas fa-file-invoice"></i> Quotation Details</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Date:</label>
                <span>{{ viewQuotation?.date }}</span>
              </div>
              <div class="detail-item">
                <label>Valid Until:</label>
                <span>{{ viewQuotation?.valid_until }}</span>
              </div>
            </div>
          </div>
          
          <!-- Items Breakdown -->
          <div class="detail-section">
            <h4><i class="fas fa-list"></i> Items</h4>
            <div class="items-table-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in viewQuotation?.items" :key="index">
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>${{ item.unit_price }}</td>
                    <td>${{ (item.quantity * item.unit_price).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Terms & Conditions -->
          <div class="detail-section" v-if="viewQuotation?.terms">
            <h4><i class="fas fa-file-contract"></i> Terms & Conditions</h4>
            <div class="terms-content">
              {{ viewQuotation.terms }}
            </div>
          </div>
          
          <!-- Total Summary -->
          <div class="detail-section total-section">
            <div class="total-row">
              <span class="total-label">Total Amount:</span>
              <span class="total-amount">${{ viewQuotation?.total }}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="modal-actions">
          <button @click="openEditModal(viewQuotation)" class="btn btn-primary">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button @click="sendEmail(viewQuotation.id)" class="btn btn-secondary">
            <i class="fas fa-envelope"></i> Send Email
          </button>
          <button @click="printQuotation" class="btn btn-outline">
            <i class="fas fa-print"></i> Print
          </button>
          <button @click="exportToPDF" class="btn btn-outline">
            <i class="fas fa-file-pdf"></i> Export PDF
          </button>
          <button @click="shareQuotation" class="btn btn-outline">
            <i class="fas fa-share"></i> Share
          </button>
          <button @click="closeViewModal" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
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
    const showViewModal = ref(false)
    const viewQuotation = ref(null)
    const selectedQuotations = ref([])
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

    // Store is initialized globally in App.vue
    // No need to initialize here

    const openCreateModal = () => {
      showAddModal.value = true
    }

    const openEditModal = (quotation) => {
      // Create a deep copy to avoid direct mutation of the original
      editingQuotation.value = JSON.parse(JSON.stringify(quotation))
      showEditModal.value = true
    }

    const openViewModal = (quotation) => {
      viewQuotation.value = quotation
      showViewModal.value = true
    }

    const closeViewModal = () => {
      showViewModal.value = false
      viewQuotation.value = null
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

    // Edit modal item functions
    const addEditItem = () => {
      if (!editingQuotation.value.items) {
        editingQuotation.value.items = []
      }
      editingQuotation.value.items.push({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      })
    }

    const removeEditItem = (index) => {
      editingQuotation.value.items.splice(index, 1)
    }

    const handleAddQuotation = async () => {
      try {
        await store.createQuotation(newQuotation.value)
        closeAddModal()
        store.refreshQuotations()
      } catch (error) {
        alert('Error creating quotation')
      }
    }

    const handleEditQuotation = async () => {
      try {
        await store.updateQuotation(editingQuotation.value.id, editingQuotation.value)
        closeEditModal()
        store.refreshQuotations()
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
      store.refreshQuotations()
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
        case 'converted':
          return 'secondary'
        default:
          return 'secondary'
      }
    }

    // Phase 3: Advanced Features
    const printQuotation = () => {
      if (!viewQuotation.value) return
      
      const printWindow = window.open('', '_blank')
      const quotationContent = generatePrintContent(viewQuotation.value)
      printWindow.document.write(quotationContent)
      printWindow.document.close()
      printWindow.print()
    }

    // Direct action functions for table hover actions
    const printQuotationDirect = (quotation) => {
      const printWindow = window.open('', '_blank')
      const quotationContent = generatePrintContent(quotation)
      printWindow.document.write(quotationContent)
      printWindow.document.close()
      printWindow.print()
    }

    const shareQuotationDirect = async (quotation) => {
      const shareUrl = `${window.location.origin}/quotations/${quotation.id}`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Quotation #${quotation.quotation_number}`,
            text: `View quotation for ${quotation.client_name}`,
            url: shareUrl
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl)
          alert('Quotation link copied to clipboard!')
        } catch (error) {
          alert('Could not copy link')
        }
      }
    }

    const exportToPDFDirect = async (quotation) => {
      alert('PDF export feature would be implemented here with a library like jsPDF')
    }

    // Convert quotation to receipt
    const convertToReceipt = async (quotation) => {
      if (!confirm(`Are you sure you want to convert quotation #${quotation.quotation_number} to a receipt?`)) {
        return
      }

      try {
        // Create receipt data from quotation
        const receiptData = {
          client_id: quotation.client_id,
          client_name: quotation.client_name,
          client_email: quotation.client_email,
          client_phone: quotation.client_phone,
          date: new Date().toISOString().split('T')[0], // Today's date
          quotation_number: quotation.quotation_number,
          items: quotation.items || [],
          total: quotation.total,
          terms: quotation.terms || '',
          status: 'paid', // Default to paid since it's converted from quote
          notes: `Converted from quotation #${quotation.quotation_number}`
        }

        // Create the receipt
        await store.createReceipt(receiptData)
        
        // Update quotation status to 'converted'
        await store.updateQuotation(quotation.id, { ...quotation, status: 'converted' })
        
        alert(`Successfully converted quotation #${quotation.quotation_number} to a receipt!`)
        
        // Refresh data
        store.refreshQuotations()
        store.refreshReceipts()
        
      } catch (error) {
        console.error('Error converting quotation to receipt:', error)
        alert('Failed to convert quotation to receipt. Please try again.')
      }
    }

    // Header action functions
    const refreshAllData = async () => {
      try {
        await store.refreshQuotations()
        alert('Quotations refreshed successfully!')
      } catch (error) {
        console.error('Error refreshing quotations:', error)
        alert('Failed to refresh quotations. Please try again.')
      }
    }

    const exportAllQuotations = async () => {
      try {
        // Create CSV content
        const headers = ['Quotation Number', 'Client', 'Date', 'Valid Until', 'Total', 'Status']
        const rows = quotations.value.map(q => [
          q.quotation_number,
          q.client_name,
          q.date,
          q.valid_until,
          q.total,
          q.status
        ])
        
        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n')
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quotations_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        
        alert('Quotations exported successfully!')
      } catch (error) {
        console.error('Error exporting quotations:', error)
        alert('Failed to export quotations. Please try again.')
      }
    }

    // Selection functions
    const toggleQuotationSelection = (quotationId) => {
      const index = selectedQuotations.value.indexOf(quotationId)
      if (index > -1) {
        selectedQuotations.value.splice(index, 1)
      } else {
        selectedQuotations.value.push(quotationId)
      }
    }

    const getSelectedQuotationsData = () => {
     // return quotations.value.filter(q => selectedQuotations.value.includes(q.id))
     return store.quotations.filter(q => selectedQuotations.value.includes(q.id))
    }

    // New header action functions for selected quotations
    const printSelectedQuotations = () => {
      const selected = getSelectedQuotationsData()
      if (selected.length === 0) {
        alert('Please select at least one quotation to print.')
        return
      }

      selected.forEach(quotation => {
        const printWindow = window.open('', '_blank')
        const quotationContent = generatePrintContent(quotation)
        printWindow.document.write(quotationContent)
        printWindow.document.close()
        printWindow.print()
      })
    }

    const downloadSelectedPDFs = async () => {
      const selected = getSelectedQuotationsData()
      if (selected.length === 0) {
        alert('Please select at least one quotation to download as PDF.')
        return
      }

      alert(`PDF download feature would be implemented here for ${selected.length} quotation(s). This would use a library like jsPDF to generate professional PDF documents.`)
    }

    const shareSelectedQuotations = async () => {
      const selected = getSelectedQuotationsData()
      if (selected.length === 0) {
        alert('Please select at least one quotation to share.')
        return
      }

      const shareUrls = selected.map(q => `${window.location.origin}/quotations/${q.id}`)
      const shareText = `View ${selected.length} quotation(s):\n${shareUrls.join('\n')}`

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${selected.length} Quotation(s)`,
            text: shareText
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText)
          alert(`Links to ${selected.length} quotation(s) copied to clipboard!`)
        } catch (error) {
          alert('Could not copy links')
        }
      }
    }

    const generatePrintContent = (quotation) => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quotation #${quotation.quotation_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quotation #${quotation.quotation_number}</h1>
            <p>Date: ${quotation.date} | Valid Until: ${quotation.valid_until}</p>
          </div>
          
          <div class="section">
            <h3>Client Information</h3>
            <p><strong>Name:</strong> ${quotation.client_name}</p>
            <p><strong>Email:</strong> ${quotation.client_email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${quotation.client_phone || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h3>Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.items?.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unit_price}</td>
                    <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Terms & Conditions</h3>
            <p>${quotation.terms || 'No terms specified'}</p>
          </div>
          
          <div class="section total">
            <h3>Total Amount: $${quotation.total}</h3>
          </div>
        </body>
        </html>
      `
    }

    const exportToPDF = async () => {
      if (!viewQuotation.value) return
      
      // For a real implementation, you'd use a library like jsPDF or html2canvas
      // For now, we'll create a simplified version
      alert('PDF export feature would be implemented here with a library like jsPDF')
    }

    const shareQuotation = async () => {
      if (!viewQuotation.value) return
      
      const shareUrl = `${window.location.origin}/quotations/${viewQuotation.value.id}`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Quotation #${viewQuotation.value.quotation_number}`,
            text: `View quotation for ${viewQuotation.value.client_name}`,
            url: shareUrl
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl)
          alert('Quotation link copied to clipboard!')
        } catch (error) {
          alert('Could not copy link')
        }
      }
    }

    return {
      quotations: computed(() => store.quotations),
      clients: computed(() => store.clients),
      loading: computed(() => store.loading),
      editingQuotation,
      showAddModal,
      showEditModal,
      showViewModal,
      viewQuotation,
      selectedQuotations,
      newQuotation,
      openCreateModal,
      openEditModal,
      openViewModal,
      closeAddModal,
      closeEditModal,
      closeViewModal,
      handleAddQuotation,
      handleEditQuotation,
      sendEmail,
      deleteQuotation,
      showActions,
      hideActions,
      addItem,
      removeItem,
      addEditItem,
      removeEditItem,
      getStatusBadge,
      // Phase 3: Advanced Features
      printQuotation,
      exportToPDF,
      shareQuotation,
      // Direct action functions for table
      printQuotationDirect,
      shareQuotationDirect,
      exportToPDFDirect,
      convertToReceipt,
      // Header action functions
      refreshAllData,
      exportAllQuotations,
      // Selection functions
      toggleQuotationSelection,
      getSelectedQuotationsData,
      // Selected quotation actions
      printSelectedQuotations,
      downloadSelectedPDFs,
      shareSelectedQuotations,
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

.selected-row {
  background-color: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
}

.quotation-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-primary);
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

/* Table Actions - Always Visible */
.table-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.table-actions .action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  padding: 0;
}

.table-actions .action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-actions .action-btn i {
  font-size: 0.875rem;
}

.table-actions .view-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.table-actions .edit-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.table-actions .print-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
}

.table-actions .email-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.table-actions .share-btn:hover {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  color: #06b6d4;
}

.table-actions .pdf-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
  color: #dc2626;
}

.table-actions .convert-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.table-actions .delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Remove old hover actions since we're using table actions */
.actions-container {
  display: none; /* Hide the old hover actions */
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
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.compact-modal {
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.compact-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.compact-items {
  max-height: 300px;
  overflow-y: auto;
}

.compact-item-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.item-inputs {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0.5rem;
  flex: 1;
}

.item-desc {
  grid-column: 1;
}

.item-qty {
  grid-column: 2;
}

.item-price {
  grid-column: 3;
}

.item-total {
  grid-column: 4;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  font-weight: 600;
}

/* Responsive compact modal */
@media (max-width: 768px) {
  .compact-modal {
    max-width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .item-inputs {
    grid-template-columns: 1fr;
  }
  
  .compact-item-row {
    flex-direction: column;
  }
  
  .item-desc,
  .item-qty,
  .item-price,
  .item-total {
    grid-column: 1;
  }
}

/* Card Styles */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

/* Card Header with Actions */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  flex-wrap: wrap;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.header-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-decoration: none;
  white-space: nowrap;
}

.header-actions .btn i {
  font-size: 0.875rem;
}

.header-actions .btn-primary {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.header-actions .btn-primary:hover {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
}

.header-actions .btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.header-actions .btn-secondary:hover {
  background: var(--bg-primary);
  border-color: rgba(255, 255, 255, 0.3);
}

.header-actions .btn-outline {
  background: transparent;
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.header-actions .btn-outline:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Responsive Card Header */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .header-actions .btn {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* View Modal Styles */
.view-modal-overlay {
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

.view-modal {
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

.view-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--bg-tertiary);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.quotation-details {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-section h4 i {
  color: var(--accent-primary);
  font-size: 0.875rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.detail-item span {
  color: var(--text-primary);
  font-weight: 600;
}

.items-table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
}

.items-table th {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.items-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.items-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.terms-content {
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.total-section {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
  border: none !important;
  color: white !important;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.total-label {
  color: rgba(255, 255, 255, 0.9);
}

.total-amount {
  color: white;
  font-size: 1.5rem;
}

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

.header-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

.header-btn i {
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--bg-tertiary);
  flex-wrap: wrap;
}

.modal-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-decoration: none;
}

.modal-actions .btn-primary {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.modal-actions .btn-primary:hover {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
}

.modal-actions .btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-actions .btn-secondary:hover {
  background: var(--bg-primary);
  border-color: rgba(255, 255, 255, 0.3);
}

.modal-actions .btn-outline {
  background: transparent;
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-actions .btn-outline:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Responsive Header */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-btn {
    justify-content: center;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .view-modal {
    width: 95%;
    margin: 1rem;
    max-height: 95vh;
    justify-content: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    justify-content: center;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-btn {
    justify-content: center;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .items-table-container {
    font-size: 0.875rem;
  }
  
  .items-table th,
  .items-table td {
    padding: 0.5rem;
  }
}
</style>
