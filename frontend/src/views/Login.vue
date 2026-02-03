<template>
  <div class="login-container">
    <!-- Left Side - Splash Content -->
    <div class="login-splash">
      <div class="splash-content">
        <div class="splash-icon">🎉</div>
        <h1 class="splash-title">Event Billing</h1>
        <p class="splash-subtitle">Professional Event Management & Billing System</p>
        <div class="splash-features">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>Smart Analytics</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💰</span>
            <span>Easy Invoicing</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span>Track Revenue</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="login-form-container">
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
        <h2>Welcome Back</h2>
        <p class="form-subtitle">Sign in to manage your events</p>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input v-model="loginForm.username" id="username" type="text" required placeholder="Enter your username" />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input 
              v-model="loginForm.password" 
              id="password" 
              :type="showLoginPassword ? 'text' : 'password'" 
              required 
              placeholder="Enter your password"
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              @click="showLoginPassword = !showLoginPassword"
            >
              <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </form>

      <!-- Registration Form -->
      <form v-else @submit.prevent="register" class="auth-form">
        <h2>Create Account</h2>
        <p class="form-subtitle">Join us to manage your events efficiently</p>
        
        <div class="form-group">
          <label for="reg-username">Username</label>
          <input v-model="registerForm.username" id="reg-username" type="text" required placeholder="Choose a username" />
        </div>
        
        <div class="form-group">
          <label for="reg-email">Email</label>
          <input v-model="registerForm.email" id="reg-email" type="email" placeholder="Enter your email" />
        </div>
        
        <div class="form-group">
          <label for="reg-password">Password</label>
          <div class="password-input-container">
            <input 
              v-model="registerForm.password" 
              id="reg-password" 
              :type="showRegPassword ? 'text' : 'password'" 
              required 
              placeholder="Create a password"
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              @click="showRegPassword = !showRegPassword"
            >
              <i :class="showRegPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="reg-confirm-password">Confirm Password</label>
          <div class="password-input-container">
            <input 
              v-model="registerForm.confirmPassword" 
              id="reg-confirm-password" 
              :type="showRegConfirmPassword ? 'text' : 'password'" 
              required 
              placeholder="Confirm your password"
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              @click="showRegConfirmPassword = !showRegConfirmPassword"
            >
              <i :class="showRegConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import router from '../router'
import { authAPI, setAuthToken, setRefreshToken } from '../services/api'

const isLogin = ref(true)
const loading = ref(false)
const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref('')

// Password visibility states
const showLoginPassword = ref(false)
const showRegPassword = ref(false)
const showRegConfirmPassword = ref(false)

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
    const { access, refresh } = response.data
    setAuthToken(access)
    setRefreshToken(refresh)
    router.push('/dashboard')
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
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
}

/* Left Side - Splash Content */
.login-splash {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: var(--accent-primary); /* Match sidebar color */
  color: white;
  position: relative;
  overflow: hidden;
}

.login-splash::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.splash-content {
  text-align: center;
  z-index: 1;
  position: relative;
}

.splash-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.splash-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.splash-subtitle {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  line-height: 1.6;
}

.splash-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

/* Right Side - Login Form */
.login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
}

.form-toggle {
  display: flex;
  margin-bottom: 2rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.25rem;
  border: 1px solid var(--border-color);
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
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
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-group input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  margin-top: 1rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  text-decoration: none;
}

.btn-primary:hover {
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

/* Password input container styles */
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  padding-right: 3rem;
  width: 100%;
}

.password-toggle-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.password-toggle-btn i {
  font-size: 0.875rem;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-splash {
    min-height: 40vh;
    padding: 2rem;
  }
  
  .splash-title {
    font-size: 2rem;
  }
  
  .splash-features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: none;
  }
  
  .feature-item {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 640px) {
  .login-form-container {
    padding: 2rem 1rem;
  }
  
  .splash-title {
    font-size: 1.5rem;
  }
  
  .splash-features {
    flex-direction: column;
  }
}
</style>
