import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Clients from '../views/Clients.vue'
import Quotations from '../views/Quotations.vue'
import Items from '../views/Items.vue'
import Receipts from '../views/Receipts.vue'
import Login from '../views/Login.vue'
import { setAuthToken } from '../services/api'

const routes = [
    { path: '/', name: 'Login', component: Login },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/clients', name: 'Clients', component: Clients },
    { path: '/quotations', name: 'Quotations', component: Quotations },
    { path: '/items', name: 'Items', component: Items },
    { path: '/receipts', name: 'Receipts', component: Receipts },
    { path: '/login', redirect: '/' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
    const publicPages = ['/'];
    const authRequired = !publicPages.includes(to.path);
    const token = localStorage.getItem('access_token');

    console.log('Router guard - navigating to:', to.path);
    console.log('Router guard - token exists:', !!token);
    console.log('Router guard - auth required:', authRequired);

    if (authRequired && !token) {
        console.log('Router guard - redirecting to login (no token)');
        return next('/');
    }

    if (token && to.path === '/') {
        console.log('Router guard - redirecting to dashboard (has token)');
        return next('/dashboard');
    }

    if (token) {
        setAuthToken(token);
    }

    next();
});

export default router;
