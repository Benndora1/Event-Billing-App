<template>
  <div class="app">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h1>Event Billing</h1>
      </div>
      <ul class="sidebar-nav">
        <li>
          <router-link to="/" class="nav-link">
            <span class="icon">📊</span>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/clients" class="nav-link">
            <span class="icon">👥</span>
            Clients
          </router-link>
        </li>
        <li>
          <router-link to="/quotations" class="nav-link">
            <span class="icon">📝</span>
            Quotations
          </router-link>
        </li>
        <li>
          <router-link to="/receipts" class="nav-link">
            <span class="icon">🧾</span>
            Receipts
          </router-link>
        </li>
      </ul>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { setAuthToken } from './services/api';
import { useAppStore } from './stores/appStore';
import router from './router';

export default {
  name: 'App',
  setup() {
    const store = useAppStore();

    const handleLogout = () => {
      // Clear token from localStorage and API headers
      setAuthToken(null);
      
      // Clear store data
      store.$reset();
      
      // Redirect to login page
      router.push('/login');
    };

    return {
      handleLogout
    };
  }
}
</script>

<style scoped>
.sidebar-footer {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.logout-btn i {
  font-size: 1rem;
}
</style>
