<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Overview of your billing system</p>
      </div>
      <div class="date-info">
        <span class="current-date">{{ currentDate }}</span>
      </div>
    </div>

    <!-- Statistics Grid -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>Total Clients</h3>
          <div class="value">{{ clients.length }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ newClientsThisMonth }} this month
          </div>
        </div>
      </div>

      <div class="stat-card secondary">
        <div class="stat-icon">
          <i class="fas fa-file-invoice"></i>
        </div>
        <div class="stat-content">
          <h3>Quotations</h3>
          <div class="value">{{ quotations.length }}</div>
          <div class="stat-change neutral">
            <i class="fas fa-minus"></i>
            {{ pendingQuotations }} pending
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="stat-content">
          <h3>Receipts</h3>
          <div class="value">{{ receipts.length }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ receiptsThisMonth }} this month
          </div>
        </div>
      </div>

      <div class="stat-card accent">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>Total Revenue</h3>
          <div class="value">${{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +${{ revenueThisMonth.toFixed(2) }} this month
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Recent Activities -->
    <div class="dashboard-grid">
      <!-- Revenue Chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h3>Revenue Overview</h3>
          <div class="chart-controls">
            <button @click="setChartPeriod('week')" :class="{ active: chartPeriod === 'week' }">Week</button>
            <button @click="setChartPeriod('month')" :class="{ active: chartPeriod === 'month' }">Month</button>
            <button @click="setChartPeriod('year')" :class="{ active: chartPeriod === 'year' }">Year</button>
          </div>
        </div>
        <div class="chart-container">
          <div class="simple-chart">
            <div class="chart-bars">
              <div v-for="(bar, index) in chartData" :key="index" class="bar-container">
                <div class="bar" :style="{ height: bar.height + '%' }"></div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card activity-card">
        <div class="card-header">
          <h3>Recent Activities</h3>
          <router-link to="/clients" class="view-all">View All</router-link>
        </div>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
          <div v-if="recentActivities.length === 0" class="no-activities">
            <i class="fas fa-inbox"></i>
            <p>No recent activities</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions and Top Clients -->
    <div class="dashboard-grid">
      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div class="quick-actions">
          <router-link to="/clients" class="action-btn">
            <div class="action-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="action-content">
              <h4>Add Client</h4>
              <p>Create a new client profile</p>
            </div>
          </router-link>
          <router-link to="/quotations" class="action-btn">
            <div class="action-icon">
              <i class="fas fa-file-plus"></i>
            </div>
            <div class="action-content">
              <h4>Create Quotation</h4>
              <p>Generate new quotation</p>
            </div>
          </router-link>
          <router-link to="/receipts" class="action-btn">
            <div class="action-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="action-content">
              <h4>Create Receipt</h4>
              <p>Record new payment</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Top Clients -->
      <div class="card">
        <div class="card-header">
          <h3>Top Clients</h3>
          <router-link to="/clients" class="view-all">View All</router-link>
        </div>
        <div class="top-clients">
          <div v-for="client in topClients" :key="client.id" class="client-item">
            <div class="client-avatar">
              {{ client.name.charAt(0).toUpperCase() }}
            </div>
            <div class="client-info">
              <div class="client-name">{{ client.name }}</div>
              <div class="client-revenue">${{ client.totalRevenue.toFixed(2) }}</div>
            </div>
            <div class="client-badge">
              {{ client.quotationCount }} quotes
            </div>
          </div>
          <div v-if="topClients.length === 0" class="no-clients">
            <i class="fas fa-users"></i>
            <p>No clients yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onActivated, ref } from 'vue';
import { useAppStore } from '../stores/appStore';

export default {
  name: 'Dashboard',
  setup() {
    const store = useAppStore();
    const chartPeriod = ref('month');

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

    // Current date
    const currentDate = computed(() => {
      return new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });

    // Basic statistics
    const totalRevenue = computed(() => {
      return store.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0);
    });

    // Monthly statistics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const newClientsThisMonth = computed(() => {
      return store.clients.filter(client => {
        const createdAt = new Date(client.created_at);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      }).length;
    });

    const receiptsThisMonth = computed(() => {
      return store.receipts.filter(receipt => {
        const createdAt = new Date(receipt.created_at);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      }).length;
    });

    const revenueThisMonth = computed(() => {
      return store.receipts
        .filter(receipt => {
          const createdAt = new Date(receipt.created_at);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        })
        .reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0);
    });

    const pendingQuotations = computed(() => {
      return store.quotations.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length;
    });

    // Chart data
    const chartData = computed(() => {
      const periods = {
        week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        month: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      };

      return periods[chartPeriod.value].map((label, index) => ({
        label,
        height: Math.random() * 80 + 20 // Mock data - replace with real calculations
      }));
    });

    const setChartPeriod = (period) => {
      chartPeriod.value = period;
    };

    // Recent activities (mock data - replace with real data)
    const recentActivities = computed(() => {
      const activities = [];
      
      // Add recent clients
      store.clients.slice(-3).forEach(client => {
        activities.push({
          id: `client-${client.id}`,
          type: 'client',
          icon: 'fas fa-user-plus',
          title: 'New Client Added',
          description: `${client.name} has been added to the system`,
          time: formatTime(client.created_at)
        });
      });

      // Add recent quotations
      store.quotations.slice(-3).forEach(quotation => {
        activities.push({
          id: `quotation-${quotation.id}`,
          type: 'quotation',
          icon: 'fas fa-file-invoice',
          title: 'Quotation Created',
          description: `Quotation #${quotation.quotation_number} for ${quotation.client_name}`,
          time: formatTime(quotation.created_at)
        });
      });

      // Add recent receipts
      store.receipts.slice(-3).forEach(receipt => {
        activities.push({
          id: `receipt-${receipt.id}`,
          type: 'receipt',
          icon: 'fas fa-receipt',
          title: 'Payment Received',
          description: `Receipt #${receipt.receipt_number} - $${receipt.total}`,
          time: formatTime(receipt.created_at)
        });
      });

      return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    });

    // Top clients by revenue
    const topClients = computed(() => {
      const clientRevenue = {};
      
      // Calculate revenue per client
      store.receipts.forEach(receipt => {
        if (!clientRevenue[receipt.client]) {
          clientRevenue[receipt.client] = {
            id: receipt.client,
            totalRevenue: 0,
            quotationCount: 0
          };
        }
        clientRevenue[receipt.client].totalRevenue += parseFloat(receipt.total || 0);
      });

      // Count quotations per client
      store.quotations.forEach(quotation => {
        if (!clientRevenue[quotation.client]) {
          clientRevenue[quotation.client] = {
            id: quotation.client,
            totalRevenue: 0,
            quotationCount: 0
          };
        }
        clientRevenue[quotation.client].quotationCount++;
      });

      // Get client names and sort by revenue
      return Object.entries(clientRevenue)
        .map(([clientId, data]) => ({
          ...data,
          name: store.clients.find(c => c.id === parseInt(clientId))?.name || 'Unknown Client'
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
    });

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    };

    return {
      clients: computed(() => store.clients),
      quotations: computed(() => store.quotations),
      receipts: computed(() => store.receipts),
      totalRevenue,
      currentDate,
      newClientsThisMonth,
      receiptsThisMonth,
      revenueThisMonth,
      pendingQuotations,
      chartPeriod,
      chartData,
      setChartPeriod,
      recentActivities,
      topClients,
    };
  },
};
</script>

