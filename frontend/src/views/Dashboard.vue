<template>
  <!-- Page Header -->
  <div class="page-header">
    <div>
      <h2>Dashboard</h2>
      <p>Overview of your billing system</p>
    </div>
    <div class="header-actions">
      <button @click="handleLogout" class="btn btn-logout">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Clients</h3>
        <div class="value">{{ clients.length }}</div>
      </div>
      <div class="stat-card">
        <h3>Quotations</h3>
        <div class="value">{{ quotations.length }}</div>
      </div>
      <div class="stat-card">
        <h3>Receipts</h3>
        <div class="value">{{ receipts.length }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <div class="value">${{ totalRevenue.toFixed(2) }}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Quick Actions</h3>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <router-link to="/clients" class="btn btn-primary">Add Client</router-link>
      <router-link to="/quotations" class="btn btn-primary">Create Quotation</router-link>
      <router-link to="/receipts" class="btn btn-primary">Create Receipt</router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onActivated } from 'vue';
import { useAppStore } from '../stores/appStore';
import { setAuthToken, getAuthToken } from '../services/api';
import router from '../router';

export default {
  name: 'Dashboard',
  setup() {
    const store = useAppStore();

    onMounted(() => {
      store.fetchClients();
      store.fetchQuotations();
      store.fetchReceipts();
    });

    onActivated(() => {
      store.fetchClients();
      store.fetchQuotations();
      store.fetchReceipts();
    });

    const totalRevenue = computed(() => {
      return store.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0);
    });

    const handleLogout = () => {
      // Clear token from localStorage and API headers
      setAuthToken(null);
      
      // Clear store data
      store.$reset();
      
      // Redirect to login page
      router.push('/login');
    };

    return {
      clients: computed(() => store.clients),
      quotations: computed(() => store.quotations),
      receipts: computed(() => store.receipts),
      totalRevenue,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-logout {
  background: var(--gradient-danger);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow-danger);
}
</style>
