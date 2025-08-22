import React, { useState, useEffect } from 'react';
import { Crown, UserPlus, Users, TrendingUp, Calendar, DollarSign, Clock, CheckCircle, Star, Shield, AlertCircle, Loader } from 'lucide-react';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';
import tokens from '@/lib/Tokens/tokens';

interface GroupContributionsProps {
  availableGroups: any[];
  onRefreshData: () => void;
}

const JoinGroup: React.FC<GroupContributionsProps> = ({ availableGroups, onRefreshData }) => {
  // All state declarations at the top
  const [contributionAmount, setContributionAmount] = useState('');
  const [groupSize, setGroupSize] = useState(5);
  const [frequency, setFrequency] = useState('weekly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [agentContactInfo, setAgentContactInfo] = useState('');
  const [showAgentRegistration, setShowAgentRegistration] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedGroupRef, setExpandedGroupRef] = useState<HTMLDivElement | null>(null);

  // Contract state
  const [userInfo, setUserInfo] = useState(null);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [totalStats, setTotalStats] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [maxUses, setMaxUses] = useState(10);
  const [validityDays, setValidityDays] = useState(30);

  const { isConnected, SAVING_CONTRACT_INSTANCE, TEST_TOKEN_CONTRACT_INSTANCE, AFRISTABLE_CONTRACT_INSTANCE, address } = useContractInstances();

  const frequencyOptions = [
    {value: 'five minute', label: 'Five-minute', seconds: 300 },
    { value: 'daily', label: 'Daily', seconds: 86400 },
    { value: 'weekly', label: 'Weekly', seconds: 604800 },
    { value: 'biweekly', label: 'Bi-weekly', seconds: 1209600 },
    { value: 'monthly', label: 'Monthly', seconds: 2592000 },
  ];

  // Safe array access with default empty arrays
  const safeAvailableGroups = availableGroups || [];

  // Get supported tokens (excluding ETH which is id: 1)
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts
  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '0';
    const divisor = Math.pow(10, decimals);
    return (parseFloat(amountInWei) / divisor).toFixed(2);
  };

  // Convert token amount to wei
  const toWei = (amount: string, decimals = 18) => {
    const multiplier = Math.pow(10, decimals);
    return (parseFloat(amount) * multiplier).toString();
  };

  // Get time remaining
  const getTimeRemaining = (timestamp: any) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(timestamp) - now;
    
    if (remaining <= 0) return "Expired";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (isActive: boolean, isCompleted: boolean, canJoin?: boolean) => {
    if (isCompleted) return 'text-stone-500 bg-stone-100';
    if (isActive) return 'text-emerald-600 bg-emerald-50';
    if (canJoin) return 'text-blue-600 bg-blue-50';
    return 'text-stone-600 bg-stone-100';
  };

  const getGroupStatus = (group: any) => {
    if (group.isCompleted) return 'Completed';
    if (group.isActive) return 'Active';
    if (group.canJoin) return 'Recruiting';
    return 'Full';
  };

  // Handle contribution
  const handleContribute = async (groupId: string, tokenAddress: string, amount: any) => {
    setIsProcessing(true);
    console.log(groupId, tokenAddress, amount);
    try {
      const AFRI_Contract = await AFRISTABLE_CONTRACT_INSTANCE();
      const TOKEN_Contract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
      
      if (tokenAddress == '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768') {
        const tx = await AFRI_Contract.approve(CONTRACT_ADDRESSES.savingAddress, amount);
        await tx.wait();      
      } else {
        const tx = await TOKEN_Contract.approve(CONTRACT_ADDRESSES.savingAddress, amount);
        await tx.wait();   
      }

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.contribute(groupId);
      await tx.wait();
      
      setSuccessMessage('Contribution made successfully!');
      onRefreshData(); // Refresh data
    } catch (error) {
      console.error('Contribution error:', error);
      setErrorMessage('Failed to make contribution');
    }
    setIsProcessing(false);
  };

  const handleClaimPayout = async (groupId: string) => {
    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.claimPayout(groupId);
      await tx.wait();
      
      setSuccessMessage('Payout claimed successfully!');
      onRefreshData(); // Refresh data
    } catch (error) {
      console.error('Claim payout error:', error);
      setErrorMessage('Failed to claim payout');
    }
    setIsProcessing(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      let tx;
      
      if (inviteCode.trim()) {
        tx = await Saving_Contract.joinGroupWithCode(groupId, inviteCode);
      } else {
        // If no invite code, try direct join (if allowed)
        setErrorMessage('Invite code required to join group');
        setIsProcessing(false);
        return;
      }
      
      await tx.wait();
      setSuccessMessage('Successfully joined the group!');
      setInviteCode('');
      onRefreshData(); // Refresh data
    } catch (error) {
      console.error('Join group error:', error);
      setErrorMessage('Failed to join group');
    }
    setIsProcessing(false);
  };

  const handleVerifyInviteCode = async () => {
    if (!inviteCode.trim()) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const codeInfo = await Saving_Contract.getInviteCodeInfo(inviteCode.trim());
      
      // codeInfo returns: [agent, agentName, groupId, groupName, isActive, maxUses, currentUses, expiryTime]
      const [agent, agentName, groupId, groupName, isActive, maxUses, currentUses, expiryTime] = codeInfo;
      
      if (!isActive) {
        setErrorMessage('This invite code is no longer active');
        setIsProcessing(false);
        return;
      }
      
      // Check if code has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (expiryTime > 0 && currentTime > expiryTime) {
        setErrorMessage('This invite code has expired');
        setIsProcessing(false);
        return;
      }
      
      // Check if max uses reached
      if (maxUses > 0 && currentUses >= maxUses) {
        setErrorMessage('This invite code has reached its maximum usage limit');
        setIsProcessing(false);
        return;
      }
      
      // After successful verification, automatically join the group
      try {
        const tx = await Saving_Contract.joinGroupWithCode(groupId, inviteCode.trim());
        await tx.wait();
        
        setSuccessMessage(`Successfully joined group "${groupName}" created by ${agentName}!`);
        setInviteCode(''); // Clear invite code after successful join
        onRefreshData(); // Refresh data
      } catch (joinError) {
        console.error('Join group error:', joinError);
        setErrorMessage('Invite code is valid but failed to join group. Please try again.');
      }
      
    } catch (error) {
      console.error('Verify invite code error:', error);
      setErrorMessage('Invalid invite code or verification failed');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-600 hover:text-green-800">
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Main Content - Join Groups */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-6">Join a Group</h3>
          
          {/* Invite Code Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-stone-800 mb-4">Have an Invite Code?</h4>
            <div className="flex space-x-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter invite code (e.g., AJO1234567890123)"
              />
              <button
                onClick={handleVerifyInviteCode}
                disabled={!inviteCode.trim() || isProcessing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Joining...' : 'Join with Code'}
              </button>
            </div>
          </div>

          {/* Available Groups */}
          {safeAvailableGroups.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-stone-800 mb-2">No Available Groups</h4>
              <p className="text-stone-600 mb-4">All groups are currently full or invite-only</p>
              <p className="text-stone-500 text-sm">Ask friends for invite codes or create your own group</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-stone-800">Available Groups</h4>
              {safeAvailableGroups.map((group) => (
                <div
                  key={group.groupId}
                  ref={group.groupId === expandedGroup ? setExpandedGroupRef : null}
                  className={`bg-stone-50 rounded-xl p-6 overflow-hidden transition-all duration-300 ${
                    expandedGroup === group.groupId ? 'ring-2 ring-terracotta' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="font-semibold text-stone-800 text-lg">{group.name}</h5>
                      <p className="text-stone-600 text-sm mb-2">Created by {group.creatorName || 'Unknown'}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.isActive, group.isCompleted, group.canJoin)}`}>
                          {getGroupStatus(group)}
                        </span>
                        <span className="text-stone-600 text-sm">
                          {group.currentMembers}/{group.maxMembers} members
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinGroup(group.groupId)}
                      disabled={!group.canJoin || isProcessing || !inviteCode.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Joining...' : 'Join Group'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-stone-500" />
                        <span className="text-stone-600 text-sm">Contribution Required</span>
                      </div>
                      <p className="font-semibold text-stone-800">
                        {formatTokenAmount(group.contributionAmount)} {getSupportedTokens().find(t => t.address === group.token)?.symbol}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-stone-500" />
                        <span className="text-stone-600 text-sm">Potential Payout</span>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {formatTokenAmount(group.contributionAmount * group.maxMembers)} {getSupportedTokens().find(t => t.address === group.token)?.symbol}
                      </p>
                    </div>
                  </div>

                  {group.nextContributionDeadline && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-stone-800">
                          Next contribution deadline: {getTimeRemaining(group.nextContributionDeadline)}
                        </span>
                      </div>
                    </div>
                  )}

                  {!inviteCode.trim() && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 You need an invite code to join this group. Ask the group creator for an invitation.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;