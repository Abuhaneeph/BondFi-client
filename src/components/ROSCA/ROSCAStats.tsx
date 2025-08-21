import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Star, Calendar, TrendingUp, Wallet, Shield, CheckCircle, Loader } from 'lucide-react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import tokens from '@/lib/Tokens/tokens';

interface ROSCAStatsProps {
  userInfo: any;
  isLoading?: boolean;
}

const ROSCAStats: React.FC<ROSCAStatsProps> = ({ userInfo, isLoading = false }) => {
  // State management (same pattern as AjoEsusuInterface)
  const [myGroups, setMyGroups] = useState([]);
  const [totalStats, setTotalStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState([]);

  const { isConnected, SAVING_CONTRACT_INSTANCE, address } = useContractInstances();

  // Get supported tokens (excluding ETH which is id: 1) - same as AjoEsusuInterface
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts - same logic as AjoEsusuInterface
  const formatTokenAmount = (amountInWei, decimals = 18) => {
    if (!amountInWei) return '$0';
    const divisor = Math.pow(10, decimals);
    return `$${(parseFloat(amountInWei) / divisor).toFixed(2)}`;
  };

  // Get time remaining - same logic as AjoEsusuInterface
  const getTimeRemaining = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(timestamp) - now;
    
    if (remaining <= 0) return "Expired";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Initialize data - adapted from AjoEsusuInterface
  const initializeStatsData = async () => {
    if (!isConnected || !address) return;
    
    setIsStatsLoading(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      
      // Get user's groups - same logic as AjoEsusuInterface
      const userGroupIds = await Saving_Contract.getUserGroups(address);
      const userGroupsData = await Promise.all(
        userGroupIds.map(async (groupId) => {
          const summary = await Saving_Contract.getGroupSummary(groupId);
          const savingInfo = await Saving_Contract.savingsGroups(groupId);
          const contributionStatus = await Saving_Contract.getUserContributionStatus(groupId, address);
          
          return { 
            ...summary, 
            contributionStatus,
            groupId
          };
        })
      );
      setMyGroups(userGroupsData);
      
      // Get supported tokens
      const tokenData = await Saving_Contract.getSupportedTokens();
      setSupportedTokens(tokenData);
      
      // Get total stats
      const stats = await Saving_Contract.getTotalStats();
      setTotalStats(stats);
      
    } catch (error) {
      console.error('Error initializing stats data:', error);
    }
    setIsStatsLoading(false);
  };

  // Effect hook - same pattern as AjoEsusuInterface
  useEffect(() => {
    if (isConnected && address && userInfo) {
      initializeStatsData();
    }
  }, [isConnected, address, userInfo]);

  // Calculate next payout deadline from active groups
  const getNextPayoutDeadline = () => {
    if (!myGroups || myGroups.length === 0) return 'No active groups';
    
    // Find groups where user is the current recipient
    const recipientGroups = myGroups.filter(group => 
      group[14] === address && group[10] // currentRecipient === user && isActive
    );
    
    if (recipientGroups.length > 0) {
      return 'Claim available!';
    }
    
    // Find next contribution deadline from active groups
    const activeGroups = myGroups.filter(group => 
      group[10] && !group[11] && !group.contributionStatus?.[0] // active, not completed, not contributed
    );
    
    if (activeGroups.length === 0) return 'All contributions up to date';
    
    // Get earliest deadline
    let earliestDeadline = null;
    let earliestGroup = null;
    
    activeGroups.forEach(group => {
      const deadline = group[13]; // nextContributionDeadline
      if (deadline && (!earliestDeadline || Number(deadline) < Number(earliestDeadline))) {
        earliestDeadline = deadline;
        earliestGroup = group;
      }
    });
    
    if (!earliestDeadline) return 'No pending deadlines';
    
    return getTimeRemaining(earliestDeadline);
  };

  // Calculate total potential payout from active groups
  const getTotalPotentialPayout = () => {
    if (!myGroups || myGroups.length === 0) return '$0';
    
    const activeGroups = myGroups.filter(group => group[10] && !group[11]); // active but not completed
    
    let totalPayout = 0;
    activeGroups.forEach(group => {
      const contributionAmount = parseFloat(group[5] || 0); // contributionAmount
      const maxMembers = parseInt(group[7]?.toString() || '0'); // maxMembers
      totalPayout += contributionAmount * maxMembers;
    });
    
    return formatTokenAmount(totalPayout.toString());
  };

  // Get user stats - same structure as AjoEsusuInterface userInfo
  const getUserStats = () => {
    if (!userInfo) {
      return {
        totalContributed: '$0',
        activeGroups: 0,
        completedGroups: 0,
        reputationScore: 0,
        nextPayout: 'Not registered',
        hasDefaulted: false
      };
    }

    try {
      // userInfo structure from AjoEsusuInterface getMemberInfo:
      // [name, totalContributions, totalReceived, activeGroups, completedGroups, hasRegistered, hasDefaulted, reputationScore, joinDate, lastActivity]
      
      return {
        totalContributed: formatTokenAmount(userInfo[1] || 0), // totalContributions
        activeGroups: parseInt(userInfo[3]?.toString() || '0'), // activeGroups
        completedGroups: parseInt(userInfo[4]?.toString() || '0'), // completedGroups  
        reputationScore: parseInt(userInfo[7]?.toString() || '0'), // reputationScore
        nextPayout: getNextPayoutDeadline(),
        hasDefaulted: Boolean(userInfo[6]) // hasDefaulted
      };
    } catch (error) {
      console.error('Error processing user stats:', error);
      return {
        totalContributed: '$0',
        activeGroups: 0,
        completedGroups: 0,
        reputationScore: 0,
        nextPayout: 'Error loading',
        hasDefaulted: false
      };
    }
  };

  // Count groups created by user
  const getGroupsCreatedCount = () => {
    if (!myGroups || !address) return 0;
    return myGroups.filter(group => group[2] === address).length; // creator === user
  };

  const stats = getUserStats();

  // Show loading state
  if (isLoading || isStatsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-stone-300 rounded-full"></div>
                <div className="h-4 bg-stone-300 rounded w-24"></div>
              </div>
              <div className="h-8 bg-stone-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-stone-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show connection prompt - same as AjoEsusuInterface
  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
            <Shield className="w-16 h-16 text-terracotta mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Connect Your Wallet</h3>
            <p className="text-stone-600">Please connect your wallet to view your statistics</p>
          </div>
        </div>
      </div>
    );
  }

  // Show registration prompt if user is not registered
  if (!userInfo) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
            <Users className="w-16 h-16 text-terracotta mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Welcome to BondFi ROSCA</h3>
            <p className="text-stone-600 mb-4">
              Register to start participating in traditional rotating savings circles
            </p>
            <p className="text-stone-500 text-sm">
              Connect your wallet and register to view your statistics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Contributed Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-sage/10 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-semibold text-stone-800">Total Contributions</h3>
        </div>
        <p className="text-2xl font-bold text-stone-800 mb-1">
          {stats.totalContributed}
        </p>
        <p className="text-sage text-sm">
          Across {stats.activeGroups} active group{stats.activeGroups !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Potential Payout Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-stone-800">Potential Payout</h3>
        </div>
        <p className="text-2xl font-bold text-emerald-600 mb-1">
          {getTotalPotentialPayout()}
        </p>
        <p className="text-emerald-600 text-sm">
          When your turn comes
        </p>
      </div>

      {/* Next Action Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-semibold text-stone-800">Next Action</h3>
        </div>
        <p className="text-2xl font-bold text-stone-800 mb-1">
          {stats.nextPayout}
        </p>
        <p className="text-stone-500 text-sm">
          {stats.nextPayout.includes('d') || stats.nextPayout.includes('h') || stats.nextPayout.includes('m') 
            ? 'Time remaining' : 'Status'}
        </p>
      </div>

      {/* Reputation Score Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-semibold text-stone-800">Reputation Score</h3>
        </div>
        <p className="text-2xl font-bold text-stone-800 mb-1">
          {stats.reputationScore}/100
        </p>
        <div className="flex items-center space-x-2">
          {stats.hasDefaulted ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-600 text-sm">Has defaults</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-emerald-600 text-sm">Good standing</p>
            </>
          )}
        </div>
      </div>

      {/* Groups Summary Card - Full width */}
      <div className="md:col-span-4">
        <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-800">Groups Overview</h3>
            </div>
            {totalStats && (
              <div className="text-right">
                <p className="text-sm text-stone-600">Platform Total</p>
                <p className="text-xl font-bold text-stone-800">
                  {totalStats[0]?.toString()} groups
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{stats.activeGroups}</p>
              <p className="text-stone-600 text-sm">Active Groups</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-2xl font-bold text-emerald-600">{stats.completedGroups}</p>
              <p className="text-stone-600 text-sm">Completed Groups</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-2xl font-bold text-amber-600">{getGroupsCreatedCount()}</p>
              <p className="text-stone-600 text-sm">Groups Created</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-2xl font-bold text-stone-800">
                {myGroups ? myGroups.length : 0}
              </p>
              <p className="text-stone-600 text-sm">Total Groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROSCAStats;