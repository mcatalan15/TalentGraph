<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMenu = ref(false)

const selectRole = (role: 'student' | 'recruiter' | 'sherpa') => {
  if (role === 'student' || role === 'sherpa') {
    // Send both paths to the login, tagging them with a query parameter
    router.push({path: '/login', query: { role } })
  } else if (role === 'recruiter') {
    router.push({path: '/login/recruiter'})
  }
}
</script>

<template>
    <main class="shell">
        
        <section v-if="!showMenu" class="auth-box">
          <p class="eyebrow">Welcome to TalentGraph</p>
          <h1>Authenticate</h1>
          <p class="body-text">
            Access the platform by verifying your identity and credentials.
          </p>
          <button @click="showMenu = true" class="black-button">
            Sign In
          </button>
        </section>
    
        <section v-else class="auth-box">
          <p class="eyebrow">TalentGraph / Portal</p>
          <h1>Select Your Role</h1>
          <p class="body-text">
            Please choose your access below to continue your verification.
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button @click="selectRole('student')" class="black-button">
              Student
            </button>
            <button @click="selectRole('recruiter')" class="black-button">
              Recruiter
            </button>
            <button @click="selectRole('sherpa')" class="black-button">
              Sherpa
            </button>
          </div>
        </section>

    </main>
</template>