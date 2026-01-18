<template>
  <div>
    <div class="page-header">
      <h2>Dashboard</h2>
      <p>Overview of your billing system</p>
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
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';

export default {
  name: 'Dashboard',
  setup() {
    const store = useAppStore();

    onMounted(() => {
      store.fetchClients();
      store.fetchQuotations();
      store.fetchReceipts();
    });

    const totalRevenue = computed(() => {
      return store.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0);
    });

    return {
      clients: computed(() => store.clients),
      quotations: computed(() => store.quotations),
      receipts: computed(() => store.receipts),
      totalRevenue,
    };
  },
};
</script>
