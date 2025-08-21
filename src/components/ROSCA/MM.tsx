import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { 
  ShoppingCart, 
  Store, 
  CreditCard, 
  Package, 
  Search, 
  Plus, 
  Settings,
  User,
  Calendar,
  DollarSign,
  Filter,
  Heart,
  Star,
  Eye,
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

const MerchantInstallmentPlatform = () => {
  const { isConnected, TEST_TOKEN_CONTRACT_INSTANCE, MERCHANT_REGISTRY_CONTRACT_INSTANCE, PRODUCT_CONTRACT_INSTANCE,INSTALLMENT_CONTRACT_INSTANCE, fetchBalance, address, MERCHANT_CORE_CONTRACT_INSTANCE } = useContractInstances();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [approving, setApproving] = useState(false);

  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [modalContext, setModalContext] = useState(''); // 'product' or 'merchant'

  // State for different sections
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [userType, setUserType] = useState('customer'); // 'customer' or 'merchant'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    paymentToken: 'USDC',
    quantity: 1,
    isInstallment: false,
    downPayment: '',
    numberOfInstallments: 6
  });

  // Pinata configuration - Replace with your actual Pinata credentials
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-api-key';
  const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_API_SECRET_KEY || 'your-pinata-secret-key';
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'your-pinata-jwt';  

  // Filter out the first token as requested
  const availableTokens = tokens.slice(1);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food'];

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

