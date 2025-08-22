# BondFi - Decentralized Community Finance & Commerce Platform


## 🌟 Overview
**BondFi** is a decentralized finance (DeFi) platform that merges traditional community savings practices (Ajo/Esusu/ROSCAs) with modern blockchain technology. Built on Mantle Sepolia, it enables users to join automated rotating savings circles, access installment-based commerce at partner merchants, and manage finances across multiple stablecoins. Powered by Chainlink price feeds and on-chain credit scoring, BondFi also integrates AI-driven financial insights and recommendations, creating a truly borderless savings and commerce ecosystem

## 🚀 Key Features

### 💰 **Rotational Savings (Ajo/Esusu)**
- **Smart Contract Automation**: Create and join rotating savings groups with transparent, automated payouts
- **Flexible Parameters**: Customize contribution amounts, frequencies (daily, weekly, bi-weekly, monthly), and group sizes
- **Multi-Currency Support**: Deposit and contribute in various African stablecoins with automatic conversion
- **Agent Management**: Register and track trusted agents to facilitate group operations
- **Community Trust**: Blockchain-secured transparency with invitation-based group membership

### 🏪 **Merchant Network & E-commerce**
- **Merchant Registration**: Complete onboarding system with business verification and categorization
- **Product Catalog**: Comprehensive product listing with inventory management and search functionality
- **Installment Payments**: Flexible payment plans with configurable down payments and terms
- **Credit Assessment**: Eligibility based on savings group participation history
- **Multi-Token Support**: Accept payments in various stablecoins
  
### 💱 **Multi-Currency System**
- **Automatic Conversion**: Seamless currency conversion between local stablecoins and base currencies
- **Supported Currencies**: USDT, WETH, AFR, AFX, cNGN, cZAR, cGHS, cKES
- **Price Feed Integration**: Real-time exchange rates using Chainlink oracles
- **Flexible Payouts**: Receive savings payouts in your preferred currency

### 🏦 **Community Finance**
- **Group Savings**: Participate in traditional rotating savings circles (Ajo/Esusu) with modern security
- **Credit Building**: Build reputation through consistent participation and timely payments
- **Agent Network**: Trusted agents facilitate group management and provide local support
- **Transparent Operations**: All transactions and group activities recorded on-chain

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI design
- **Shadcn/ui** components for consistent design system
- **React Router** for client-side routing

### **Blockchain Integration**
- **Ethers.js** for Mantle interaction
- **Wagmi** for wallet connection and management
- **Thirdweb** for enhanced Web3 functionality
- **Mantle Network** as the primary blockchain

### **Smart Contracts**
- **Rotational Savings Core**: Manages community savings groups and contributions
- **Multi-Currency Wrapper**: Handles automatic currency conversion and multi-token support
- **Merchant Registry**: Manages merchant onboarding and verification
- **Product Catalog**: Handles product listings and inventory management
- **Installment Manager**: Processes installment payments and credit assessment
- **Swap Contract**: Provides currency conversion between supported tokens

### **Supported Tokens**
- **Global Stablecoin/Tokens**: USDT, WETH
- **African Tokens**: AFR (AfriRemit), AFX (AfriStable)
- **Local Stablecoins**: cNGN (Crypto Naira), cZAR (Crypto Rand), cGHS (Crypto Cedi), cKES (Crypto Shilling)

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Mantle Sepolia testnet configured

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abuhaneeph/BondFi-client.git
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

### **Creating/Joining Savings Groups**
1. Navigate to the **Savings** section
2. Choose **"Create Group"** with custom parameters or **"Join Group"** with invitation code
3. Set contribution amount, frequency, and group size (for creators)
4. Select your preferred currency for contributions and payouts
5. Start contributing according to the group schedule

### **Multi-Currency Operations**
1. **Set Preferred Currency**: Choose your local stablecoin for contributions
2. **Automatic Conversion**: Contributions are automatically converted to the group's base currency
3. **Flexible Payouts**: Receive payouts in your preferred currency
4. **Real-time Rates**: View current exchange rates before transactions

### **Shopping with Installments**
1. Browse products in the **Marketplace**
2. Select items and choose **"Buy with Installments"**
3. Check your credit eligibility based on savings history
4. Configure down payment and installment terms
5. Complete purchase and make regular payments

### **Merchant Operations**
1. **Register as Merchant**: Complete business verification process
2. **List Products**: Add products with images, descriptions, and pricing
3. **Configure Installments**: Set minimum down payments and payment terms
4. **Manage Inventory**: Track stock levels and update product availability
5. **Monitor Sales**: View sales analytics and customer payment history

## 🔧 Development

### **Project Structure**
```
src/
├── components/          # React components
│   ├── savings/         # Rotational savings functionality
│   ├── merchant/        # Merchant and marketplace components
│   ├── dashboard/       # User dashboard components
│   ├── home/            # Landing page components
│   ├── layout/          # Layout and navigation
│   └── ui/              # Reusable UI components
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



## 🌍 Impact & Vision

### **Financial Inclusion**
- **Democratizing Access**: Bring traditional community savings practices to blockchain
- **Multi-Currency Support**: Enable savings and commerce in local currencies
- **Agent Network**: Leverage trusted community members for user onboarding and support
- **Credit Building**: Build financial reputation through consistent savings participation

### **Economic Empowerment**
- **Local Commerce**: Support African merchants with crypto payment solutions
- **Installment Access**: Enable purchases without traditional credit requirements
- **Community Trust**: Maintain social bonds while adding technological transparency
- **Cross-Border**: Facilitate international commerce and remittances

### **Technology Innovation**
- **Smart Contract Automation**: Replace manual group management with transparent automation
- **Multi-Currency Conversion**: Seamless currency handling for diverse user needs
- **On-Chain Credit**: Build credit scores based on blockchain activity
- **Mobile-First**: Designed for smartphone users across Africa

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Areas for Contribution**
- **Smart Contract Development**: Enhance existing contracts or add new features
- **Frontend Development**: Improve UI/UX and add new components
- **Multi-Currency Support**: Add new African stablecoins and tokens
- **Testing**: Write comprehensive tests for all features
- **Documentation**: Enhance documentation and create tutorials
- **Localization**: Add support for more African languages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **ROSCA Communities** for inspiration and traditional financial wisdom
- **Mantle Network** for blockchain infrastructure and support
- **Thirdweb** for Web3 development tools and SDKs
- **OpenZeppelin** for secure smart contract libraries
- **Chainlink** for reliable price feed infrastructure
- **Open Source Community** for the amazing tools and libraries

---

**BondFi** - Empowering African communities through decentralized savings and commerce. 🌍💚
