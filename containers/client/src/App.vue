<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createWalletClient, custom } from 'viem' 
import { mainnet } from 'viem/chains'

// Data Store
const step = ref<1 | 2 | 3>(1) // reactive data to filter the status 1 (Wallet connection) or 2 (42auth) or 3 (Complete)
const walletAddress = ref<string | null>(null) // Store Eth wallet address
const isLoading = ref<boolean>(false) // True false for tracking if a user sign in Metamask is happening.
const userData = ref<Record<string, any> | null>(null)
const userError = ref<string | null>(null)
const isUserLoading = ref<boolean>(false)

// PopUp Listener
const handleAuthMessage = (event: MessageEvent) => {
  // Checks when a browser window receives a message from the popup window
  if (event.origin !== "https://talentgraph.localhost:8443") return // !!! Check the port MUST BE OTHER

  // Checks the domain origin is the sender (security)
  if (event.data.status === 'success') {
    if (event.data.token) {
      localStorage.setItem('42_access_token', event.data.token)
    }
    const data = fetchUserData()
  }
}

// This registers the handleAuthMessage. The app is now actively listening for messages broadcasted by the popuo.
onMounted(() => {
  window.addEventListener('message', handleAuthMessage)
})

// In case the user leaves this page, removes the event listener. (memory leaks)
onUnmounted(() => {
  window.removeEventListener('message', handleAuthMessage)
})

// 1: Sign-In with Wallet (Ethereum) (SIWE)
const handleSiweAuth = async () => {
  // 1. Cast the window to any to bypass initial check safely
  const provider = (window as any).ethereum

  // Check if a wallet is installed in the browser
  if (!provider) {
    alert('Wallet (Metamask, Phantom Coinbase Wallet...) not found.')
    return
  }

  // disable buttons in the HTML to prevent double-clicks
  isLoading.value = true

  // Checks any issue when connecting to the wallet
  try {
      const walletClient = createWalletClient({
          chain: mainnet,
          transport: custom(provider)
        })
        
    // Asks the user permision to connect their wallet to the site
    const [address] = await walletClient.requestAddresses()
    walletAddress.value = address

    // 1. In production fetch a Fastify to ask for a real nonce
    // const nonce = await fetch('/api/auth/nonce').then(res => res.text());
    const mockNonce = "XYZ123456789" 

    // 2. Standar message when SignIn SIWE
    const message = `talentgraph.localhost wants you to sign in with your Ethereum account:\n${address}\n\nURI: https://talentgraph.localhost\nVersion: 1\nChain ID: 1\nNonce: ${mockNonce}`

    // 3. Solicitar la firma criptográfica real al usuario
    // 3. Ask for the wallet real user signature
    const signature = await walletClient.signMessage({
      account: address,
      message: message
    })

    console.log('Cryptographic signature successfully generated:', signature)
    
    // Step 1 completed, pass to step 2 with intact SPA
    step.value = 2
  } catch (error) {
    console.error('Error SIWE signature process:', error)
    alert('Revoked signature or connexion error.')
  } finally {
    isLoading.value = false
  }
}

// 2: Open 42 OAuth as an independent PopUp to protect SPA
const handle42OAuth = () => {
  const INTRA_CLIENT_ID = "u-s4t2ud-3516e92e1176dd60546a7043df717d1ab94ea4b196ffa2b4c830b3494b4a1c1f" // Public Identifier for the app inside 42 Network
  // The backend process the code of the API and execute a script that sends the postMessage to this SPA
  const REDIRECT_URI = encodeURIComponent("https://talentgraph.localhost:8443/api/auth/callback") // Endpoint
  const INTRA_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${INTRA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=public` // Final authorization URL following OAuth2 protocol

  isLoading.value = true

  // Linked wallet saved in localStorage to agroup info and send to backend once completed
  if (walletAddress.value) {
    localStorage.setItem('pending_wallet', walletAddress.value)
  }

  // Open a secondary window centered
  const width = 600, height = 700
  const left = (window.innerWidth / 2) - (width / 2)
  const top = (window.innerHeight / 2) - (height / 2)
  
  try {

    window.open(
      INTRA_URL, 
      "42 Auth", 
      `width=${width},height=${height},top=${top},left=${left}`
    )

  } catch (error) {
    console.error('Error opening 42 OAuth popup:', error)
    alert('Failed to open 42 authentication window. Please try again.')
    isLoading.value = false
    return
  } finally {
    isLoading.value = false
  }
}

const fetchUserData = async () => {
  const token = localCookie.getItem('42_access_token')
  if (!token) {
    userError.value = 'No access token available'
    return
  }

  isUserLoading.value = true
  userError.value = null

  try {
    const response = await fetch('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch user data, status: ${response.status}`)
    } else {

      userData.value = await response.json()
      step.value = 3

    }

  } catch (error) {
    console.error('Error fetching user data:', error)
    userError.value = error instanceof Error ? error.message : 'Failed to fetch user data'
  } finally {
    isUserLoading.value = false
  }
}

</script>

<template>
  <main class="shell">
    <!-- 1: Web3 -->
    <section v-if="step === 1" class="auth-box animate-fade">
      <p class="eyebrow">TalentGraph / Step 1</p>
      <h1>Connect Wallet</h1>
      <p class="body-text">
        Sign a cryptographic message with your Ethereum wallet to verify your ownership.
      </p>
      <button @click="handleSiweAuth" :disabled="isLoading" class="black-button">
        {{ isLoading ? 'Awaiting Signature...' : 'Connect Wallet' }}
      </button>
    </section>

    <!-- 2: 42 OAuth -->
    <section v-else-if="step === 2" class="auth-box animate-fade">
      <p class="eyebrow">TalentGraph / Step 2</p>
      <h1>Link Academic ID</h1>
      <div class="wallet-display">
        {{ walletAddress }}
      </div>
      <p class="body-text">
        Verify your academic status. This will permanently lock this wallet to your profile.
      </p>
      <button @click="handle42OAuth" class="black-button">
        Verify Identity
      </button>
    </section>

    <!-- 3: Landing Page -->
    <section v-else-if="step === 3" class="auth-box animate-fade">
      <p class="eyebrow">TalentGraph / Step 3</p>
      <h1>Welcome </h1>
      <p class="body-text">You are now logged in as a 42 Student.</p>
      <p v-if="isUserLoading" class="body-text">Loading profile...</p>
      <p v-else-if="userError" class="body-text">{{ userError }}</p>
      <div v-else-if="userData" class="wallet-display">
        <div>{{ userData.login ?? userData.email ?? 'Unknown user' }}</div>
        <div v-if="userData.displayname">{{ userData.displayname }}</div>
        <div v-if="userData.campus?.[0]?.name">{{ userData.campus[0].name }}</div>
      </div>
    </section>
  </main>
</template>