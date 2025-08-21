import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, DollarSign, Calendar, Wallet, Send, CheckCircle, AlertCircle, Clock, Star, Crown, Shield, UserPlus, Copy } from 'lucide-react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESSES } from '@/provider/ContractInstanceProvider';
import tokens from '@/lib/Tokens/tokens';

interface GroupContributionsProps {
  myGroups: any[];
  availableGroups: any[];
  onRefreshData: () => void;
}

const JoinGroup: React.FC<GroupContributionsProps> = ({ myGroups, availableGroups, onRefreshData }) => {
  const { SAVING_CONTRACT_INSTANCE, TEST_TOKEN_CONTRACT_INSTANCE, AFRISTABLE_CONTRACT_INSTANCE } = useContractInstances();
  const { address } = useAccount();
  const { toast } = useToast();
  
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [userContributionStatus, setUserContributionStatus] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState('contribute');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Safe array access with default empty arrays
  const safeMyGroups = myGroups || [];
  const safeAvailableGroups = availableGroups || [];

  // Get supported tokens (excluding ETH which is id: 1)
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts - matching AjoEsusuInterface
  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '0';
    const divisor = Math.pow(10, decimals);
    return (parseFloat(amountInWei) / divisor).toFixed(2);
  };

  // Convert token amount to wei - matching AjoEsusuInterface
  const toWei = (amount: string, decimals = 18) => {
    const multiplier = Math.pow(10, decimals);
    return (parseFloat(amount) * multiplier).toString();
  };

  // Get time remaining - matching AjoEsusuInterface
  const getTimeRemaining = (timestamp: any) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(timestamp) - now;
    
    if (remaining <= 0) return "Expired";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Status color logic - matching AjoEsusuInterface
  const getStatusColor = (isActive: boolean, isCompleted: boolean, canJoin?: boolean) => {
    if (isCompleted) return 'text-stone-500 bg-stone-100';
    if (isActive) return 'text-emerald-600 bg-emerald-50';
    if (canJoin) return 'text-blue-600 bg-blue-50';
    return 'text-stone-600 bg-stone-100';
  };

  const getGroupStatus = (group: any) => {
    if (group.isCompleted || group[11]) return 'Completed';
    if (group.isActive || group[10]) return 'Active';
    if (group.canJoin || group[12]) return 'Recruiting';
    return 'Full';
  };

  // Fetch group details - matching AjoEsusuInterface pattern
  useEffect(() => {
    if (selectedGroup && SAVING_CONTRACT_INSTANCE) {
      fetchGroupDetails();
    }
  }, [selectedGroup, SAVING_CONTRACT_INSTANCE]);

  const fetchGroupDetails = async () => {
    if (!selectedGroup || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const summary = await Saving_Contract.getGroupSummary(selectedGroup);
      const contributionStatus = await Saving_Contract.getUserContributionStatus(selectedGroup, address);
      
      setUserContributionStatus(contributionStatus);
      setGroupDetails({
        groupId: selectedGroup,
        name: summary[1],
        creator: summary[2],
        creatorName: summary[3],
        tokenAddress: summary[4],
        contributionAmount: summary[5],
        currentMembers: summary[6],
        maxMembers: summary[7],
        currentRound: summary[8],
        totalRounds: summary[9],
        isActive: summary[10],
        isCompleted: summary[11],
        canJoin: summary[12],
        nextContributionDeadline: summary[13],
        currentRecipient: summary[14],
        currentRecipientName: summary[15]
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch group details",
        variant: "destructive"
      });
    }
  };

  // Handle contribution - UPDATED to match AjoEsusuInterface exact logic
  const handleContribute = async (groupId: string, tokenAddress: string, amount: any) => {
    setIsProcessing(true);
    console.log(groupId, tokenAddress, amount);
    try {
      const AFRI_Contract = await AFRISTABLE_CONTRACT_INSTANCE();
      const TOKEN_Contract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
      
      // UPDATED: Use exact same condition as AjoEsusuInterface
      if (tokenAddress === '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768') {
        const tx = await AFRI_Contract.approve(CONTRACT_ADDRESSES.savingAddress, amount);
        await tx.wait();      
      } else {
        const tx = await TOKEN_Contract.approve(CONTRACT_ADDRESSES.savingAddress, amount);
        await tx.wait();   
      }

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.contribute(groupId);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Contribution made successfully!",
      });
      
      fetchGroupDetails();
      onRefreshData();
    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: "Error",
        description: "Failed to make contribution",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  // Handle claim payout - matching AjoEsusuInterface logic
  const handleClaimPayout = async (groupId: string) => {
    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.claimPayout(groupId);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Payout claimed successfully!",
      });
      
      fetchGroupDetails();
      onRefreshData();
    } catch (error) {
      console.error('Claim payout error:', error);
      toast({
        title: "Error",
        description: "Failed to claim payout",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  // Handle join group - UPDATED to match AjoEsusuInterface exact logic
  const handleJoinGroup = async (groupId: string) => {
    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      let tx;
      
      if (inviteCode.trim()) {
        tx = await Saving_Contract.joinGroupWithCode(groupId, inviteCode);
      } else {
        // UPDATED: Match exact error handling from AjoEsusuInterface
        toast({
          title: "Error",
          description: "Invite code required to join group",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      await tx.wait();
      toast({
        title: "Success",
        description: "Successfully joined the group!",
      });
      
      setInviteCode('');
      onRefreshData();
    } catch (error) {
      console.error('Join group error:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  // Handle verify invite code - UPDATED to match AjoEsusuInterface exact logic and error handling
  const handleVerifyInviteCode = async () => {
    if (!inviteCode.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const codeInfo = await Saving_Contract.getInviteCodeInfo(inviteCode.trim());
      
      const [agent, agentName, groupId, groupName, isActive, maxUses, currentUses, expiryTime] = codeInfo;
      
      if (!isActive) {
        toast({
          title: "Invalid Code",
          description: "This invite code is no longer active",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Check if code has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (expiryTime > 0 && currentTime > expiryTime) {
        toast({
          title: "Expired Code",
          description: "This invite code has expired",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Check if max uses reached
      if (maxUses > 0 && currentUses >= maxUses) {
        toast({
          title: "Usage Limit Reached",
          description: "This invite code has reached its maximum usage limit",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // UPDATED: Match exact success message format from AjoEsusuInterface
      toast({
        title: "Valid Code!",
        description: `Valid invite code! Group: ${groupName} (ID: ${groupId.toString()}) by ${agentName}`,
      });
      
    } catch (error) {
      console.error('Verify invite code error:', error);
      toast({
        title: "Error",
        description: "Invalid invite code or verification failed",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  // Use safe arrays for length checks
  if (safeMyGroups.length === 0 && safeAvailableGroups.length === 0) {
    return (
      <Card className="rosca-card">
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Groups Available</h3>
          <p className="text-muted-foreground mb-4">
            You need to join or create an Rotational group before you can manage contributions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - matching AjoEsusuInterface style */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => setActiveTab('contribute')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'contribute'
                ? 'text-terracotta border-b-2 border-terracotta'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            My Contributions ({safeMyGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'join'
                ? 'text-terracotta border-b-2 border-terracotta'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            Join Groups ({safeAvailableGroups.length})
          </button>
        </div>

        {/* My Contributions Tab */}
        {activeTab === 'contribute' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6">Manage Your Group Contributions</h3>
            
            {safeMyGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-stone-800 mb-2">No Groups Yet</h4>
                <p className="text-stone-600 mb-4">Join a group to start making contributions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeMyGroups.map((group, index) => (
                  <div
                    key={group[0] || index}
                    className="bg-stone-50 rounded-xl p-6 border-l-4 border-terracotta"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-semibold text-stone-800 text-lg">{group[1]}</h5>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group[10], group[11], group[12])}`}>
                            {getGroupStatus(group)}
                          </span>
                          <span className="text-stone-600 text-sm">
                            Round {group[8]?.toString()}/{group[9]?.toString()}
                          </span>
                          {group[2] === address ? (
                            <span className="text-amber-600 text-sm font-medium flex items-center">
                              <Crown className="w-4 h-4 mr-1" />
                              Creator
                            </span>
                          ) : (
                            <span className="text-blue-600 text-sm font-medium flex items-center">
                              <UserPlus className="w-4 h-4 mr-1" />
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {group[14] === address && group[10] && (
                          <button
                            onClick={() => handleClaimPayout(group[0])}
                            disabled={isProcessing}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? 'Processing...' : 'Claim Payout'}
                          </button>
                        )}

                        {group[10] && !group.contributionStatus?.[0] && (
                          <button
                            onClick={() => handleContribute(group[0], group[4], group[5])}
                            disabled={isProcessing}
                            className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? 'Processing...' : 'Contribute'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-4 h-4 text-stone-500" />
                          <span className="text-stone-600 text-sm">Contribution</span>
                        </div>
                        <p className="font-semibold text-stone-800">
                          {formatTokenAmount(group[5])} {getSupportedTokens().find(t => t.address === group[4])?.symbol}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-stone-500" />
                          <span className="text-stone-600 text-sm">Members</span>
                        </div>
                        <p className="font-semibold text-stone-800">
                          {group[6]?.toString()}/{group[7]?.toString()}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-stone-500" />
                          <span className="text-stone-600 text-sm">
                            {group[10] ? 'Next Deadline' : 'Status'}
                          </span>
                        </div>
                        <p className="font-semibold text-stone-800">
                          {group[10] ? getTimeRemaining(group[13]) : 'Not Started'}
                        </p>
                      </div>
                    </div>

                    {group[14] && group[14] !== "0x0000000000000000000000000000000000000000" && (
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-stone-800">
                            Current Recipient: {group[15] || 'Unknown'}
                            {group[14] === address && " (You)"}
                          </span>
                        </div>
                      </div>
                    )}

                    {group.contributionStatus && (
                      <div className="flex items-center space-x-2 mt-3">
                        {group.contributionStatus[0] ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Contributed for this round</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span className="text-amber-600 font-medium">
                              {group.contributionStatus[2] ? 'Late - Please contribute' : 'Contribution pending'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Join Groups Tab - matching AjoEsusuInterface logic exactly */}
        {activeTab === 'join' && (
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
                  {isProcessing ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </div>

            {/* Available Groups - matching AjoEsusuInterface exactly */}
            {safeAvailableGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-stone-800 mb-2">No Available Groups</h4>
                <p className="text-stone-600 mb-4">All groups are currently full or invite-only</p>
                <p className="text-stone-500 text-sm">Ask friends for invite codes or create your own group</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold text-stone-800">Available Groups</h4>
                {safeAvailableGroups.map((group, index) => (
                  <div
                    key={group.groupId || index}
                    ref={null}
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
                          <Star className="w-4 h-4 text-stone-500" />
                          <span className="text-stone-600 text-sm">Potential Payout</span>
                        </div>
                        <p className="font-semibold text-emerald-600">
                          {formatTokenAmount(group.contributionAmount * group.maxMembers)} {getSupportedTokens().find(t => t.address === group.token)?.symbol}
                        </p>
                      </div>
                    </div>

                    {/* Next contribution deadline - matching AjoEsusuInterface */}
                    {group.nextContributionDeadline && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-4">
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
        )}
      </div>
    </div>
  );
};

export default JoinGroup;