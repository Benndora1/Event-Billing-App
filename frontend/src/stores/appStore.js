import { defineStore } from 'pinia';
import { clientAPI, quotationAPI, receiptAPI } from '../services/api';

export const useAppStore = defineStore('app', {
    state: () => ({
        clients: [],
        quotations: [],
        receipts: [],
        loading: false,
        error: null,
    }),

    actions: {
        // Client actions
        async fetchClients() {
            this.loading = true;
            try {
                const response = await clientAPI.getAll();
                this.clients = response.data.results || response.data;
                this.error = null;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching clients:', error);
            } finally {
                this.loading = false;
            }
        },

        async createClient(client) {
            this.loading = true;
            try {
                const response = await clientAPI.create(client);
                this.clients.push(response.data);
                this.error = null;
                return response.data;
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Quotation actions
        async fetchQuotations() {
            this.loading = true;
            try {
                const response = await quotationAPI.getAll();
                this.quotations = response.data.results || response.data;
                this.error = null;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching quotations:', error);
            } finally {
                this.loading = false;
            }
        },

        async createQuotation(quotation) {
            this.loading = true;
            try {
                const response = await quotationAPI.create(quotation);
                this.quotations.push(response.data);
                this.error = null;
                return response.data;
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Receipt actions
        async fetchReceipts() {
            this.loading = true;
            try {
                const response = await receiptAPI.getAll();
                this.receipts = response.data.results || response.data;
                this.error = null;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching receipts:', error);
            } finally {
                this.loading = false;
            }
        },

        async createReceipt(receipt) {
            this.loading = true;
            try {
                const response = await receiptAPI.create(receipt);
                this.receipts.push(response.data);
                this.error = null;
                return response.data;
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        getClientById: (state) => (id) => {
            return state.clients.find(client => client.id === id);
        },
    },
});
