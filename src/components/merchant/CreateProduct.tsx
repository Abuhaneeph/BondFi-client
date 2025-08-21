import React, { useState } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { 
  Upload, 
  X, 
  Check, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  Package
} from 'lucide-react';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';

const CreateProduct = () => {
  const { 
    isConnected, 
    TEST_TOKEN_CONTRACT_INSTANCE, 
    MERCHANT_REGISTRY_CONTRACT_INSTANCE, 
    PRODUCT_CONTRACT_INSTANCE,
    INSTALLMENT_CONTRACT_INSTANCE, 
    fetchBalance, 
    address, 
    MERCHANT_CORE_CONTRACT_INSTANCE 
  } = useContractInstances();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Product form state - exactly matching merchant interface
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

  // Pinata configuration - matching merchant interface
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-api-key';
  const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_API_SECRET_KEY || 'your-pinata-secret-key';
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'your-pinata-jwt';  

  // Filter out the first token as requested
  const availableTokens = tokens.slice(1);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food'];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Token selection handlers - exactly matching merchant interface
  const handleTokenSelect = (token) => {
    const currentTokens = productForm.acceptedTokens;

    let updatedTokens;
    if (currentTokens.includes(token.address)) {
      updatedTokens = currentTokens.filter(addr => addr !== token.address);
    } else {
      updatedTokens = [...currentTokens, token.address];
    }

    setProductForm({ ...productForm, acceptedTokens: updatedTokens });
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

  // Pinata upload function - exactly matching merchant interface
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

  // Handle file upload - exactly matching merchant interface
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

  // Handle list product - exactly matching merchant interface
  const handleListProduct = async () => {
    if (!productForm.name || !productForm.price || productForm.acceptedTokens.length === 0) {
      showNotification('Please fill in all required fields and select at least one accepted token', 'error');
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
      showNotification('Product listed successfully!');
      setProductForm({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        price: '',
        acceptedTokens: [],
        allowInstallments: false,
        minDownPaymentRate: '2000',
        maxInstallments: '12',
        installmentFrequency: '2592000',
        initialStock: ''
      });
    } catch (error) {
      console.error('Error listing product:', error.message);
      showNotification('Error listing product: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // Token Selection Modal Component - exactly matching merchant interface
  const TokenSelectionModal = () => {
    const currentTokens = productForm.acceptedTokens;

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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Token Selection Button Component - exactly matching merchant interface
  const TokenSelectionButton = ({ selectedTokens, onClick, placeholder = "Select tokens" }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between hover:border-stone-400 transition-colors"
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

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      {/* Connection Status */}
      <div className="max-w-4xl mx-auto mb-6">
        {isConnected ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg w-fit">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm">Connected</span>
            <span className="text-stone-500 text-sm">{address?.slice(0, 6)}...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg w-fit">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">Not Connected</span>
          </div>
        )}
      </div>

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

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Create New Product</h1>
          <p className="text-stone-600">List your products with images, pricing, and installment options</p>
        </div>

        {/* List New Product */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-xl font-semibold mb-4">Product Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={productForm.name}
              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              placeholder="Price (USD) *"
              value={productForm.price}
              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={productForm.category}
              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <textarea
            placeholder="Product Description"
            value={productForm.description}
            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
            rows={3}
          />

          {/* Accepted Tokens Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Accepted Tokens *
            </label>
            <TokenSelectionButton
              selectedTokens={productForm.acceptedTokens}
              onClick={() => setShowTokenModal(true)}
              placeholder="Select accepted tokens"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Product Image
            </label>
            
            <div className="flex flex-col gap-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
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
                      <div className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full animate-pulse"></div>
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
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={productForm.allowInstallments}
                onChange={(e) => setProductForm({...productForm, allowInstallments: e.target.checked})}
                className="w-4 h-4 text-orange-500 border-stone-300 rounded"
              />
              <span>Allow Installments</span>
            </label>

            {productForm.allowInstallments && (
              <>
                <input
                  type="number"
                  placeholder="Min Down Payment (basis points)"
                  value={productForm.minDownPaymentRate}
                  onChange={(e) => setProductForm({...productForm, minDownPaymentRate: e.target.value})}
                  className="px-4 py-2 border border-stone-300 rounded-lg w-48"
                />
                <input
                  type="number"
                  placeholder="Max Installments"
                  value={productForm.maxInstallments}
                  onChange={(e) => setProductForm({...productForm, maxInstallments: e.target.value})}
                  className="px-4 py-2 border border-stone-300 rounded-lg w-32"
                />
                <input
                  type="number"
                  placeholder="Installment Frequency (seconds)"
                  value={productForm.installmentFrequency}
                  onChange={(e) => setProductForm({...productForm, installmentFrequency: e.target.value})}
                  className="px-4 py-2 border border-stone-300 rounded-lg w-48"
                />
              </>
            )}
          </div>

          <button
            onClick={handleListProduct}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Listing Product...' : 'List Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;