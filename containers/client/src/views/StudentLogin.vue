<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 1. Import router utilities
import { createWalletClient, custom } from 'viem' 
import { mainnet } from 'viem/chains'

const route = useRoute()
const router = useRouter()

// Get the current role context ('student' or 'sherpa') from the URL query
const currentRole = (route.query.role as string) || 'student'

const step = ref<1 | 2 | 3>(1)
const walletAddress = ref<string | null>(null)
const isLoading = ref<boolean>(false)
const userData = ref<Record<string, any> | null>(null)
const userError = ref<string | null>(null)
const isUserLoading = ref<boolean>(false)

const handleAuthMessage = (event: MessageEvent) => {
  if (event.origin !== "https://talentgraph.localhost:8443") return
  if (event.data.status === 'success') {
    if (event.data.token) {
      localStorage.setItem('42_access_token', event.data.token)
    }
    fetchUserData()
  }
}

onMounted(() => { window.addEventListener('message', handleAuthMessage) })
onUnmounted(() => { window.removeEventListener('message', handleAuthMessage) })

const handleSiweAuth = async () => {
  const provider = (window as any).ethereum
  if (!provider) {
    alert('Wallet not found.')
    return
  }
  isLoading.value = true
  try {
    const walletClient = createWalletClient({ chain: mainnet, transport: custom(provider) })
    const [address] = await walletClient.requestAddresses()
    walletAddress.value = address

    const mockNonce = "XYZ123456789" 
    const message = `talentgraph.localhost wants you to sign in with your Ethereum account:\n${address}\n\nURI: https://talentgraph.localhost\nVersion: 1\nChain ID: 1\nNonce: ${mockNonce}`

    const signature = await walletClient.signMessage({ account: address, message })
    console.log('Signature generated:', signature)
    step.value = 2
  } catch (error) {
    console.error(error)
    alert('Connexion error.')
  } finally {
    isLoading.value = false
  }
}

const handle42OAuth = () => {
  const INTRA_CLIENT_ID = "u-s4t2ud-3516e92e1176dd60546a7043df717d1ab94ea4b196ffa2b4c830b3494b4a1c1f"
  const REDIRECT_URI = encodeURIComponent("https://talentgraph.localhost:8443/api/auth/callback")
  const INTRA_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${INTRA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=public`

  isLoading.value = true
  if (walletAddress.value) {
    localStorage.setItem('pending_wallet', walletAddress.value)
  }

  const width = 600, height = 700
  const left = (window.innerWidth / 2) - (width / 2)
  const top = (window.innerHeight / 2) - (height / 2)
  
  try {
    window.open(INTRA_URL, "42 Auth", `width=${width},height=${height},top=${top},left=${left}`)
  } catch (error) {
    console.error(error)
    isLoading.value = false
  } finally {
    isLoading.value = false
  }
}

const fetchUserData = async () => {
  const token = localStorage.getItem('42_access_token')
  if (!token) {
    userError.value = 'No access token available'
    return
  }

  isUserLoading.value = true
  userError.value = null

  try {
    const response = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(`Status: ${response.status}`)

    userData.value = await response.json()
    
    // 2. Instead of sticking on Step 3 layout, redirect out to their designated application dashboard!
    if (currentRole === 'sherpa') {
      router.push('/dashboard/sherpa')
    } else {
      router.push('/dashboard/student')
    }

  } catch (error) {
    console.error(error)
    userError.value = 'Failed to fetch profile.'
  } finally {
    isUserLoading.value = false
  }
}
</script>

<template>
  <main class="shell">
    <section v-if="step === 1" class="auth-box">
      <p class="eyebrow">TalentGraph / {{ currentRole }} Gateway</p>
      <h1>Connect Wallet</h1>
      <p class="body-text">Sign a cryptographic message with your wallet to verify ownership.</p>
      <button @click="handleSiweAuth" :disabled="isLoading" class="black-button">
        {{ isLoading ? 'Awaiting Signature...' : 'Connect Wallet' }}
      </button>
    </section>

    <section v-else-if="step === 2" class="auth-box">
      <p class="eyebrow">TalentGraph / {{ currentRole }} Gateway</p>
      <h1>Link Academic ID</h1>
      <div class="wallet-display">{{ walletAddress }}</div>
      <p class="body-text">Verify your academic status via 42 Intra to complete authentication.</p>
      <button @click="handle42OAuth" class="black-button">Verify Identity</button>
    </section>
  </main>
</template>
 