import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { 
  Store, 
  CreditCard, 
  Package, 
  Plus, 
  Settings,
  User,
  Calendar,
  DollarSign,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Check,
  ChevronDown
} from 'lucide-react';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';
import { 
  MerchantDashboard, 
  MerchantStats, 
  CreateProduct, 
  MyProducts, 
  Installments 
} from './merchant';

const MerchantInstallmentPlatform = () => {
  const { isConnected, TEST_TOKEN_CONTRACT_INSTANCE, MERCHANT_REGISTRY_CONTRACT_INSTANCE, PRODUCT_CONTRACT_INSTANCE,INSTALLMENT_CONTRACT_INSTANCE, fetchBalance, address, MERCHANT_CORE_CONTRACT_INSTANCE } = useContractInstances();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [modalContext, setModalContext] = useState(''); // 'product' or 'merchant'

  // State for different sections
  const [products, setProducts] = useState([]);
  const [userType, setUserType] = useState('customer'); // 'customer' or 'merchant'

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    acceptedTokens: [],
    allowInstallments: false,
    minDownPaymentRate: '2000', // 20%
    maxInstallments: '12',
    installmentFrequency: '2592000', // 30 days in seconds
    initialStock: ''
  });

  // Merchant registration form
  const [merchantForm, setMerchantForm] = useState({
    businessName: '',
    contactInfo: '',
    businessCategory: '',
    acceptedTokens: []
  });

  // Pinata configuration - Replace with your actual Pinata credentials
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-api-key';
  const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_API_SECRET_KEY || 'your-pinata-api-secret-key';
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'your-pinata-jwt';  

  // Filter out the first token as requested
  const availableTokens = tokens.slice(1);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food'];

  // Mock data for demonstration
  const userInfo = { isMerchant: true, businessName: 'TechStore' };
  const totalStats = { totalProducts: 12, totalSales: 45000, activeInstallments: 8 };

  async function authorizeAll() {
    try {
      // Authorize in Merchant Registry
      const merchantRegistryContract = await MERCHANT_REGISTRY_CONTRACT_INSTANCE();
      await merchantRegistryContract.setAuthorizedContract(CONTRACT_ADDRESSES.merchantCoreInstallmentAddress, true);
      console.log("Merchant registry authorized:", CONTRACT_ADDRESSES.merchantCoreInstallmentAddress);
  
      // Authorize in Product Contract
      const productContract = await PRODUCT_CONTRACT_INSTANCE();
      await productContract.setAuthorizedContract(CONTRACT_ADDRESSES.merchantCoreInstallmentAddress, true);
      console.log("Product contract authorized:", CONTRACT_ADDRESSES.merchantCoreInstallmentAddress);

      // Authorize in Installment Contract
      const installmentContract = await INSTALLMENT_CONTRACT_INSTANCE();
      await installmentContract.setAuthorizedContract(CONTRACT_ADDRESSES.merchantCoreInstallmentAddress, true);
      console.log("Installment contract authorized:", CONTRACT_ADDRESSES.merchantCoreInstallmentAddress);

      console.log("All contracts authorized successfully.");
      
    } catch (error) {
      console.error("Authorization failed:", error);
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchProducts();
    }
  }, [isConnected]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Token selection handlers
  const handleTokenSelect = (token) => {
    const isProduct = modalContext === 'product';
    const currentForm = isProduct ? productForm : merchantForm;
    const currentTokens = currentForm.acceptedTokens;

    let updatedTokens;
    if (currentTokens.includes(token.address)) {
      updatedTokens = currentTokens.filter(addr => addr !== token.address);
    } else {
      updatedTokens = [...currentTokens, token.address];
    }

    if (isProduct) {
      setProductForm({ ...productForm, acceptedTokens: updatedTokens });
    } else {
      setMerchantForm({ ...merchantForm, acceptedTokens: updatedTokens });
    }
  };

  const openTokenModal = (context) => {
    setModalContext(context);
    setShowTokenModal(true);
  };

  const getSelectedTokenNames = (tokenAddresses) => {
    if (tokenAddresses.length === 0) return 'Select tokens';
    const names = tokenAddresses.map(addr => {
      const token = availableTokens.find(t => t.address === addr);
      return token ? token.symbol : 'Unknown';
    });
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ');
  };

  const getSelectedTokens = (tokenAddresses) => {
    return tokenAddresses.map(addr => availableTokens.find(t => t.address === addr)).filter(Boolean);
  };

  // Token approval function
  const approveToken = async (tokenAddress, spenderAddress, amount) => {
    setApproving(true);
    try {
      const tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
      const tx = await tokenContract.approve(spenderAddress, amount);
      await tx.wait();
      showNotification('Token approved successfully!');
      return true;
    } catch (error) {
      console.error('Token approval error:', error);
      showNotification('Token approval failed: ' + error.message, 'error');
      return false;
    } finally {
      setApproving(false);
    }
  };

  // Pinata upload function
  const uploadToPinata = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: `product-image-${Date.now()}`,
        keyvalues: {
          uploadedBy: address || 'anonymous',
          timestamp: new Date().toISOString(),
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      // Using Pinata API
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload to Pinata');
      }

      const result = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      showNotification('Image uploaded successfully to IPFS!');
      return ipfsUrl;
    } catch (error) {
      console.error('Pinata upload error:', error);
      showNotification('Failed to upload image: ' + error.message, 'error');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('Image size should be less than 10MB', 'error');
      return;
    }

    const ipfsUrl = await uploadToPinata(file);
    if (ipfsUrl) {
      setProductForm({...productForm, imageUrl: ipfsUrl});
    }
  };

  const fetchProducts = async () => {
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const allProducts = await contract.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Error fetching products: ' + error.message, 'error');
    }
  };

  const handleRegisterMerchant = async () => {
    if (!merchantForm.businessName || !merchantForm.contactInfo || merchantForm.acceptedTokens.length === 0) {
      showNotification('Please fill in all required fields and select at least one token', 'error');
      return;
    }

    setLoading(true);
    try {
      const contract = await MERCHANT_REGISTRY_CONTRACT_INSTANCE();
      const tx = await contract.registerMerchant(
        merchantForm.businessName,
        merchantForm.contactInfo,
        merchantForm.businessCategory,
        merchantForm.acceptedTokens
      );
      await tx.wait();
      showNotification('Merchant registered successfully!');
      setMerchantForm({
        businessName: '',
        contactInfo: '',
        businessCategory: '',
        acceptedTokens: []
      });
      setUserType('merchant');
    } catch (error) {
      showNotification('Error registering merchant: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleListProduct = async () => {
    if (!productForm.name || !productForm.price || productForm.acceptedTokens.length === 0) {
      console.error('Please fill in all required fields and select at least one accepted token');
      return;
    }

    setLoading(true);
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const priceInWei = parseEther(productForm.price); // Convert price to Wei

      const tx = await contract.listProduct(
        productForm.name,
        productForm.description,
        productForm.category,
        productForm.imageUrl,
        priceInWei, // Ensure price is in Wei
        productForm.acceptedTokens,
        productForm.allowInstallments,
        productForm.allowInstallments ? parseInt(productForm.minDownPaymentRate) : 0,
        productForm.allowInstallments ? parseInt(productForm.maxInstallments) : 0,
        productForm.allowInstallments ? parseInt(productForm.installmentFrequency) : 0,
        parseInt(productForm.initialStock)
      );
      await tx.wait();
      console.log('Product listed successfully!');
      setProductForm({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        price: '',
        acceptedTokens: [],
        allowInstallments: false,
        minDownPaymentRate: '1000',
        maxInstallments: '12',
        installmentFrequency: '2592000',
        initialStock: ''
      });
      fetchProducts();
    } catch (error) {
      console.error('Error listing product:', error.message);
    }
    setLoading(false);
  };

  // Token Selection Modal Component
  const TokenSelectionModal = () => {
    const currentTokens = modalContext === 'product' ? productForm.acceptedTokens : merchantForm.acceptedTokens;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800">Select Accepted Tokens</h3>
            <button
              onClick={() => setShowTokenModal(false)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {/* Selected Tokens Summary */}
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <p className="text-sm text-stone-600 mb-2">
              {currentTokens.length} token{currentTokens.length !== 1 ? 's' : ''} selected
            </p>
            {currentTokens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getSelectedTokens(currentTokens).map((token) => (
                  <div key={token.address} className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1">
                    <img src={token.img} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-sm font-medium">{token.symbol}</span>
                    <button
                      onClick={() => handleTokenSelect(token)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token List */}
          <div className="max-h-96 overflow-y-auto">
            {availableTokens.map((token) => {
              const isSelected = currentTokens.includes(token.address);
              return (
                <div
                  key={token.address}
                  className={`flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-b-0 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 border-2 border-white shadow-sm">
                      <img 
                        src={token.img} 
                        alt={token.symbol}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-stone-800">{token.symbol}</div>
                    <div className="text-sm text-stone-500">{token.name}</div>
                  </div>
                  
                  {isSelected && (
                    <div className="text-blue-500 font-medium text-sm">Selected</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-stone-200 bg-stone-50">
            <div className="flex gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 px-6 py-3 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-terracotta to-sage text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTokenModal && !event.target.closest('.modal-content')) {
        // Optional: close modal on outside click
        // setShowTokenModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTokenModal]);

  return (
    <>
      {/* Token Selection Modal */}
      {showTokenModal && <TokenSelectionModal />}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? 
              <CheckCircle className="w-4 h-4" /> : 
              <AlertCircle className="w-4 h-4" />
            }
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <MerchantDashboard
        userName="Merchant"
        userInfo={userInfo}
        totalStats={totalStats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <MerchantStats userInfo={userInfo} totalStats={totalStats} />
        )}

        {activeTab === 'products' && (
          <MyProducts />
        )}

        {activeTab === 'create' && (
          <CreateProduct />
        )}

        {activeTab === 'installments' && (
          <Installments />
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        )}
      </MerchantDashboard>
    </>
  );
};

export default MerchantInstallmentPlatform;