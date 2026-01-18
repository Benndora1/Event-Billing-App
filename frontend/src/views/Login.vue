<template>
  <div class="login-container">
    <div class="form-toggle">
      <button 
        @click="isLogin = true" 
        :class="{ active: isLogin }"
        class="toggle-btn"
      >
        Login
      </button>
      <button 
        @click="isLogin = false" 
        :class="{ active: !isLogin }"
        class="toggle-btn"
      >
        Register
      </button>
    </div>

    <!-- Login Form -->
    <form v-if="isLogin" @submit.prevent="login" class="auth-form">
      <h2>Login</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <input v-model="loginForm.username" id="username" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="loginForm.password" id="password" type="password" required />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </form>

    <!-- Registration Form -->
    <form v-else @submit.prevent="register" class="auth-form">
      <h2>Register</h2>
      <div class="form-group">
        <label for="reg-username">Username</label>
        <input v-model="registerForm.username" id="reg-username" type="text" required />
      </div>
      <div class="form-group">
        <label for="reg-email">Email</label>
        <input v-model="registerForm.email" id="reg-email" type="email" />
      </div>
      <div class="form-group">
        <label for="reg-password">Password</label>
        <input v-model="registerForm.password" id="reg-password" type="password" required />
      </div>
      <div class="form-group">
        <label for="reg-confirm-password">Confirm Password</label>
        <input 
          v-model="registerForm.confirmPassword" 
          id="reg-confirm-password" 
          type="password" 
          required 
        />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
      <div v-if="registerError" class="error-container">
        <div class="error-title">Registration Error:</div>
        <div class="error-list">
          {{ registerError }}
        </div>
      </div>
      <div v-if="registerSuccess" class="success-container">
        <div class="success-icon">✓</div>
        <div class="success-message">{{ registerSuccess }}</div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import router from '../router'
import { authAPI, setAuthToken } from '../services/api'

const isLogin = ref(true)
const loading = ref(false)
const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref('')

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const login = async () => {
  loading.value = true
  loginError.value = ''
  
  try {
    const response = await authAPI.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    const token = response.data.access
    setAuthToken(token)
    router.push('/')
  } catch (e) {
    loginError.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}

const register = async () => {
  loading.value = true
  registerError.value = ''
  registerSuccess.value = ''
  
  // Client-side validation
  const validationErrors = []
  
  if (!registerForm.value.username.trim()) {
    validationErrors.push('Username is required')
  } else if (registerForm.value.username.length < 3) {
    validationErrors.push('Username must be at least 3 characters long')
  }
  
  if (!registerForm.value.password) {
    validationErrors.push('Password is required')
  } else if (registerForm.value.password.length < 8) {
    validationErrors.push('Password must be at least 8 characters long')
  }
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    validationErrors.push('Passwords do not match')
  }
  
  if (registerForm.value.email && !registerForm.value.email.includes('@')) {
    validationErrors.push('Please provide a valid email address')
  }
  
  if (validationErrors.length > 0) {
    registerError.value = validationErrors.join('; ')
    loading.value = false
    return
  }
  
  try {
    const response = await authAPI.register({
      username: registerForm.value.username.trim(),
      email: registerForm.value.email.trim(),
      password: registerForm.value.password,
    })
    
    registerSuccess.value = `Account created successfully for ${response.data.username}! Please login.`
    
    // Clear form
    registerForm.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
    
    // Switch to login form after successful registration
    setTimeout(() => {
      isLogin.value = true
      registerSuccess.value = ''
    }, 2500)
    
  } catch (e) {
    console.error('Registration error:', e)
    
    if (e.response?.data?.details) {
      // If backend returns multiple errors
      if (Array.isArray(e.response.data.details)) {
        registerError.value = e.response.data.details.join('; ')
      } else {
        registerError.value = e.response.data.details
      }
    } else if (e.response?.data?.error) {
      registerError.value = e.response.data.error
    } else if (e.message) {
      registerError.value = e.message
    } else {
      registerError.value = 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
}

.form-toggle {
  display: flex;
  margin-bottom: 2rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.toggle-btn.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error {
  color: var(--danger);
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.error-container {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}

.error-title {
  font-weight: 600;
  color: var(--danger);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.error-list {
  color: var(--danger);
  font-size: 0.875rem;
  line-height: 1.4;
}

.success-container {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  color: var(--success);
  font-size: 1.25rem;
  font-weight: bold;
}

.success-message {
  color: var(--success);
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>
