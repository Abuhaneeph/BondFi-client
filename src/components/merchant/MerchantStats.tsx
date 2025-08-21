import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { Store, Package, DollarSign, TrendingUp, Users, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';

interface MerchantStatsProps {
  userInfo: any;
  totalStats: any;
}

const MerchantStats: React.FC<MerchantStatsProps> = ({ userInfo, totalStats }) => {
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
  const [merchantData, setMerchantData] = useState(null);
  const [products, setProducts] = useState([]);
  const [customerPlans, setCustomerPlans] = useState([]);
  const [merchantPlans, setMerchantPlans] = useState([]);

  // Real stats from smart contracts
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    activeInstallments: 0,
    monthlyRevenue: 0,
    customerCount: 0,
    pendingPayments: 0
  });

  // Filter out the first token as done in the platform
  const availableTokens = tokens.slice(1);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch merchant data from smart contract using correct function name
  const fetchMerchantData = async () => {
    if (!isConnected || !address) return;

    try {
      const coreContract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      // Use getMerchantInfo instead of getMerchant
      const merchantInfo = await coreContract.getMerchantInfo(address);
      
      if (merchantInfo && merchantInfo.businessName) {
        setMerchantData({
          businessName: merchantInfo.businessName,
          contactInfo: merchantInfo.contactInfo,
          businessCategory: merchantInfo.businessCategory,
          acceptedTokens: merchantInfo.acceptedTokens,
          isActive: merchantInfo.isActive,
          registrationTime: merchantInfo.registrationTime,
          totalSales: merchantInfo.totalSales || 0,
          totalOrders: merchantInfo.totalOrders || 0
        });
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
      showNotification('Error fetching merchant data: ' + error.message, 'error');
    }
  };

  // Fetch products for this merchant using correct function name
  const fetchMerchantProducts = async () => {
    if (!isConnected || !address) return;

    try {
      const coreContract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      // Use getMerchantProducts instead of getAllProducts with filtering
      const merchantProducts = await coreContract.getMerchantProducts(address);
      
      setProducts(merchantProducts);
      
      // Calculate stats from products
      const totalProducts = merchantProducts.length;
      let totalSalesValue = 0;
      
      // Calculate total potential sales value from products
      merchantProducts.forEach(product => {
        // Calculate based on price and stock sold (if available)
        const productValue = Number(formatEther(product.price));
        // Note: The contract doesn't seem to track individual product sales,
        // we'll need to get this from merchant stats instead
        totalSalesValue += productValue; // This would be potential value
      });

      setStats(prevStats => ({
        ...prevStats,
        totalProducts
      }));
      
    } catch (error) {
      console.error('Error fetching merchant products:', error);
      showNotification('Error fetching products: ' + error.message, 'error');
    }
  };

  // Fetch installment plans for this merchant
  const fetchInstallmentData = async () => {
    if (!isConnected || !address) return;

    try {
      const coreContract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      
      // Get merchant installment plans
      const merchantPlanIds = await coreContract.getMerchantPlans(address);
      setMerchantPlans(merchantPlanIds);
      
      // Get detailed information for each plan
      const planDetails = [];
      let activeInstallments = 0;
      let pendingPayments = 0;
      let monthlyRevenue = 0;

      for (let i = 0; i < Math.min(merchantPlanIds.length, 10); i++) { // Limit to 10 for performance
        try {
          const planSummary = await coreContract.getInstallmentPlanSummary(merchantPlanIds[i]);
          
          planDetails.push({
            planId: merchantPlanIds[i],
            productDescription: planSummary.productDescription,
            totalAmount: formatEther(planSummary.totalAmount),
            paidAmount: formatEther(planSummary.paidAmount),
            remainingAmount: formatEther(planSummary.remainingAmount),
            isCompleted: planSummary.isCompleted,
            nextPaymentDue: planSummary.nextPaymentDue,
            customer: planSummary.customer
          });

          if (!planSummary.isCompleted) {
            activeInstallments++;
            pendingPayments += Number(formatEther(planSummary.remainingAmount));
          }

          // Calculate monthly revenue (approximate based on recent payments)
          const paidAmount = Number(formatEther(planSummary.paidAmount));
          if (paidAmount > 0) {
            monthlyRevenue += paidAmount * 0.1; // Rough estimate
          }

        } catch (error) {
          console.error(`Error fetching plan ${merchantPlanIds[i]}:`, error);
        }
      }

      setStats(prevStats => ({
        ...prevStats,
        activeInstallments,
        pendingPayments,
        monthlyRevenue
      }));

      return planDetails.slice(0, 3); // Return first 3 for display
      
    } catch (error) {
      console.error('Error fetching installment data:', error);
      showNotification('Error fetching installment data: ' + error.message, 'error');
      return [];
    }
  };

  // Get merchant balance for accepted tokens
  const fetchMerchantBalances = async () => {
    if (!isConnected || !address || !merchantData?.acceptedTokens) return;

    try {
      const balancePromises = merchantData.acceptedTokens.map(async (tokenAddress) => {
        const tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
        const balance = await tokenContract.balanceOf(address);
        const tokenInfo = availableTokens.find(t => t.address === tokenAddress);
        
        return {
          address: tokenAddress,
          symbol: tokenInfo?.symbol || 'Unknown',
          balance: formatEther(balance)
        };
      });

      const balances = await Promise.all(balancePromises);
      console.log('Merchant token balances:', balances);
      
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Initialize data when connected
  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      
      const initializeData = async () => {
        try {
          await fetchMerchantData();
          await fetchMerchantProducts();
          const recentPlans = await fetchInstallmentData();
          
          // Update stats with merchant data if available
          if (merchantData) {
            setStats(prevStats => ({
              ...prevStats,
              totalSales: Number(formatEther(merchantData.totalSales || 0)),
              customerCount: merchantData.totalOrders || 0
            }));
          }
          
        } catch (error) {
          console.error('Error initializing data:', error);
          showNotification('Error loading dashboard data', 'error');
        } finally {
          setLoading(false);
        }
      };

      initializeData();
    }
  }, [isConnected, address]);

  // Fetch balances when merchant data is available
  useEffect(() => {
    if (merchantData) {
      fetchMerchantBalances();
      
      // Update stats with merchant registry data
      setStats(prevStats => ({
        ...prevStats,
        totalSales: Number(formatEther(merchantData.totalSales || 0)),
        customerCount: merchantData.totalOrders || 0
      }));
    }
  }, [merchantData]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Sales',
      value: `$${stats.totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Installments',
      value: stats.activeInstallments,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Orders',
      value: stats.customerCount,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Pending Payments',
      value: `$${stats.pendingPayments.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: Store,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 px-6 py-4 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Please connect your wallet to view merchant stats</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 px-6 py-4 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-700">Loading merchant data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 px-6 py-4 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">No merchant data found. Please register as a merchant first.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {merchantData.businessName}!
        </h1>
        <p className="text-muted-foreground">Here's an overview of your business performance</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.slice(0, 3).length > 0 ? products.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name || `Product ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(formatEther(product.price)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {product.category || 'Uncategorized'}
                    </span>
                    <div className="text-xs text-green-600">
                      Stock: {product.stock || 0}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No products listed yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Installment Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {merchantPlans.length > 0 ? merchantPlans.slice(0, 3).map((planId, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Plan #{planId.toString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Installment Plan
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No installment plans yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Merchant Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Merchant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Business Category</p>
              <p className="font-medium">{merchantData.businessCategory || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Info</p>
              <p className="font-medium">{merchantData.contactInfo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales (from registry)</p>
              <p className="font-medium text-green-600">
                ${Number(formatEther(merchantData.totalSales || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="font-medium">{merchantData.totalOrders || 0}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Accepted Tokens</p>
              <div className="flex gap-2 flex-wrap">
                {merchantData.acceptedTokens?.map((tokenAddress, idx) => {
                  const token = availableTokens.find(t => t.address === tokenAddress);
                  return token ? (
                    <div key={idx} className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md">
                      <img src={token.img} alt={token.symbol} className="w-4 h-4 rounded-full" />
                      <span className="text-xs font-medium">{token.symbol}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantStats;