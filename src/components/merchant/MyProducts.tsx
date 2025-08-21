import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { Package, Edit, Trash2, Eye, MoreVertical, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';

const MyProducts = () => {
  const { isConnected, TEST_TOKEN_CONTRACT_INSTANCE, MERCHANT_REGISTRY_CONTRACT_INSTANCE, PRODUCT_CONTRACT_INSTANCE, INSTALLMENT_CONTRACT_INSTANCE, fetchBalance, address, MERCHANT_CORE_CONTRACT_INSTANCE } = useContractInstances();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter out the first token as requested
  const availableTokens = tokens.slice(1);

  const categories = [
    'all',
    'Electronics',
    'Mobile',
    'Cosmetics', 
    'Furniture',
    'Watches',
    'Decor',
    'Accessories',
    'Fashion',
    'Sports',
    'Books',
    'Food'
  ];

  // Load products from smart contract when connected
  useEffect(() => {
    if (isConnected) {
      fetchMyProducts();
    }
  }, [isConnected]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch user's products from smart contract
  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const allProducts = await contract.getAllProducts();
      
      // Filter products that belong to the current user (you may need to adjust this logic based on your contract structure)
      // For now, showing all products - you might want to add a merchant filter
      setProducts(allProducts);
      
      showNotification(`Loaded ${allProducts.length} products`);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Error fetching products: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
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

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Products</h1>
        <p className="text-muted-foreground">Manage and track your listed products</p>
        
        {/* Connection Status */}
        <div className="mt-4">
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg inline-flex">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm">Wallet Connected</span>
              <span className="text-green-600 text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg inline-flex">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm">Please connect your wallet to view your products</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
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
              <Button variant="outline" className="px-4 py-3" onClick={fetchMyProducts} disabled={loading || !isConnected}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
            const acceptedTokensInfo = product.acceptedTokens?.map(addr => 
              availableTokens.find(t => t.address === addr)
            ).filter(Boolean) || [];

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
                            const parent = img.parentNode as HTMLElement | null;
                            if (parent) {
                              parent.innerHTML = '<div class="w-12 h-12 text-gray-400 flex items-center justify-center"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
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

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        Sales: {product.sales || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.allowInstallments ? 'Installments Available' : 'Full Payment Only'}
                      </span>
                    </div>

                
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {loading ? 'Loading products...' : 'No products found'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {loading ? 'Please wait while we fetch your products' : 
                     searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'You haven\'t listed any products yet'
                    }
                  </p>
                  {!loading && !searchTerm && selectedCategory === 'all' && (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Package className="h-4 w-4 mr-2" />
                      Create Your First Product
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* Empty State for Disconnected Wallet */
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view and manage your products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProducts;