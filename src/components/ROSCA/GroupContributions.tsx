import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, DollarSign, Calendar, Wallet, Send, CheckCircle, AlertCircle, Clock, Star, Crown, Shield } from 'lucide-react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import tokens from '@/lib/Tokens/tokens';
import { CONTRACT_ADDRESSES } from '@/provider/ContractInstanceProvider';

interface GroupContributionsProps {
  myGroups: any[];
}

const GroupContributions: React.FC<GroupContributionsProps> = ({ myGroups }) => {
  const { SAVING_CONTRACT_INSTANCE, TEST_TOKEN_CONTRACT_INSTANCE, AFRISTABLE_CONTRACT_INSTANCE } = useContractInstances();
  const { address } = useAccount();
  const { toast } = useToast();
  
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [userContributionStatus, setUserContributionStatus] = useState<any>(null);

  // Get supported tokens (excluding ETH which is id: 1) - from AjoEsusuInterface
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts from AjoEsusuInterface
  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '0';
    
    try {
      const amount = typeof amountInWei === 'bigint' 
        ? amountInWei.toString() 
        : amountInWei.toString();
      
      const divisor = Math.pow(10, decimals);
      const parsedAmount = parseFloat(amount) / divisor;
      
      if (isNaN(parsedAmount)) return '0';
      
      return parsedAmount.toFixed(2);
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '0';
    }
  };

  // Enhanced time calculation from AjoEsusuInterface
  const getTimeRemaining = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      const timestampValue = typeof timestamp === 'bigint' 
        ? timestamp.toString() 
        : timestamp.toString();
      
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(timestampValue) - now;
      
      if (remaining <= 0) return "Expired";
      
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 'N/A';
    }
  };

  // Enhanced group status logic from AjoEsusuInterface
  const getStatusColor = (isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return 'text-stone-500 bg-stone-100';
    if (isActive) return 'text-emerald-600 bg-emerald-50';
    return 'text-amber-600 bg-amber-50';
  };

  const getGroupStatus = (group: any) => {
    if (group.isCompleted || group[11]) return 'Completed';
    if (group.isActive || group[10]) return 'Active';
    return 'Recruiting';
  };

  // Enhanced group details fetching with better error handling
  useEffect(() => {
    if (selectedGroup && SAVING_CONTRACT_INSTANCE) {
      fetchGroupDetails();
    }
  }, [selectedGroup, SAVING_CONTRACT_INSTANCE]);

  const fetchGroupDetails = async () => {
    if (!selectedGroup || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const groupSummary = await Saving_Contract.getGroupSummary(selectedGroup);
      const groupDetails = await Saving_Contract.getGroupDetails(selectedGroup);
      
      // Get user's contribution status for this group
      const contributionStatus = await Saving_Contract.getUserContributionStatus(selectedGroup, address);
      setUserContributionStatus(contributionStatus);
      
      // Find the selected group from myGroups to get the correct data structure
      const selectedGroupData = myGroups.find(group => 
        (group.id || group.groupId || group[0]) === selectedGroup
      );
      
      // Enhanced name cleaning logic
      let cleanGroupName = `Group ${selectedGroup}`;
      if (selectedGroupData?.name && typeof selectedGroupData.name === 'string') {
        if (selectedGroupData.name.includes('/')) {
          const parts = selectedGroupData.name.split('/');
          cleanGroupName = parts[0].trim() || `Group ${selectedGroup}`;
        } else {
          cleanGroupName = selectedGroupData.name.trim();
        }
      } else if (groupDetails[0] && typeof groupDetails[0] === 'string') {
        cleanGroupName = groupDetails[0];
      }
      
      // Enhanced data extraction with array index support
      const extractCleanValue = (value: any) => {
        if (typeof value === 'string' && value.includes('0x')) return 0;
        if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
        if (typeof value === 'number') return value;
        if (typeof value === 'bigint') return Number(value);
        return 0;
      };

      setGroupDetails({
        groupId: selectedGroup,
        name: cleanGroupName,
        description: selectedGroupData?.description || groupDetails[1] || '',
        creator: selectedGroupData?.creator || groupSummary[2] || '',
        creatorName: selectedGroupData?.creatorName || groupSummary[3] || 'Unknown',
        tokenAddress: selectedGroupData?.tokenAddress || groupSummary[4] || '',
        contributionAmount: selectedGroupData?.contributionAmount || groupSummary[5] || 0,
        currentMembers: extractCleanValue(selectedGroupData?.memberCount || groupSummary[6]),
        maxMembers: extractCleanValue(selectedGroupData?.groupSize || groupSummary[7]),
        currentRound: extractCleanValue(selectedGroupData?.currentCycle || groupSummary[8]),
        totalRounds: extractCleanValue(selectedGroupData?.totalCycles || groupSummary[9]),
        isActive: selectedGroupData?.status === 'active' || groupSummary[10] || false,
        isCompleted: selectedGroupData?.status === 'completed' || groupSummary[11] || false,
        canJoin: groupSummary[12] || false,
        nextContributionDeadline: groupSummary[13] || 0,
        currentRecipient: groupSummary[14] || '0x0000000000000000000000000000000000000000',
        currentRecipientName: groupSummary[15] || 'Unknown',
        startTime: groupDetails[14] || 0
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

  // Enhanced contribution handling with proper token approval
  const handleMakeContribution = async () => {
    if (!selectedGroup || !groupDetails || !SAVING_CONTRACT_INSTANCE) {
      toast({
        title: "Error",
        description: "Please select a group first",
        variant: "destructive"
      });
      return;
    }

    // Check if user has already contributed
    if (userContributionStatus && userContributionStatus[0]) {
      toast({
        title: "Already Contributed",
        description: "You have already made your contribution for this round",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tokenAddress = groupDetails.tokenAddress;
      const contributionAmount = groupDetails.contributionAmount;

      // Handle token approval based on token type
      if (tokenAddress === '0xc5737615ed39b6B089BEDdE11679e5e1f6B9E768') {
        // AfriStable token
        const AFRI_Contract = await AFRISTABLE_CONTRACT_INSTANCE();
        const approvalTx = await AFRI_Contract.approve(CONTRACT_ADDRESSES.savingAddress, contributionAmount);
        await approvalTx.wait();
      } else {
        // Other ERC20 tokens
        const TOKEN_Contract = await TEST_TOKEN_CONTRACT_INSTANCE(tokenAddress);
        const approvalTx = await TOKEN_Contract.approve(CONTRACT_ADDRESSES.savingAddress, contributionAmount);
        await approvalTx.wait();
      }

      // Make the contribution
      const contributionTx = await Saving_Contract.contribute(selectedGroup);
      await contributionTx.wait();
      
      toast({
        title: "Success",
        description: `Contribution of ${formatTokenAmount(contributionAmount)} ${getSupportedTokens().find(t => t.address === tokenAddress)?.symbol || 'tokens'} made successfully!`,
      });
      
      // Refresh data
      fetchGroupDetails();
      
    } catch (error) {
      console.error('Error making contribution:', error);
      toast({
        title: "Error",
        description: "Failed to make contribution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced payout claiming
  const handleClaimPayout = async () => {
    if (!selectedGroup || !groupDetails || !SAVING_CONTRACT_INSTANCE) return;

    if (groupDetails.currentRecipient !== address) {
      toast({
        title: "Not Your Turn",
        description: "You are not the current recipient for this round",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const claimTx = await Saving_Contract.claimPayout(selectedGroup);
      await claimTx.wait();
      
      toast({
        title: "Success",
        description: "Payout claimed successfully!",
      });
      
      fetchGroupDetails();
      
    } catch (error) {
      console.error('Error claiming payout:', error);
      toast({
        title: "Error",
        description: "Failed to claim payout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (myGroups.length === 0) {
    return (
      <Card className="rosca-card">
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Groups Available</h3>
          <p className="text-muted-foreground mb-4">
            You need to join or create a ROSCA group before you can make contributions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group Selection */}
      <Card className="rosca-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Group
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-select">Choose a ROSCA Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group to manage contributions" />
              </SelectTrigger>
              <SelectContent>
                {myGroups.map((group, index) => {
                  // Enhanced name parsing with support for different data structures
                  let displayName = `Group ${index + 1}`;
                  const groupName = group.name || group[1];
                  const groupId = group.id || group.groupId || group[0];
                  
                  if (groupName && typeof groupName === 'string') {
                    if (groupName.includes('/')) {
                      const parts = groupName.split('/');
                      displayName = parts[0].trim() || `Group ${index + 1}`;
                    } else {
                      displayName = groupName.trim();
                    }
                  }
                  
                  return (
                    <SelectItem key={index} value={groupId?.toString() || index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-900 font-medium">{displayName}</span>
                        {group[2] === address && (
                          <Crown className="h-4 w-4 text-amber-500 ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Group Details */}
      {selectedGroup && groupDetails && (
        <>
          <Card className="rosca-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {groupDetails.name}
                </div>
                <Badge className={getStatusColor(groupDetails.isActive, groupDetails.isCompleted)}>
                  {getGroupStatus(groupDetails)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">
                    {groupDetails.currentMembers}/{groupDetails.maxMembers}
                  </p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">
                    {groupDetails.currentRound}/{groupDetails.totalRounds}
                  </p>
                  <p className="text-sm text-gray-600">Current Round</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Wallet className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTokenAmount(groupDetails.contributionAmount)} {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Tokens'}
                  </p>
                  <p className="text-sm text-gray-600">Per Round</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Star className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTokenAmount(Number(groupDetails.contributionAmount) * groupDetails.maxMembers)} {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Tokens'}
                  </p>
                  <p className="text-sm text-gray-600">Total Payout</p>
                </div>
              </div>

              {/* Current Recipient Info */}
              {groupDetails.currentRecipient && groupDetails.currentRecipient !== "0x0000000000000000000000000000000000000000" && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-stone-800">
                      Current Recipient: {groupDetails.currentRecipientName}
                      {groupDetails.currentRecipient === address && " (You)"}
                    </span>
                  </div>
                </div>
              )}

              {/* Contribution Status */}
              {userContributionStatus && (
                <div className="flex items-center space-x-2">
                  {userContributionStatus[0] ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Contributed for this round</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-600 font-medium">
                        {userContributionStatus[2] ? 'Late - Please contribute immediately' : 'Contribution pending for this round'}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Deadline Info */}
              {groupDetails.isActive && groupDetails.nextContributionDeadline > 0 && (
                <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <p className="text-sm text-amber-800 font-medium">
                      Next contribution deadline: {getTimeRemaining(groupDetails.nextContributionDeadline)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contribution Card */}
            <Card className="rosca-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Make Contribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Required Amount:</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatTokenAmount(groupDetails.contributionAmount)} {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Tokens'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Token: {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Unknown'}
                  </p>
                </div>
                
                <Button 
                  onClick={handleMakeContribution}
                  disabled={!groupDetails.isActive || isProcessing || (userContributionStatus && userContributionStatus[0])}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : userContributionStatus && userContributionStatus[0] ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Contributed
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Contribute {formatTokenAmount(groupDetails.contributionAmount)} {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Tokens'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Payout Card */}
            <Card className="rosca-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Claim Payout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-800 font-medium mb-2">Available Payout:</p>
                  <p className="text-xl font-bold text-emerald-900">
                    {formatTokenAmount(Number(groupDetails.contributionAmount) * groupDetails.currentMembers)} {getSupportedTokens().find(t => t.address === groupDetails.tokenAddress)?.symbol || 'Tokens'}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {groupDetails.currentRecipient === address ? 'Your turn!' : 'Not your turn yet'}
                  </p>
                </div>
                
                <Button 
                  onClick={handleClaimPayout}
                  disabled={groupDetails.currentRecipient !== address || isProcessing || !groupDetails.isActive}
                  className="w-full"
                  size="lg"
                  variant={groupDetails.currentRecipient === address ? "default" : "secondary"}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : groupDetails.currentRecipient === address ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Claim Your Payout
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Wait for Your Turn
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupContributions;