import { defineStore } from 'pinia';
import { clientAPI, quotationAPI, receiptAPI } from '../services/api';

export const useAppStore = defineStore('app', {
    state: () => ({
        clients: [],
        quotations: [],
        receipts: [],
        items: [],
        loading: false,
        error: null,
        lastFetched: null,
    }),

    actions: {
        // Initialize store with data persistence
        async initializeStore() {
            // Check if we have valid token before fetching
            const token = localStorage.getItem('access_token');
            console.log('initializeStore called, token exists:', !!token);
            if (!token) {
                console.log('No token found, skipping data fetch');
                return;
            }

            // Set token in API headers
            const { setAuthToken } = await import('../services/api');
            setAuthToken(token);

            // Only fetch if data is stale or doesn't exist
            const now = Date.now();
            const staleTime = 5 * 60 * 1000; // 5 minutes
            
            if (!this.lastFetched || (now - this.lastFetched) > staleTime) {
                console.log('Fetching fresh data...');
                await this.fetchAllData();
            } else {
                console.log('Using cached data');
            }
        },

        // Fetch all data at once
        async fetchAllData() {
            this.loading = true;
            this.error = null;
            
            try {
                await Promise.all([
                    this.fetchClients(),
                    this.fetchQuotations(),
                    this.fetchReceipts()
                ]);
                this.lastFetched = Date.now();
                console.log('All data fetched successfully');
            } catch (error) {
                console.error('Error fetching all data:', error);
                this.error = 'Failed to load data';
            } finally {
                this.loading = false;
            }
        },

        // Client actions
        async fetchClients() {
            try {
                const response = await clientAPI.getAll();
                this.clients = response.data.results || response.data;
                console.log(`Fetched ${this.clients.length} clients`);
            } catch (error) {
                console.error('Error fetching clients:', error);
                throw error;
            }
        },

        async createClient(client) {
            this.loading = true;
            try {
                // Check if token exists before making request
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }

                const response = await clientAPI.create(client);
                this.clients.push(response.data);
                this.error = null;
                console.log('Client created successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating client:', error);
                
                // Provide more specific error messages
                if (error.response?.status === 400) {
                    throw new Error('Invalid client data. Please check all required fields.');
                } else if (error.response?.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                } else if (error.response?.status === 403) {
                    throw new Error('Permission denied. You do not have access to create clients.');
                } else {
                    throw new Error(`Failed to create client: ${error.message}`);
                }
            } finally {
                this.loading = false;
            }
        },

        async updateClient(id, client) {
            this.loading = true;
            try {
                const response = await clientAPI.update(id, client);
                const index = this.clients.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.clients[index] = response.data;
                }
                this.error = null;
                console.log('Client updated successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating client:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteClient(id) {
            this.loading = true;
            try {
                await clientAPI.delete(id);
                this.clients = this.clients.filter(c => c.id !== id);
                this.error = null;
                console.log('Client deleted successfully');
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting client:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Quotation actions
        async fetchQuotations() {
            try {
                const response = await quotationAPI.getAll();
                this.quotations = response.data.results || response.data;
                console.log(`Fetched ${this.quotations.length} quotations`);
            } catch (error) {
                console.error('Error fetching quotations:', error);
                throw error;
            }
        },

        async createQuotation(quotation) {
            this.loading = true;
            try {
                const response = await quotationAPI.create(quotation);
                this.quotations.push(response.data);
                this.error = null;
                console.log('Quotation created successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating quotation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateQuotation(id, quotation) {
            this.loading = true;
            try {
                const response = await quotationAPI.update(id, quotation);
                const index = this.quotations.findIndex(q => q.id === id);
                if (index !== -1) {
                    this.quotations[index] = response.data;
                }
                this.error = null;
                console.log('Quotation updated successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating quotation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteQuotation(id) {
            this.loading = true;
            try {
                await quotationAPI.delete(id);
                this.quotations = this.quotations.filter(q => q.id !== id);
                this.error = null;
                console.log('Quotation deleted successfully');
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting quotation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async sendQuotationEmail(id) {
            this.loading = true;
            try {
                await quotationAPI.sendEmail(id);
                this.error = null;
                console.log('Quotation email sent successfully');
            } catch (error) {
                this.error = error.message;
                console.error('Error sending quotation email:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Receipt actions
        async fetchReceipts() {
            try {
                const response = await receiptAPI.getAll();
                this.receipts = response.data.results || response.data;
                console.log(`Fetched ${this.receipts.length} receipts`);
            } catch (error) {
                console.error('Error fetching receipts:', error);
                throw error;
            }
        },

        async createReceipt(receipt) {
            this.loading = true;
            try {
                const response = await receiptAPI.create(receipt);
                this.receipts.push(response.data);
                this.error = null;
                console.log('Receipt created successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating receipt:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateReceipt(id, receipt) {
            this.loading = true;
            try {
                const response = await receiptAPI.update(id, receipt);
                const index = this.receipts.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.receipts[index] = response.data;
                }
                this.error = null;
                console.log('Receipt updated successfully');
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating receipt:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteReceipt(id) {
            this.loading = true;
            try {
                await receiptAPI.delete(id);
                this.receipts = this.receipts.filter(r => r.id !== id);
                this.error = null;
                console.log('Receipt deleted successfully');
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting receipt:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async sendReceiptEmail(id) {
            this.loading = true;
            try {
                await receiptAPI.sendEmail(id);
                this.error = null;
                console.log('Receipt email sent successfully');
            } catch (error) {
                this.error = error.message;
                console.error('Error sending receipt email:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Refresh specific data
        async refreshClients() {
            await this.fetchClients();
        },

        async refreshQuotations() {
            await this.fetchQuotations();
        },

        async refreshReceipts() {
            await this.fetchReceipts();
        },

        // Items management
        async fetchItems() {
            try {
                // Mock data for now - replace with actual API call
                const mockItems = [
                    { id: 1, name: 'Wedding Photography', description: 'Full day wedding photography coverage', unit_price: 1500, category: 'photography', status: 'active' },
                    { id: 2, name: 'Videography Package', description: 'Professional video recording and editing', unit_price: 2000, category: 'videography', status: 'active' },
                    { id: 3, name: 'Flower Decoration', description: 'Complete venue decoration with flowers', unit_price: 800, category: 'decoration', status: 'active' },
                    { id: 4, name: 'Catering Service', description: 'Full catering for 100 guests', unit_price: 3000, category: 'catering', status: 'active' },
                    { id: 5, name: 'DJ Entertainment', description: 'Professional DJ and sound system', unit_price: 1200, category: 'entertainment', status: 'active' }
                ];
                this.items = mockItems;
            } catch (error) {
                console.error('Error fetching items:', error);
                this.error = 'Failed to fetch items';
            }
        },

        async createItem(itemData) {
            try {
                // Mock create - replace with actual API call
                const newItem = {
                    id: Date.now(),
                    ...itemData,
                    created_at: new Date().toISOString()
                };
                this.items.push(newItem);
                return newItem;
            } catch (error) {
                console.error('Error creating item:', error);
                throw error;
            }
        },

        async updateItem(itemId, itemData) {
            try {
                // Mock update - replace with actual API call
                const index = this.items.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.items[index] = { ...this.items[index], ...itemData };
                    return this.items[index];
                }
                throw new Error('Item not found');
            } catch (error) {
                console.error('Error updating item:', error);
                throw error;
            }
        },

        async deleteItem(itemId) {
            try {
                // Mock delete - replace with actual API call
                const index = this.items.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.items.splice(index, 1);
                    return true;
                }
                throw new Error('Item not found');
            } catch (error) {
                console.error('Error deleting item:', error);
                throw error;
            }
        },

        async refreshItems() {
            await this.fetchItems();
        },

        // Clear all data (only for logout)
        clearAllData() {
            this.clients = [];
            this.quotations = [];
            this.receipts = [];
            this.items = [];
            this.loading = false;
            this.error = null;
            this.lastFetched = null;
            console.log('All store data cleared');
        },
    },

    getters: {
        getClientById: (state) => (id) => {
            return state.clients.find(client => client.id === id);
        },
        
        getQuotationById: (state) => (id) => {
            return state.quotations.find(quotation => quotation.id === id);
        },
        
        getReceiptById: (state) => (id) => {
            return state.receipts.find(receipt => receipt.id === id);
        },
        
        getItemById: (state) => (id) => {
            return state.items.find(item => item.id === id);
        },

        getTotalRevenue: (state) => {
            return state.receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0);
        },

        getPendingQuotations: (state) => {
            return state.quotations.filter(q => q.status === 'DRAFT' || q.status === 'SENT');
        },

        getRecentClients: (state) => {
            return state.clients
                .slice()
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
        },
    },
});
