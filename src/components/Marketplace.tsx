import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { 
  Smartphone, 
  ShoppingBag, 
  Watch, 
  Sofa, 
  Leaf, 
  Gem, 
  Star,
  ChevronRight,
  ArrowRight,
  Filter,
  CreditCard,
  Check,
  Edit,
  Eye,
  Package,
  MoreVertical,
  Search,
  CheckCircle,
  AlertCircle,
  Heart,
  X,
  ChevronDown,
  Upload,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';

const Marketplace = () => {
  const { isConnected, TEST_TOKEN_CONTRACT_INSTANCE, MERCHANT_REGISTRY_CONTRACT_INSTANCE, PRODUCT_CONTRACT_INSTANCE, INSTALLMENT_CONTRACT_INSTANCE, fetchBalance, address, MERCHANT_CORE_CONTRACT_INSTANCE } = useContractInstances();
  
  const [showInstallmentsOnly, setShowInstallmentsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState({});
  const [approving, setApproving] = useState({});

  // State for products and individual purchase forms
  const [products, setProducts] = useState([]);
  const [productPurchaseForms, setProductPurchaseForms] = useState({});

  // Custom CSS for infinite scroll animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 20s linear infinite;
      }
      .animate-scroll:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filter out the first token as requested
  const availableTokens = tokens.slice(1);

  const categories = [
    "all",
    "Electronics",
    "Mobile",
    "Cosmetics",
    "Furniture",
    "Watches",
    "Decor",
    "Accessories"
  ];

  const brands = [
    { name: "IPHONE", logo: "🍎", bgColor: "bg-gray-800", discount: "UP to 80% OFF" },
    { name: "REALME", logo: "📱", bgColor: "bg-yellow-400", discount: "UP to 80% OFF" },
    { name: "XIAOMI", logo: "MI", bgColor: "bg-orange-300", discount: "UP to 80% OFF" },
    { name: "SAMSUNG", logo: "📱", bgColor: "bg-blue-600", discount: "UP to 80% OFF" },
    { name: "OPPO", logo: "📱", bgColor: "bg-green-500", discount: "UP to 80% OFF" }
  ];

  // Duplicate brands for infinite scroll effect
  const infiniteBrands = [...brands, ...brands, ...brands];

  // Initialize purchase form for a specific product
  const initializePurchaseForm = (productIndex, acceptedTokens) => {
    const defaultToken = acceptedTokens.length > 0 ? acceptedTokens[0].symbol : 'USDC';
    return {
      paymentToken: defaultToken,
      quantity: 1,
      isInstallment: false,
      downPayment: '',
      numberOfInstallments: 6
    };
  };

  // Get purchase form for a specific product
  const getPurchaseForm = (productIndex, acceptedTokens) => {
    if (!productPurchaseForms[productIndex]) {
      return initializePurchaseForm(productIndex, acceptedTokens);
    }
    return productPurchaseForms[productIndex];
  };

  // Update purchase form for a specific product
  const updatePurchaseForm = (productIndex, updates) => {
    setProductPurchaseForms(prev => ({
      ...prev,
      [productIndex]: {
        ...prev[productIndex],
        ...updates
      }
    }));
  };

  // Load products from smart contract when connected
  useEffect(() => {
    if (isConnected) {
      fetchProducts();
    }
  }, [isConnected]);

  // Initialize purchase forms when products are loaded
  useEffect(() => {
    const newForms = {};
    products.forEach((product, index) => {
      const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
        availableTokens.find(t => t.address === addr)
      ).filter(Boolean) || [];
      
      if (!productPurchaseForms[index]) {
        newForms[index] = initializePurchaseForm(index, acceptedTokensInfo);
      }
    });
    
    if (Object.keys(newForms).length > 0) {
      setProductPurchaseForms(prev => ({ ...prev, ...newForms }));
    }
  }, [products, availableTokens]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Token approval function
  const approveToken = async (tokenAddress, spenderAddress, amount, productId) => {
    setApproving(prev => ({...prev, [productId]: true}));
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
      setApproving(prev => ({...prev, [productId]: false}));
    }
  };

  // Fetch products from smart contract
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

  // Handle product purchase
  const handlePurchaseProduct = async (productId) => {
    console.log(`Attempting to purchase product with ID: ${productId}`);

    const product = products[productId];
    if (!product) {
      console.error('Product not found in the products array');
      showNotification('Product not found', 'error');
      return;
    }

    const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
      availableTokens.find(t => t.address === addr)
    ).filter(Boolean) || [];

    const purchaseForm = getPurchaseForm(productId, acceptedTokensInfo);
    const selectedToken = availableTokens.find(t => t.symbol === purchaseForm.paymentToken);
    
    if (!selectedToken) {
      console.error('Selected payment token not found in available tokens');
      showNotification('Invalid payment token selected', 'error');
      return;
    }

    // Check if the selected token is accepted by the product
    const isTokenAccepted = product.acceptedTokens?.includes(selectedToken.address);
    if (!isTokenAccepted) {
      console.error('Selected token is not accepted by the product');
      showNotification('This payment token is not accepted for this product', 'error');
      return;
    }

    setLoading(prev => ({...prev, [productId]: true}));
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      
      // Convert purchaseForm.quantity to BigInt before multiplication
      const totalAmount = product.price * BigInt(purchaseForm.quantity);
      
      // Convert to Wei if needed (assuming price is in token units)
      const amountToApprove = totalAmount.toString();
      
      // First approve the token
      const approved = await approveToken(
        selectedToken.address,
        CONTRACT_ADDRESSES.merchantCoreInstallmentAddress,
        amountToApprove,
        productId
      );
      
      if (!approved) {
        setLoading(prev => ({...prev, [productId]: false}));
        return;
      }

      let tx;
      
      if (purchaseForm.isInstallment) {
        tx = await contract.purchaseProductWithInstallments(
          productId + 1,
          selectedToken.address,
          purchaseForm.quantity,
          purchaseForm.downPayment,
          purchaseForm.numberOfInstallments
        );
      } else {
        tx = await contract.purchaseProduct(
          productId + 1,
          selectedToken.address,
          purchaseForm.quantity
        );
      }
      
      await tx.wait();
      showNotification('Product purchased successfully!');
      fetchProducts();
      
      // Reset the form for this product after successful purchase
      const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
        availableTokens.find(t => t.address === addr)
      ).filter(Boolean) || [];
      setProductPurchaseForms(prev => ({
        ...prev,
        [productId]: initializePurchaseForm(productId, acceptedTokensInfo)
      }));
      
    } catch (error) {
      console.error('Error purchasing product:', error);
      showNotification('Error purchasing product: ' + error.message, 'error');
    }
    setLoading(prev => ({...prev, [productId]: false}));
  };

  // Filter products based on installment preference and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesInstallment = !showInstallmentsOnly || product.allowInstallments;
    return matchesSearch && matchesCategory && matchesInstallment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
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

      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                Welcome to <span className="text-orange-400">BondFi</span> Market
              </h1>
              <p className="text-lg mb-5 text-blue-50">
                Discover amazing deals on smartphones, electronics, and daily essentials. 
                Shop smart, save more with our exclusive offers and installment plans.
              </p>
              
              {/* Connection Status */}
              <div className="mb-4">
                {isConnected ? (
                  <div className="flex items-center gap-2 bg-green-600 bg-opacity-20 border border-green-400 px-4 py-2 rounded-lg inline-flex">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    <span className="text-green-100 text-sm">Wallet Connected</span>
                    <span className="text-green-300 text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-600 bg-opacity-20 border border-red-400 px-4 py-2 rounded-lg inline-flex">
                    <AlertCircle className="w-4 h-4 text-red-300" />
                    <span className="text-red-100 text-sm">Please connect your wallet to shop</span>
                  </div>
                )}
              </div>
              
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Shop Now
              </button>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://res.cloudinary.com/ecosheane/image/upload/v1755708849/11873-removebg-preview_m9glrv.png" 
                alt="Smart Watch" 
                className="drop-shadow-2xl w-80 h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <Button 
                  variant="outline" 
                  className="px-4 py-3"
                  onClick={() => setShowInstallmentsOnly(!showInstallmentsOnly)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {showInstallmentsOnly ? 'Show All' : 'Installments Only'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid - Smart Contract Integrated */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Products from Smart Contract</h2>
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
              const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
                availableTokens.find(t => t.address === addr)
              ).filter(Boolean) || [];

              // Get the purchase form for this specific product
              const purchaseForm = getPurchaseForm(index, acceptedTokensInfo);

              // Check if this specific product is loading or approving
              const isCurrentlyLoading = loading[index] || false;
              const isCurrentlyApproving = approving[index] || false;

              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-t-lg"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentNode as HTMLElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-12 h-12 text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      {product.allowInstallments && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Installments
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{product.name || 'Product Name'}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{product.category || 'Electronics'}</p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description || 'High-quality product with excellent features.'}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-foreground">
                          ${product.price ? formatEther(product.price) : '0.00'}
                        </span>
                        <span className="text-sm text-muted-foreground">Stock: {product.stock || 'N/A'}</span>
                      </div>

                      {/* Accepted Tokens Display */}
                      {acceptedTokensInfo.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Accepted tokens:</p>
                          <div className="flex gap-2">
                            {acceptedTokensInfo.slice(0, 3).map((token, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                <img src={token.img} alt={token.symbol} className="w-3 h-3 rounded-full mr-1" />
                                {token.symbol}
                              </span>
                            ))}
                            {acceptedTokensInfo.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                +{acceptedTokensInfo.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Purchase Controls - Individual for each product */}
                      {isConnected && acceptedTokensInfo.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <select
                            value={purchaseForm.paymentToken}
                            onChange={(e) => updatePurchaseForm(index, { paymentToken: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                            onChange={(e) => updatePurchaseForm(index, { quantity: parseInt(e.target.value) || 1 })}
                            placeholder="Quantity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />

                          {product.allowInstallments && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={purchaseForm.isInstallment}
                                onChange={(e) => updatePurchaseForm(index, { 
                                  isInstallment: e.target.checked,
                                  // Clear down payment when switching to full payment
                                  downPayment: e.target.checked ? purchaseForm.downPayment : ''
                                })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              <span className="text-sm">Pay in Installments</span>
                            </div>
                          )}

                          {purchaseForm.isInstallment && (
                            <>
                              <input
                                type="number"
                                min="1"
                                max="24"
                                value={purchaseForm.numberOfInstallments}
                                onChange={(e) => updatePurchaseForm(index, { numberOfInstallments: parseInt(e.target.value) || 6 })}
                                placeholder="Number of installments"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={purchaseForm.downPayment}
                                onChange={(e) => updatePurchaseForm(index, { downPayment: e.target.value })}
                                placeholder="Down payment amount"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isConnected ? (
                          acceptedTokensInfo.length > 0 ? (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handlePurchaseProduct(index)}
                              disabled={isCurrentlyLoading || isCurrentlyApproving}
                            >
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              {isCurrentlyApproving ? 'Approving...' : 
                               isCurrentlyLoading ? 'Processing...' : 
                               (purchaseForm.isInstallment ? 'Buy Installment' : 'Buy Full')}
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="flex-1" disabled>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              No Payment Tokens
                            </Button>
                          )
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1" disabled>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Connect Wallet
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="px-3">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {!isConnected 
                    ? 'Please connect your wallet to view products'
                    : searchTerm || selectedCategory !== 'all' || showInstallmentsOnly
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products available at the moment'
                  }
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Electronics Brands Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Electronics Brands</h2>
          <div className="flex gap-6 overflow-hidden pb-4">
            <div className="flex gap-6 animate-scroll">
              {infiniteBrands.map((brand, index) => (
                <div key={index} className={`${brand.bgColor} rounded-lg p-6 min-w-[200px] text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0`}>
                  <div className="text-xs font-bold mb-2">{brand.name}</div>
                  <div className="text-4xl mb-3">{brand.logo}</div>
                  <p className="text-sm font-medium">{brand.discount}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {brands.map((_, index) => (
              <div key={index} className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Marketplace;