const handlePurchaseProduct = async (productId) => {
    console.log(`Attempting to purchase product with ID: ${productId}`);

    const product = products[productId];
    if (!product) {
        console.error('Product not found in the products array');
        showNotification('Product not found', 'error');
        return;
    }
    console.log('Product found:', product);

    const selectedToken = availableTokens.find(t => t.symbol === purchaseForm.paymentToken);
    if (!selectedToken) {
        console.error('Selected payment token not found in available tokens');
        showNotification('Invalid payment token selected', 'error');
        return;
    }
    console.log('Selected token:', selectedToken);

    // Check if the selected token is accepted by the product
    const isTokenAccepted = product.acceptedTokens?.includes(selectedToken.address);
    if (!isTokenAccepted) {
        console.error('Selected token is not accepted by the product');
        showNotification('This payment token is not accepted for this product', 'error');
        return;
    }
    console.log('Token is accepted by the product');

    setLoading(true);
    try {
        const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
        console.log('Contract instance obtained:', contract);

        console.log('Product price:', product.price);
        console.log('Purchase quantity:', purchaseForm.quantity);
        
        // Convert purchaseForm.quantity to BigInt before multiplication
        const totalAmount = product.price * BigInt(purchaseForm.quantity);
        console.log('Total amount in Wei:', totalAmount);
        
        // Convert to Wei if needed (assuming price is in token units)
        const amountToApprove = totalAmount.toString();
        console.log('Amount to approve:', amountToApprove);
        
        // First approve the token
        const approved = await approveToken(
            selectedToken.address,
            CONTRACT_ADDRESSES.merchantCoreInstallmentAddress,
            amountToApprove
        );
        console.log('Token approval result:', approved);
        
        if (!approved) {
            console.error('Token approval failed');
            setLoading(false);
            return;
        }

        let tx;
        
        if (purchaseForm.isInstallment) {
            console.log('Purchasing with installments');
       
            tx = await contract.purchaseProductWithInstallments(
                productId+1,
                selectedToken.address,
                purchaseForm.quantity,
                purchaseForm.downPayment,
                purchaseForm.numberOfInstallments
            );
        } else {
            console.log('Purchasing without installments');
            tx = await contract.purchaseProduct(
                productId+1,
                selectedToken.address,
                purchaseForm.quantity
            );
        }
        
        console.log('Transaction sent:', tx);
        await tx.wait();
        console.log('Transaction confirmed:', tx);

        showNotification('Product purchased successfully!');
        fetchProducts();
    } catch (error) {
        console.error('Error purchasing product:', error);
        showNotification('Error purchasing product: ' + error.message, 'error');
    }
    setLoading(false);
};

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                          e.target.style.display = 'none';
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

  // Token Selection Button Component
  const TokenSelectionButton = ({ selectedTokens, onClick, placeholder = "Select tokens" }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta bg-white text-left flex items-center justify-between hover:border-stone-400 transition-colors"
      >
        <div className="flex-1">
          {selectedTokens.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {getSelectedTokens(selectedTokens).slice(0, 3).map((token, idx) => (
                  <img
                    key={idx}
                    src={token.img}
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-stone-700 font-medium">
                {getSelectedTokenNames(selectedTokens)}
              </span>
            </div>
          ) : (
            <span className="text-stone-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedTokens.length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {selectedTokens.length}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-stone-400" />
        </div>
      </button>
    );
  };

const renderMarketplace = () => (
    <div className="space-y-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
                const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
                    availableTokens.find(t => t.address === addr)
                ).filter(Boolean) || [];

                return (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-stone-100 rounded-xl mb-4 flex items-center justify-center">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <Package className="w-12 h-12 text-stone-400" />
                            )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{product.name || 'Sample Product'}</h3>
                        <p className="text-stone-600 text-sm mb-3 line-clamp-2">{product.description || 'High-quality product with excellent features.'}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-stone-800">${formatEther(product.price)}</span>
                            <span className="text-sm text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                                {product.category || 'Electronics'}
                            </span>
                        </div>

                        {/* Accepted Tokens Display */}
                        {acceptedTokensInfo.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-stone-500 mb-2">Accepted tokens:</p>
                                <div className="flex gap-1 flex-wrap">
                                    {acceptedTokensInfo.slice(0, 3).map((token, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md">
                                            <img src={token.img} alt={token.symbol} className="w-4 h-4 rounded-full" />
                                            <span className="text-xs font-medium">{token.symbol}</span>
                                        </div>
                                    ))}
                                    {acceptedTokensInfo.length > 3 && (
                                        <div className="bg-stone-100 px-2 py-1 rounded-md">
                                            <span className="text-xs text-stone-600">+{acceptedTokensInfo.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {product.allowInstallments && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
                                <span className="text-green-700 text-sm">✓ Installments Available</span>
                            </div>
                        )}

                        {/* Purchase Options */}
                        <div className="space-y-3 mb-4">
                            <select
                                value={purchaseForm.paymentToken}
                                onChange={(e) => setPurchaseForm({...purchaseForm, paymentToken: e.target.value})}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            >
                                {acceptedTokensInfo.map((token) => (
                                    <option key={token.address} value={token.symbol}>
                                        Pay with {token.symbol}
                                    </option>
                                ))}
                            </select>
                            
                            <input
                                type="number"
                                min="1"
                                value={purchaseForm.quantity}
                                onChange={(e) => setPurchaseForm({...purchaseForm, quantity: parseInt(e.target.value)})}
                                placeholder="Quantity"
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                            />
                        </div>

                        {/* Payment Option Toggle */}
                        <div className="flex items-center mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={purchaseForm.isInstallment}
                                    onChange={(e) => setPurchaseForm({...purchaseForm, isInstallment: e.target.checked})}
                                    className="w-4 h-4 text-terracotta border-stone-300 rounded"
                                />
                                <span>Pay in Installments</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePurchaseProduct(index)}
                                disabled={loading || approving}
                                className="flex-1 bg-gradient-to-r from-terracotta to-sage text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                                <ShoppingCart className="w-4 h-4 inline mr-2" />
                                {loading || approving ? 'Processing...' : 'Buy Now'}
                            </button>
                            <button className="px-4 py-3 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            }) : (
                <div className="col-span-full text-center py-12">
                    <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500 text-lg">No products found</p>
                </div>
            )}
        </div>
    </div>
);

  const renderMerchantDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Merchant Dashboard</h2>
        <p className="text-stone-600">Manage your products and sales</p>
      </div>

      {userType !== 'merchant' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-xl font-semibold mb-4">Register as Merchant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Business Name *"
              value={merchantForm.businessName}
              onChange={(e) => setMerchantForm({...merchantForm, businessName: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <input
              type="text"
              placeholder="Contact Information *"
              value={merchantForm.contactInfo}
              onChange={(e) => setMerchantForm({...merchantForm, contactInfo: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <select
              value={merchantForm.businessCategory}
              onChange={(e) => setMerchantForm({...merchantForm, businessCategory: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="">Select Business Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Accepted Tokens *
              </label>
              <TokenSelectionButton
                selectedTokens={merchantForm.acceptedTokens}
                onClick={() => openTokenModal('merchant')}
                placeholder="Select accepted tokens"
              />
            </div>
          </div>
          
          <button
            onClick={handleRegisterMerchant}
            disabled={loading}
            className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register as Merchant'}
          </button>
        </div>
      )}

      {/* List New Product */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <h3 className="text-xl font-semibold mb-4">List New Product</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Name *"
            value={productForm.name}
            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          <input
            type="number"
            placeholder="Price (USD) *"
            value={productForm.price}
            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          <select
            value={productForm.category}
            onChange={(e) => setProductForm({...productForm, category: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Initial Stock"
            value={productForm.initialStock}
            onChange={(e) => setProductForm({...productForm, initialStock: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>

        <textarea
          placeholder="Product Description"
          value={productForm.description}
          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
          className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta mb-4"
          rows={3}
        />

        {/* Accepted Tokens Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Accepted Tokens *
          </label>
          <TokenSelectionButton
            selectedTokens={productForm.acceptedTokens}
            onClick={() => openTokenModal('product')}
            placeholder="Select accepted tokens"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Product Image
          </label>
          
          <div className="flex flex-col gap-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-terracotta transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-stone-400" />
                <div>
                  <p className="text-stone-600 font-medium">
                    {uploadingImage ? 'Uploading to IPFS...' : 'Upload Image to Pinata'}
                  </p>
                  <p className="text-stone-400 text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </label>
              {uploadingImage && (
                <div className="mt-3">
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-terracotta to-sage h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {productForm.imageUrl && (
              <div className="relative">
                <img
                  src={productForm.imageUrl}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-xl border border-stone-200"
                />
                <button
                  onClick={() => setProductForm({...productForm, imageUrl: ''})}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Manual URL Input */}
            <div className="text-center text-stone-500 text-sm">or</div>
            <input
              type="url"
              placeholder="Or paste IPFS URL manually"
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={productForm.allowInstallments}
              onChange={(e) => setProductForm({...productForm, allowInstallments: e.target.checked})}
              className="w-4 h-4 text-terracotta border-stone-300 rounded"
            />
            <span>Allow Installments</span>
          </label>
  
          {productForm.allowInstallments && (
            <>
              <input
                type="number"
                placeholder="Min Down Payment %"
                value={productForm.minDownPaymentRate}
                onChange={(e) => setProductForm({...productForm, minDownPaymentRate: e.target.value})}
                className="px-4 py-2 border border-stone-300 rounded-lg w-32"
              />
              <input
                type="number"
                placeholder="Max Installments"
                value={productForm.maxInstallments}
                onChange={(e) => setProductForm({...productForm, maxInstallments: e.target.value})}
                className="px-4 py-2 border border-stone-300 rounded-lg w-32"
              />
            </>
          )}
        </div>

        <button
          onClick={handleListProduct}
          disabled={loading}
          className="w-full bg-gradient-to-r from-terracotta to-sage text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Listing Product...' : 'List Product'}
        </button>
      </div>
    </div>
  );

  const renderInstallments = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Installment Plans</h2>
        <p className="text-stone-600">Manage your payment plans</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <h3 className="text-xl font-semibold mb-4">Your Active Plans</h3>
        
        <div className="space-y-4">
          {[1, 2, 3].map((plan) => (
            <div key={plan} className="border border-stone-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">MacBook Pro 16"</h4>
                  <p className="text-stone-600 text-sm">Plan #{plan}001</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
                  Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-stone-500 text-sm">Total Amount</p>
                  <p className="font-semibold">$2,499.00</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Paid</p>
                  <p className="font-semibold text-green-600">$833.00</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Remaining</p>
                  <p className="font-semibold text-orange-600">$1,666.00</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Next Payment</p>
                  <p className="font-semibold">Dec 15, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-terracotta to-sage text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
                  Make Payment
                </button>
                <button className="border border-stone-300 px-6 py-2 rounded-lg hover:bg-stone-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-terracotta to-sage bg-clip-text text-transparent">
                AfriMart
              </h1>
              
              <div className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'marketplace' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Marketplace
                </button>
                <button
                  onClick={() => setActiveTab('merchant')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'merchant' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Merchant
                </button>
                <button
                  onClick={() => setActiveTab('installments')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'installments' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Installments
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-sm">Connected</span>
                  <span className="text-stone-500 text-sm">{address?.slice(0, 6)}...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">Not Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'marketplace' && renderMarketplace()}
        {activeTab === 'merchant' && renderMerchantDashboard()}
        {activeTab === 'installments' && renderInstallments()}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-30">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'marketplace' ? 'text-terracotta' : 'text-stone-600'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-xs">Marketplace</span>
          </button>
          <button
            onClick={() => setActiveTab('merchant')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'merchant' ? 'text-terracotta' : 'text-stone-600'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Merchant</span>
          </button>
          <button
            onClick={() => setActiveTab('installments')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'installments' ? 'text-terracotta' : 'text-stone-600'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">Installments</span>
          </button>
        </div>
      </div>
    </div>
  );
};
