import React, { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Package,
  User,
  Settings,
  RefreshCw,
  Eye,
  X,
  Check,
  Wallet,
  ArrowRight,
  Bell,
  Filter
} from 'lucide-react';

import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';

const Installments = () => {
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

  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Installment data state
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [customerPlans, setCustomerPlans] = useState([]);
  const [merchantPlans, setMerchantPlans] = useState([]);
  const [eligibilityData, setEligibilityData] = useState(null);

  // UI state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Filter tokens (excluding first token as in original platform)
  const availableTokens = tokens.slice(1);

  useEffect(() => {
    if (isConnected) {
      loadInstallmentData();
    }
  }, [isConnected, address]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadInstallmentData = async () => {
    if (!isConnected) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        loadCustomerPlans(),
        loadMerchantPlans(),
        checkCustomerEligibility()
      ]);
    } catch (error) {
      console.error('Error loading installment data:', error);
      showNotification('Error loading installment data: ' + error.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const loadCustomerPlans = async () => {
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const planIds = await contract.getCustomerPlans(address);
      
      const plans = await Promise.all(
        planIds.map(async (planId) => {
          try {
            const planSummary = await contract.getInstallmentPlanSummary(planId);
            return {
              id: planId.toString(),
              ...planSummary,
              customerName: address, // Current user is customer
              nextPaymentDate: new Date(Number(planSummary.nextPaymentDue) * 1000).toLocaleDateString(),
              startDate: new Date(Number(planSummary.createdAt) * 1000).toLocaleDateString(),
              status: getStatusFromContract(planSummary.status),
              tokenInfo: getTokenInfo(planSummary.paymentToken)
            };
          } catch (error) {
            console.error(`Error loading plan ${planId}:`, error);
            return null;
          }
        })
      );

      setCustomerPlans(plans.filter(plan => plan !== null));
    } catch (error) {
      console.error('Error loading customer plans:', error);
      throw error;
    }
  };

  const loadMerchantPlans = async () => {
    try {
      // Check if user is a merchant
      const merchantRegistryContract = await MERCHANT_REGISTRY_CONTRACT_INSTANCE();
      const isMerchant = await merchantRegistryContract.isRegisteredMerchant(address);
      
      if (!isMerchant) {
        setMerchantPlans([]);
        return;
      }

      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const planIds = await contract.getMerchantPlans(address);
      
      const plans = await Promise.all(
        planIds.map(async (planId) => {
          try {
            const planSummary = await contract.getInstallmentPlanSummary(planId);
            return {
              id: planId.toString(),
              ...planSummary,
              merchantName: address, // Current user is merchant
              nextPaymentDate: new Date(Number(planSummary.nextPaymentDue) * 1000).toLocaleDateString(),
              startDate: new Date(Number(planSummary.createdAt) * 1000).toLocaleDateString(),
              status: getStatusFromContract(planSummary.status),
              tokenInfo: getTokenInfo(planSummary.paymentToken)
            };
          } catch (error) {
            console.error(`Error loading merchant plan ${planId}:`, error);
            return null;
          }
        })
      );

      setMerchantPlans(plans.filter(plan => plan !== null));
    } catch (error) {
      console.error('Error loading merchant plans:', error);
      throw error;
    }
  };

  const checkCustomerEligibility = async () => {
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      const testAmount = parseEther("1000"); // Test with $1000
      const eligibility = await contract.checkCustomerEligibility(address, testAmount);
      setEligibilityData(eligibility);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const getTokenInfo = (tokenAddress) => {
    return availableTokens.find(token => token.address.toLowerCase() === tokenAddress.toLowerCase()) || 
           { symbol: 'Unknown', name: 'Unknown Token', img: '/placeholder.png' };
  };

  const getStatusFromContract = (contractStatus) => {
    // Map contract status numbers to readable status
    const statusMap = {
      0: 'active',
      1: 'completed', 
      2: 'defaulted',
      3: 'cancelled'
    };
    return statusMap[contractStatus] || 'unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (paidAmount, totalAmount) => {
    if (!totalAmount || totalAmount === 0) return 0;
    const paid = Number(formatEther(paidAmount));
    const total = Number(formatEther(totalAmount));
    return (paid / total) * 100;
  };

  const handleMakePayment = async (planId) => {
    if (!planId) return;
    
    setPaymentLoading(true);
    try {
      const contract = await MERCHANT_CORE_CONTRACT_INSTANCE();
      
      // Make installment payment through the core contract
      const tx = await contract.makeInstallmentPayment(planId);
      await tx.wait();
      
      showNotification('Payment made successfully!');
      setShowPaymentModal(false);
      await loadInstallmentData(); // Refresh data
    } catch (error) {
      console.error('Error making payment:', error);
      showNotification('Error making payment: ' + error.message, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleApproveToken = async (tokenAddress, amount) => {
    try {
      const tokenContract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
      const tx = await tokenContract.approve(CONTRACT_ADDRESSES.merchantCoreInstallmentAddress, amount);
      await tx.wait();
      showNotification('Token approved successfully!');
      return true;
    } catch (error) {
      console.error('Token approval error:', error);
      showNotification('Token approval failed: ' + error.message, 'error');
      return false;
    }
  };

  // Combine all plans for display
  const activePlans = [...customerPlans, ...merchantPlans].filter(plan => plan.status === 'active');
  const completedPlans = [...customerPlans, ...merchantPlans].filter(plan => plan.status === 'completed');
  const allPlans = [...customerPlans, ...merchantPlans];

  // Calculate statistics
  const totalActiveValue = activePlans.reduce((sum, plan) => sum + Number(formatEther(plan.totalAmount || 0)), 0);
  const totalPendingAmount = activePlans.reduce((sum, plan) => sum + Number(formatEther(plan.remainingAmount || 0)), 0);
  const totalPaidAmount = allPlans.reduce((sum, plan) => sum + Number(formatEther(plan.paidAmount || 0)), 0);

  const PaymentModal = () => {
    if (!selectedPlan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Make Payment</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Plan: {selectedPlan.description}</p>
              <p className="text-sm text-gray-600">Next Payment Due: {selectedPlan.nextPaymentDate}</p>
              <p className="text-lg font-semibold">
                Amount: {formatEther(selectedPlan.installmentAmount)} {selectedPlan.tokenInfo.symbol}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMakePayment(selectedPlan.id)}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Installment Plans</h1>
          <p className="text-gray-600">Manage and track your installment payments</p>
        </div>
        <button
          onClick={loadInstallmentData}
          disabled={refreshing}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">Please connect your wallet to view installment plans</span>
          </div>
        </div>
      )}

      {/* Customer Eligibility Info */}
      {eligibilityData && isConnected && (
        <div className={`border rounded-lg p-4 ${eligibilityData.isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {eligibilityData.isEligible ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${eligibilityData.isEligible ? 'text-green-800' : 'text-red-800'}`}>
              {eligibilityData.isEligible ? 'Eligible for Installments' : 'Not Eligible for Installments'}
            </span>
          </div>
          {!eligibilityData.isEligible && (
            <p className="text-sm text-red-700">{eligibilityData.reason}</p>
          )}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{activePlans.length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalActiveValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPaidAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Plans ({activePlans.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedPlans.length})
        </button>
      </div>

      {/* Installment Plans List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activePlans : completedPlans).map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Plan Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.description}</h3>
                    <p className="text-gray-600">
                      {plan.customer === address ? `Merchant: ${plan.merchant?.slice(0, 6)}...` : `Customer: ${plan.customer?.slice(0, 6)}...`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <img src={plan.tokenInfo.img} alt={plan.tokenInfo.symbol} className="w-4 h-4 rounded-full" />
                      <span className="text-sm text-gray-500">Paid in {plan.tokenInfo.symbol}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {Number(plan.completedInstallments) || 0}/{Number(plan.totalInstallments) || 0} installments</span>
                    <span>{Math.round(getProgressPercentage(plan.paidAmount, plan.totalAmount))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(plan.paidAmount, plan.totalAmount)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-gray-900">
                      {formatEther(plan.totalAmount || 0)} {plan.tokenInfo.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="font-semibold text-green-600">
                      {formatEther(plan.paidAmount || 0)} {plan.tokenInfo.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="font-semibold text-orange-600">
                      {formatEther(plan.remainingAmount || 0)} {plan.tokenInfo.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Payment</p>
                    <p className="font-semibold text-gray-900">
                      {plan.status === 'completed' ? 'Completed' : formatEther(plan.installmentAmount || 0)} {plan.tokenInfo.symbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 lg:w-48">
                {plan.status === 'active' && plan.customer === address && (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPaymentModal(true);
                      }}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Make Payment
                    </button>
                    <button className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Payment
                    </button>
                  </>
                )}
                <button className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Started: {plan.startDate}</span>
                {plan.status === 'active' && (
                  <span>Next Payment: {plan.nextPaymentDate}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(activeTab === 'active' ? activePlans : completedPlans).length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            No {activeTab} installment plans
          </h3>
          <p className="text-gray-600">
            {activeTab === 'active' 
              ? 'You don\'t have any active installment plans at the moment'
              : 'No completed installment plans yet'
            }
          </p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}

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
    </div>
  );
};

export default Installments;