import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Clients from '../views/Clients.vue'
import Quotations from '../views/Quotations.vue'
import Receipts from '../views/Receipts.vue'
import Login from '../views/Login.vue'
import { setAuthToken } from '../services/api'

const routes = [
    { path: '/', name: 'Dashboard', component: Dashboard },
    { path: '/clients', name: 'Clients', component: Clients },
    { path: '/quotations', name: 'Quotations', component: Quotations },
    { path: '/receipts', name: 'Receipts', component: Receipts },
    { path: '/login', name: 'Login', component: Login },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const token = localStorage.getItem('access_token');

    if (authRequired && !token) {
        return next('/login');
    }

    if (token) {
        setAuthToken(token);
    }

    next();
});

export default router;