<style scoped>
.dashboard {
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

.date-info {
  text-align: right;
}

.current-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.stat-card.primary::before { background: var(--gradient-primary); }
.stat-card.secondary::before { background: var(--gradient-secondary); }
.stat-card.success::before { background: var(--gradient-success); }
.stat-card.accent::before { background: var(--gradient-accent); }

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
}

.stat-card.primary .stat-icon { background: rgba(139, 92, 246, 0.1); color: var(--accent-primary); }
.stat-card.secondary .stat-icon { background: rgba(59, 130, 246, 0.1); color: var(--accent-secondary); }
.stat-card.success .stat-icon { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.stat-card.accent .stat-icon { background: rgba(236, 72, 153, 0.1); color: var(--accent-accent); }

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-content .value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive { color: var(--success); }
.stat-change.neutral { color: var(--text-secondary); }
.stat-change.negative { color: var(--danger); }

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Cards */
.card {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-all {
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: var(--accent-secondary);
}

/* Chart Controls */
.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.chart-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.chart-controls button.active {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}

/* Simple Chart */
.chart-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.simple-chart {
  width: 100%;
  height: 100%;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 0.5rem;
}

.bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.bar {
  width: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: all 0.3s ease;
  min-height: 5px;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Activity List */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.activity-icon.client { background: rgba(139, 92, 246, 0.1); color: var(--accent-primary); }
.activity-icon.quotation { background: rgba(59, 130, 246, 0.1); color: var(--accent-secondary); }
.activity-icon.receipt { background: rgba(16, 185, 129, 0.1); color: var(--success); }

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

.no-activities {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-activities i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.action-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Top Clients */
.top-clients {
  max-height: 300px;
  overflow-y: auto;
}

.client-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.client-item:last-child {
  border-bottom: none;
}

.client-avatar {
  width: 45px;
  height: 45px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.client-info {
  flex: 1;
}

.client-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.client-revenue {
  font-size: 0.9rem;
  color: var(--success);
  font-weight: 500;
}

.client-badge {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.no-clients {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-clients i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-info {
    text-align: left;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .stat-content .value {
    font-size: 1.5rem;
  }

  .card {
    padding: 1rem;
  }

  .chart-container {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.5rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .action-btn {
    flex-direction: column;
    text-align: center;
  }

  .client-item {
    flex-direction: column;
    text-align: center;
  }
}

/* Scrollbar Styling */
.activity-list::-webkit-scrollbar,
.top-clients::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track,
.top-clients::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb,
.top-clients::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover,
.top-clients::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
