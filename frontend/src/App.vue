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
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>
