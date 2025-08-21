# BondFi - Decentralized Community Finance & Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC.svg)](https://tailwindcss.com/)

## 🌟 Overview

**BondFi** is a revolutionary decentralized finance (DeFi) platform that combines traditional African community savings practices (ROSCAs) with modern blockchain technology. The platform enables users to participate in automated rotating savings circles, build credit through community trust, and make secure payments to local merchants using cryptocurrency.

## 🚀 Key Features

### 💰 **Automated ROSCAs (Community Savings)**
- **Smart Contract Automation**: Join rotating savings circles with transparent, automated payouts
- **Flexible Schedules**: Choose from 5-minute, daily, weekly, bi-weekly, or monthly contribution cycles
- **Community Accountability**: Blockchain-secured trust system with peer verification
- **Transparent Payouts**: Automated distribution of pooled funds with smart contract execution

### 🏪 **Merchant Network & Marketplace**
- **500+ Partner Merchants**: Shop at verified local merchants across Africa
- **Installment Payments**: Structured payment plans with zero traditional credit checks
- **Secure Transactions**: On-chain payment processing with smart contract escrow
- **Product Catalog**: Comprehensive marketplace with electronics, furniture, and more

### 💱 **DeFi Trading & Liquidity**
- **Token Swapping**: Seamless token exchange with automated market making
- **Liquidity Provision**: Earn rewards by providing liquidity to trading pools
- **Multi-Token Support**: Trade between African stablecoins and major cryptocurrencies
- **Price Feeds**: Real-time price data from decentralized oracles

### 🏦 **Savings & Credit Building**
- **Multi-Token Savings**: Save in various African stablecoins (cNGN, cZAR, cGHS, cKES)
- **Credit Scoring**: Build on-chain credit through consistent savings and payment history
- **Interest Earning**: Earn returns on your savings through DeFi protocols
- **Flexible Withdrawals**: Access your funds anytime with transparent fee structure

### 🔄 **Cross-Border Remittances**
- **Family Transfers**: Send money to family members across borders
- **Low-Cost Transfers**: Minimal fees compared to traditional remittance services
- **Instant Settlement**: Near-instant cross-border transfers using blockchain
- **Multi-Currency Support**: Support for major African currencies



## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI design
- **Shadcn/ui** components for consistent design system
- **React Router** for client-side routing

### **Blockchain Integration**
- **Ethers.js** for Ethereum interaction
- **Wagmi** for wallet connection and management
- **Thirdweb** for enhanced Web3 functionality
- **Mantle Network** as the primary blockchain (Sepolia testnet)

### **Smart Contracts**
- **ROSCA/Savings Contract**: Manages community savings circles
- **Swap Contract**: Handles token exchanges and liquidity
- **Merchant Contracts**: Manages merchant registration and installment payments
- **Price Feed Contract**: Provides real-time token pricing
- **AfriStable Contract**: African stablecoin management

### **Supported Tokens**
- **Native**: MNT (Mantle)
- **Stablecoins**: USDT, WETH
- **African Stablecoins**: AFR (AfriRemit), AFX (AfriStable)
- **Local Currencies**: cNGN (Crypto Naira), cZAR (Crypto Rand), cGHS (Crypto Cedi), cKES (Crypto Shilling)

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Mantle Sepolia testnet configured

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BondFi-client.git
   cd BondFi-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env-template.txt .env
   ```
   
   Configure your `.env` file:
   ```bash
   # AI Configuration (Optional)
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   VITE_SITE_URL=https://bondfi.vercel.app/
   
   # Thirdweb Configuration
   VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

### **Wallet Configuration**

1. **Install MetaMask** or compatible Web3 wallet
2. **Add Mantle Sepolia Testnet**:
   - Network Name: Mantle Sepolia
   - RPC URL: `https://5003.rpc.thirdweb.com/`
   - Chain ID: 5003
   - Currency Symbol: MNT
3. **Get Test Tokens** from the platform's faucet

## 📱 Usage Guide

### **Joining a ROSCA Group**
1. Navigate to the **Savings** section
2. Choose **"Join Group"** or **"Create Group"**
3. Set contribution amount and frequency
4. Invite members or join existing groups
5. Start contributing and earning

### **Trading Tokens**
1. Go to the **Swap** interface
2. Select tokens to exchange
3. Set amount and review rates
4. Approve tokens and execute swap
5. Monitor transaction status

### **Shopping on Marketplace**
1. Browse products in the **Marketplace**
2. Select items with installment options
3. Choose payment plan (weekly/monthly)
4. Complete purchase with crypto
5. Make regular payments until fully paid

### **Building Credit**
1. **Consistent Savings**: Regular contributions to ROSCA groups
2. **Timely Payments**: Pay installments on time
3. **Community Participation**: Active engagement in savings circles
4. **Transaction History**: Build reputation through on-chain activity

## 🔧 Development

### **Project Structure**
```
src/
├── components/          # React components
│   ├── ROSCA/          # Community savings functionality
│   ├── dashboard/      # User dashboard components
│   ├── home/           # Landing page components
│   ├── layout/         # Layout and navigation
│   └── ui/             # Reusable UI components
├── provider/            # Web3 and contract providers
├── lib/                 # Utilities and configurations
│   ├── ABI/            # Smart contract ABIs
│   └── Tokens/         # Token configurations
├── hooks/               # Custom React hooks
└── pages/               # Main application pages
```

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### **Smart Contract Deployment**
The platform uses pre-deployed contracts on Mantle Sepolia testnet:
- **Swap Contract**: `0x013b0CA4E4559339F43682B7ac05479eD48E694f`
- **Savings Contract**: `0xC0c182d9895882C61C1fC1DF20F858e5E29a4f71`
- **Merchant Core**: `0xD182cBE8f2C03d230fcc578811CAf591BFB24e99`

## 🌍 Impact & Vision

### **Financial Inclusion**
- **Democratizing Access**: Bring DeFi to underserved African communities
- **Community Trust**: Leverage traditional social structures for financial services
- **Credit Building**: Enable access to credit without traditional banking requirements
- **Cross-Border**: Facilitate remittances and international trade

### **Economic Empowerment**
- **Local Commerce**: Support African merchants with digital payment solutions
- **Savings Culture**: Promote financial literacy and long-term wealth building
- **Job Creation**: Enable new business models and employment opportunities
- **Economic Growth**: Contribute to local and regional economic development

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Areas for Contribution**
- **Smart Contract Development**: Enhance existing contracts or add new features
- **Frontend Development**: Improve UI/UX and add new components
- **Testing**: Write tests and improve test coverage
- **Documentation**: Enhance documentation and create tutorials
- **Localization**: Add support for more African languages and currencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://bondfi.vercel.app/](https://bondfi.vercel.app/)
- **Documentation**: [https://docs.bondfi.com](https://docs.bondfi.com)
- **Discord**: [Join our community](https://discord.gg/bondfi)
- **Twitter**: [@BondFi_DeFi](https://twitter.com/BondFi_DeFi)

## 🙏 Acknowledgments

- **African ROSCA Communities** for inspiration and traditional wisdom
- **Mantle Network** for blockchain infrastructure
- **Thirdweb** for Web3 development tools
- **Open Source Community** for the amazing tools and libraries

---

**BondFi** - Empowering African communities through decentralized finance and commerce. 🌍💚