import React, { useEffect, useState } from 'react';
import { DollarSign, Users, Star, Calendar, TrendingUp, Wallet, Shield } from 'lucide-react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { useAccount } from 'wagmi';

interface ROSCAStatsProps {
  userInfo: any;
  isLoading?: boolean;
}

const ROSCAStats: React.FC<ROSCAStatsProps> = ({ userInfo, isLoading = false }) => {
  const { SAVING_CONTRACT_INSTANCE } = useContractInstances();
  const { address } = useAccount();
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Safe JSON stringify that handles BigInt values
  const safeStringify = (obj: any, space?: number) => {
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      }, space);
    } catch (error) {
      console.error('Error stringifying object:', error);
      return 'Error serializing data';
    }
  };

  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '₦0';
    
    try {
      // Handle BigInt values
      const amount = typeof amountInWei === 'bigint' 
        ? amountInWei.toString() 
        : amountInWei.toString();
      
      const divisor = Math.pow(10, decimals);
      const parsedAmount = parseFloat(amount) / divisor;
      
      if (isNaN(parsedAmount)) return '₦0';
      
      return `₦${parsedAmount.toLocaleString()}`;
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '₦0';
    }
  };

  // Calculate time remaining for next payout
  const getTimeRemaining = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle BigInt values
      const timestampValue = typeof timestamp === 'bigint' 
        ? timestamp.toString() 
        : timestamp.toString();
      
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(timestampValue) - now;
      
      if (remaining <= 0) return "Expired";
      
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      
      if (days > 0) return `${days} Days`;
      if (hours > 0) return `${hours} Hours`;
      return `${minutes} Minutes`;
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 'N/A';
    }
  };

  // Validate user data structure from smart contract
  const validateUserData = (userInfo: any[]): boolean => {
    if (!userInfo || !Array.isArray(userInfo) || userInfo.length < 10) {
      console.error('Invalid user data structure:', userInfo);
      return false;
    }
    
    // Check for reasonable values
    const reputation = parseInt(userInfo[7]);
    if (reputation < 0 || reputation > 100) {
      console.warn('Invalid reputation score:', reputation);
    }
    
    const activeGroups = parseInt(userInfo[3]);
    const completedGroups = parseInt(userInfo[4]);
    if (activeGroups < 0 || completedGroups < 0) {
      console.warn('Invalid group counts:', { activeGroups, completedGroups });
    }
    
    return true;
  };

  // Get user stats from smart contract data with validation
  const getUserStats = () => {
    if (!userInfo) {
      return {
        totalContributed: 0,
        payoutsReceived: 0,
        nextPayout: 'Not Registered',
        reputationScore: 0,
        activeGroups: 0,
        completedGroups: 0,
        userName: '',
        isRegistered: false,
        hasDefaulted: false,
        joinDate: 'N/A'
      };
    }

    try {
      // Validate data structure first
      if (!validateUserData(userInfo)) {
        throw new Error('Invalid user data structure');
      }

      // The smart contract returns an array with this structure:
      // [name, totalContributions, totalReceived, activeGroups, completedGroups, hasRegistered, hasDefaulted, reputationScore, joinDate, lastActivity]
      const stats = {
        totalContributed: userInfo[1] || 0, // totalContributions
        payoutsReceived: userInfo[2] || 0,   // totalReceived
        nextPayout: userInfo[9] ? getTimeRemaining(userInfo[9]) : 'N/A', // lastActivity
        reputationScore: parseInt(userInfo[7]) || 0,   // reputationScore
        activeGroups: parseInt(userInfo[3]) || 0,      // activeGroups
        completedGroups: parseInt(userInfo[4]) || 0,   // completedGroups
        userName: userInfo[0] || 'Unknown',            // name
        isRegistered: Boolean(userInfo[5]),            // hasRegistered
        hasDefaulted: Boolean(userInfo[6]),            // hasDefaulted
        joinDate: userInfo[8] ? new Date(parseInt(userInfo[8]) * 1000).toLocaleDateString() : 'N/A' // joinDate
      };

      console.log('Processed user stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error processing user stats:', error);
      return {
        totalContributed: 0,
        payoutsReceived: 0,
        nextPayout: 'Error',
        reputationScore: 0,
        activeGroups: 0,
        completedGroups: 0,
        userName: '',
        isRegistered: false,
        hasDefaulted: false,
        joinDate: 'N/A'
      };
    }
  };

  // Fetch user groups from blockchain
  const fetchUserGroups = async () => {
    if (!address || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      setGroupsLoading(true);
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      
      // Get user's group IDs
      const userGroupIds = await Saving_Contract.getUserGroups(address);
      console.log('User group IDs:', userGroupIds);
      
      // Fetch detailed information for each group
      const groupsData = await Promise.all(
        userGroupIds.map(async (groupId: any) => {
          try {
            const groupSummary = await Saving_Contract.getGroupSummary(groupId);
            const groupDetails = await Saving_Contract.getGroupDetails(groupId);
            
            return {
              groupId: groupId.toString(),
              name: groupSummary.name || groupDetails[0] || `Group ${groupId}`,
              description: groupDetails[1] || '',
              creator: groupSummary.creator || groupDetails[2] || '',
              creatorName: groupSummary.creatorName || groupDetails[3] || '',
              contributionAmount: groupSummary.contributionAmount || groupDetails[6] || 0,
              maxMembers: groupSummary.maxMembers || groupDetails[9] || 0,
              currentMembers: groupSummary.currentMembers || groupDetails[8] || 0,
              currentRound: groupSummary.currentRound || groupDetails[10] || 0,
              totalRounds: groupSummary.totalRounds || groupDetails[11] || 0,
              isActive: groupSummary.isActive || groupDetails[12] || false,
              isCompleted: groupSummary.isCompleted || groupDetails[13] || false,
              nextContributionDeadline: groupSummary.nextContributionDeadline || groupDetails[15] || 0,
              startTime: groupDetails[14] || 0
            };
          } catch (error) {
            console.error(`Error fetching group ${groupId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values and set groups
      const validGroups = groupsData.filter(group => group !== null);
      setUserGroups(validGroups);
      console.log('Fetched user groups:', validGroups);
      
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch groups when component mounts or userInfo changes
  useEffect(() => {
    if (userInfo && address) {
      fetchUserGroups();
    }
  }, [userInfo, address]);

  const stats = getUserStats();

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading User Data</h3>
            <p className="text-gray-600">
              Fetching your ROSCA statistics from the blockchain...
            </p>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Not Registered</h3>
            <p className="text-blue-600 mb-4">
              You need to register on the blockchain to start using ROSCA features.
            </p>
            <p className="text-sm text-blue-500">
              Check the console for debugging information about your connection status.
            </p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-6">


       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         {/* Total Contributed Card */}
         <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-stone-100 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center">
               <Wallet className="w-5 h-5 text-green-600" />
             </div>
           </div>
           <h3 className="font-semibold text-stone-800 mb-2 text-sm">Total Contributed</h3>
           <p className="text-2xl font-bold text-stone-800 mb-1">
             {formatTokenAmount(stats.totalContributed)}
           </p>
           <p className="text-green-600 text-xs font-medium">
             {stats.activeGroups} active groups
           </p>
         </div>

         {/* Payouts Received Card */}
         <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-stone-100 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center">
               <TrendingUp className="w-5 h-5 text-blue-600" />
             </div>
           </div>
           <h3 className="font-semibold text-stone-800 mb-2 text-sm">Payouts Received</h3>
           <p className="text-2xl font-bold text-stone-800 mb-1">
             {formatTokenAmount(stats.payoutsReceived)}
           </p>
           <p className="text-blue-600 text-xs font-medium">
             {stats.completedGroups} completed groups
           </p>
         </div>

         {/* Next Payout Card */}
         <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-stone-100 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl flex items-center justify-center">
               <Calendar className="w-5 h-5 text-orange-600" />
             </div>
           </div>
           <h3 className="font-semibold text-stone-800 mb-2 text-sm">Next Payout</h3>
           <p className="text-2xl font-bold text-stone-800 mb-1">
             {stats.nextPayout}
           </p>
           <p className="text-stone-500 text-xs">
             Based on activity
           </p>
         </div>

         {/* Reputation Score Card */}
         <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-stone-100 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg">
           <div className="flex items-center mb-3">
             <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl flex items-center justify-center">
               <Star className="w-5 h-5 text-yellow-600" />
             </div>
           </div>
           <h3 className="font-semibold text-stone-800 mb-2 text-sm">Reputation Score</h3>
           <p className="text-2xl font-bold text-stone-800 mb-1">
             {stats.reputationScore}/100
           </p>
           <p className="text-yellow-600 text-xs font-medium">
             Trust Score
           </p>
                  </div>
       </div>


     </div>
   );
 };

export default ROSCAStats;
