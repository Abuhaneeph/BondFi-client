import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Marketplace = () => {
  const [showInstallmentsOnly, setShowInstallmentsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Sample product data with essential information only
  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      category: "Electronics",
      price: 450000,
      stock: 15,
      sales: 8,
      allowInstallments: true,
      status: 'active',
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Galaxy S22 Ultra",
      category: "Electronics",
      price: 89999,
      stock: 12,
      sales: 15,
      allowInstallments: true,
      status: 'active',
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "MacBook Air M2",
      category: "Electronics",
      price: 850000,
      stock: 8,
      sales: 22,
      allowInstallments: true,
      status: 'active',
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Samsung 4K TV",
      category: "Electronics",
      price: 320000,
      stock: 20,
      sales: 5,
      allowInstallments: true,
      status: 'active',
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop"
    },
    {
      id: 5,
      name: "AirPods Pro",
      category: "Electronics",
      price: 89000,
      stock: 35,
      sales: 18,
      allowInstallments: false,
      status: 'active',
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop"
    },
    {
      id: 6,
      name: "iPad Air",
      category: "Electronics",
      price: 280000,
      stock: 18,
      sales: 12,
      allowInstallments: true,
      status: 'active',
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop"
    }
  ];

  // Filter products based on installment preference and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesInstallment = !showInstallmentsOnly || product.allowInstallments;
    return matchesSearch && matchesCategory && matchesInstallment;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Products Grid - Merchant Style */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Products</h2>
            <span className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
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
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-foreground">₦{product.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Sales: {product.sales}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.allowInstallments ? 'Installments Available' : 'Full Payment Only'}
                      </span>
                    </div>

                    {/* Token Support */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Accepted tokens:</p>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          cNGN
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          USDT
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          ETH
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Buy Full
                      </Button>
                      {product.allowInstallments ? (
                        <Button variant="outline" size="sm" className="flex-1">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Buy Installment
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <CreditCard className="h-4 w-4 mr-2" />
                          No Installments
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' || showInstallmentsOnly
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products available at the moment'
                  }
                </p>
              </CardContent>
            </Card>
          )}
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
