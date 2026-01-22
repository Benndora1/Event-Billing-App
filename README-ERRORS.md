# Event Company Billing System - Error Documentation

## 🚨 Common Errors & Solutions

This document outlines all common errors encountered in the Event Company Billing System and their solutions.

---

## 🔐 401 Unauthorized Authentication Errors

### **Error Description**
```
GET http://localhost:8000/api/clients/ 401 (Unauthorized)
GET http://localhost:8000/api/quotations/ 401 (Unauthorized) 
GET http://localhost:8000/api/receipts/ 401 (Unauthorized)
```

### **Root Cause**
- No JWT (JSON Web Token) present in localStorage
- User is not authenticated/logged in
- API endpoints require authentication for access

### **Solution Steps**
1. **Navigate to Login Page**
   ```
   http://localhost:3000/login
   ```

2. **Log In or Register**
   - **Existing Users**: Enter username and password
   - **New Users**: Click "Register" and create account

3. **Automatic Token Storage**
   - JWT token automatically stored in localStorage
   - All subsequent API requests include Authorization header
   - 401 errors will be resolved

### **Technical Details**
- **Token Storage**: `localStorage.getItem('access_token')`
- **API Headers**: `Authorization: Bearer <token>`
- **Router Protection**: Redirects to `/login` if no token exists

---

## 🎨 Font Awesome CDN Integrity Error

### **Error Description**
```
Failed to find a valid digest in 'integrity' attribute for resource 
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' 
with computed SHA-512 integrity 'iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=='. 
The resource has been blocked.
```

### **Root Cause**
- Outdated Font Awesome CDN link
- Invalid SHA-512 integrity hash
- Browser security policy blocking resource

### **Solution**
Updated Font Awesome CDN to latest version with correct integrity:

```html
<!-- Before (Broken) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
      crossorigin="anonymous" referrerpolicy="no-referrer" />

<!-- After (Fixed) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
      crossorigin="anonymous" referrerpolicy="no-referrer" />
```

### **Result**
- ✅ Icons load properly
- ✅ No integrity errors
- ✅ All Font Awesome icons display correctly

---

## 🧩 Modal Component Resolution Errors

### **Error Description**
```
[Vue warn]: Failed to resolve component: Modal
If this is a native custom element, make sure to exclude it from component resolution 
via compilerOptions.isCustomElement.
  at <QuotationForm show=false quotation=null onClose=fn<closeEditModal>  ... > 
  at <ClientForm show=false client=null onClose=fn<closeEditModal>  ... > 
  at <ReceiptForm show=false receipt=null onClose=fn<closeEditModal>  ... > 
```

### **Root Cause**
- Form components still referencing removed Modal component
- Modal.vue component was deleted but imports remained
- Vue cannot resolve Modal dependency

### **Solution**
Replaced Modal component with custom modal overlays in all form components:

#### **Before (Broken)**
```vue
<template>
  <Modal :show="show" :title="..." @close="handleClose" size="large">
    <form @submit.prevent="handleSubmit">
      <!-- Form content -->
    </form>
  </Modal>
</template>
```

#### **After (Fixed)**
```vue
<template>
  <div v-if="show" class="form-overlay">
    <div class="form-container">
      <div class="form-header">
        <h3>{{ isEditing ? 'Edit' : 'Create' }} {{ type }}</h3>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <!-- Form content -->
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}

.form-container {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 800px; width: 100%; max-height: 90vh;
  overflow: hidden; display: flex; flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}
</style>
```

### **Components Fixed**
- ✅ **ClientForm.vue**: Custom modal overlay
- ✅ **QuotationForm.vue**: Custom modal overlay  
- ✅ **ReceiptForm.vue**: Custom modal overlay

---

## 🔧 Development Environment Setup

### **Prerequisites**
1. **Backend Server Running**
   ```bash
   cd backend
   python manage.py runserver
   # Server runs on http://localhost:8000
   ```

2. **Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Server runs on http://localhost:3000
   ```

3. **Authentication**
   - Navigate to `http://localhost:3000/login`
   - Log in or register to get JWT token
   - Token stored automatically in localStorage

---

## 🎯 System Architecture

### **Authentication Flow**
```
1. User logs in → JWT token received
2. Token stored in localStorage
3. All API requests include Authorization header
4. Router guards protect authenticated routes
5. 401 errors redirect to login page
```

### **Modal System**
```
1. Custom modals instead of reusable components
2. Glassmorphism design with backdrop blur
3. Font Awesome icons for actions
4. Smooth animations and transitions
5. Responsive design for all screen sizes
```

### **API Integration**
```
1. Axios interceptors handle authentication
2. Automatic token injection in headers
3. Error handling with user feedback
4. CRUD operations through custom modals
```

---

## 🚀 Quick Start Checklist

### **Before Running Application**
- [ ] Backend server running on `localhost:8000`
- [ ] Frontend dependencies installed (`npm install`)
- [ ] No conflicting processes on ports 3000/8000

### **After Starting Application**
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Log in or register for JWT token
- [ ] Verify icons are loading (Font Awesome)
- [ ] Test CRUD operations through modals
- [ ] Check for 401 errors (should be resolved)

---

## 🐛 Troubleshooting

### **If 401 Errors Persist**
1. Clear browser localStorage
2. Restart development servers
3. Log in again with fresh credentials
4. Check backend authentication endpoints

### **If Icons Don't Display**
1. Verify Font Awesome CDN link in `index.html`
2. Check browser console for integrity errors
3. Ensure internet connectivity for CDN access

### **If Modals Don't Work**
1. Check for Modal component imports
2. Verify custom modal CSS is applied
3. Ensure Font Awesome icons are loading

---

## 📞 Support

### **Common Solutions**
- **401 Errors**: Log in at `/login` page
- **Icon Issues**: Refresh browser cache
- **Modal Problems**: Check component imports
- **API Errors**: Verify backend is running

### **Development Tips**
- Use browser DevTools for debugging
- Check Network tab for API requests
- Monitor Console for Vue warnings
- Verify localStorage for JWT token

---

**Last Updated**: January 18, 2026  
**Version**: 1.0.0  
**Status**: All documented errors resolved ✅
