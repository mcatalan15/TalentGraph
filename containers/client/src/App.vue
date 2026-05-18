<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createWalletClient, custom } from 'viem' \\ Lib for EVM (ethers.js replacement)
import { mainnet } from 'viem/chains' \\ called ETH mainnet (check to use Polygon Testnet!)

// Data Store
const step = ref<1 | 2>(1) // reactive data to filter the status 1 (Wallet connection) or 2 (42auth)
const walletAddress = ref<string | null>(null) // Store Eth wallet address
const isLoading = ref<boolean>(false) // True false for tracking if a user sign in Metamask is happening.

// PopUp Listener
const handleAuthMessage = (event: MessageEvent) => {
  // Checks when a browser window receives a message from the popup window
  if (event.origin !== "https://talentgraph.localhost:8443") return // !!! Check the port MUST BE ANOTHER

  // Checks the domain origin is the sender (security)
  if (event.data.status === 'success') {
    alert('Autenticación completa. Usuario creado/logueado en Postgres.')
    // Here happens when the user has all setup
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
  // Check if a wallet is installed in the browser
  if (!window.ethereum) {
    alert('Wallet (Metamask, Phantom Coinbase Wallet...) not found.')
    return
  }

  // disable buttons in the HTML to prevent double-clicks
  isLoading.value = true

  // Checks any issue when connecting to the wallet
  try {
      const walletClient = createWalletClient({
          chain: mainnet,
          transport: custom(window.ethereum)
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
  const INTRA_CLIENT_ID = "TU_CLIENT_ID" // Public Identifier for the app inside 42 Network
  // The backend process the code of the API and execute a script that sends the postMessage to this SPA
  const REDIRECT_URI = encodeURIComponent("https://talentgraph.localhost:8443/api/auth/callback") // Endpoint
  const INTRA_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${INTRA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=public` // Final authorization URL following OAuth2 protocol

  // Linked wallet saved in localStorage to agroup info and send to backend once completed
  if (walletAddress.value) {
    localStorage.setItem('pending_wallet', walletAddress.value)
  }

  // Open a secondary window centered
  const width = 600, height = 700
  const left = (window.innerWidth / 2) - (width / 2)
  const top = (window.innerHeight / 2) - (height / 2)
  
  window.open(
    INTRA_URL, 
    "42 Auth", 
    `width=${width},height=${height},top=${top},left=${left}`
  )
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
    <section v-else class="auth-box animate-fade">
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
  </main>
</template>