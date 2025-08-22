import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, Wallet, TrendingUp, Download, Clock, CheckCircle } from 'lucide-react';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';
import tokens from '@/lib/Tokens/tokens';

interface PayoutsProps {
  myGroups: any[];
}

const Payouts: React.FC<PayoutsProps> = ({ myGroups }) => {
  const { SAVING_CONTRACT_INSTANCE, address } = useContractInstances();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [userContributionStatus, setUserContributionStatus] = useState<any>(null);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get supported tokens (excluding ETH which is id: 1) - same as AjoEsusuInterface
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts - same logic as AjoEsusuInterface
  const formatTokenAmount = (amountInWei, decimals = 18) => {
    if (!amountInWei) return '0';
    const divisor = Math.pow(10, decimals);
    return (parseFloat(amountInWei) / divisor).toFixed(2);
  };

  // Get time remaining - same logic as AjoEsusuInterface
  const getTimeRemaining = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(timestamp) - now;
    
    if (remaining <= 0) return "Expired";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Fetch group details when a group is selected
  useEffect(() => {
    if (selectedGroup && SAVING_CONTRACT_INSTANCE) {
      fetchGroupDetails();
      fetchUserContributionStatus();
      fetchPayoutHistory();
    }
  }, [selectedGroup, SAVING_CONTRACT_INSTANCE]);

  const fetchGroupDetails = async () => {
    if (!selectedGroup || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const groupSummary = await Saving_Contract.getGroupSummary(selectedGroup);
      
      // Find the selected group from myGroups to get consistent data
      const selectedGroupData = myGroups.find(group => 
        (group[0] || group.groupId) === selectedGroup
      );
      
       // Enhanced data extraction with array index support (same as GroupContributions)
    const extractCleanValue = (value) => {
      if (typeof value === 'string' && value.includes('0x')) return 0;
      if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
      if (typeof value === 'number') return value;
      if (typeof value === 'bigint') return Number(value);
      return 0;
    };

    setGroupDetails({
      groupId: selectedGroup,
      name: selectedGroupData?.[1] || `Group ${selectedGroup}`,
      description: selectedGroupData?.description || '',
      creator: selectedGroupData?.[2] || groupSummary[2] || '',
      token: selectedGroupData?.[4] || groupSummary[4] || '',
      contributionAmount: selectedGroupData?.[5] || groupSummary[5] || 0,
      currentMembers: extractCleanValue(selectedGroupData?.[6] || groupSummary[6]),
      maxMembers: extractCleanValue(selectedGroupData?.[7] || groupSummary[7]),
      currentRound: extractCleanValue(selectedGroupData?.[8] || groupSummary[8]),
      totalRounds: extractCleanValue(selectedGroupData?.[9] || groupSummary[9]),
      isActive: selectedGroupData?.[10] || groupSummary[10] || false,
      isCompleted: selectedGroupData?.[11] || groupSummary[11] || false,
      canJoin: groupSummary[12] || false,
      nextContributionDeadline: groupSummary[13] || 0,
      currentRecipient: groupSummary[14] || '',
      currentRecipientName: groupSummary[15] || ''
    });
    } catch (error) {
      console.error('Error fetching group details:', error);
      setErrorMessage('Failed to fetch group details');
    }
  };

  const fetchUserContributionStatus = async () => {
    if (!selectedGroup || !address || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const status = await Saving_Contract.getUserContributionStatus(selectedGroup, address);
      setUserContributionStatus(status);
    } catch (error) {
      console.error('Error fetching user contribution status:', error);
    }
  };

  const fetchPayoutHistory = async () => {
    if (!selectedGroup || !address || !SAVING_CONTRACT_INSTANCE) return;
    
    try {
      // For now, using placeholder data as the contract structure needs to be clarified
      // This should be replaced with actual contract calls when available
      setPayoutHistory([]);
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleCashout = async () => {
    if (!selectedGroup || !SAVING_CONTRACT_INSTANCE) {
      setErrorMessage('Please select a group first');
      return;
    }

    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      
      const tx = await Saving_Contract.claimPayout(selectedGroup);
      await tx.wait();
      
      setSuccessMessage('Payout claimed successfully! Your earnings have been sent to your wallet.');
      
      // Refresh data
      fetchGroupDetails();
      fetchUserContributionStatus();
      fetchPayoutHistory();
      
    } catch (error) {
      console.error('Error claiming payout:', error);
      setErrorMessage('Failed to claim payout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (myGroups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white rounded-2xl shadow-sm border border-stone-200">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 mb-2">No Groups Available</h3>
            <p className="text-stone-600 mb-4">
              You need to join or create a ROSCA group before you can access payouts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
          <TrendingUp className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Group Selection */}
      <Card className="bg-white rounded-2xl shadow-sm border border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-stone-800">
            <Users className="h-5 w-5" />
            Select Group for Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-select" className="text-stone-700">Choose a ROSCA Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="border-stone-300">
                <SelectValue placeholder="Select a group to view payouts and cashout" />
              </SelectTrigger>
              <SelectContent>
                {myGroups.map((group, index) => {
                  const groupName = group[1] || `Group ${index + 1}`;
                  const groupId = group[0] || index.toString();
                  
                  return (
                    <SelectItem key={index} value={groupId}>
                      <span className="text-stone-900 font-medium">{groupName}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Group Details and Payouts */}
      {selectedGroup && groupDetails && (
        <>
          {/* Group Information */}
          <Card className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <DollarSign className="h-5 w-5" />
                {groupDetails.name} - Payout Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <Users className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-stone-800">
                    {groupDetails.currentMembers}/{groupDetails.maxMembers}
                  </p>
                  <p className="text-sm text-stone-600">Members</p>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <Calendar className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-stone-800">
                    {groupDetails.currentRound}/{groupDetails.totalRounds}
                  </p>
                  <p className="text-sm text-stone-600">Current Round</p>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <Wallet className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-stone-800">
                    {formatTokenAmount(groupDetails.contributionAmount)} {getSupportedTokens().find(t => t.address === groupDetails.token)?.symbol}
                  </p>
                  <p className="text-sm text-stone-600">Per Round</p>
                </div>
              </div>

              {groupDetails.isActive && groupDetails.nextContributionDeadline && (
                <div className="text-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-sm text-stone-700 font-medium">
                    Next contribution deadline: {getTimeRemaining(groupDetails.nextContributionDeadline)}
                  </p>
                </div>
              )}

              {groupDetails.currentRecipient && groupDetails.currentRecipient !== "0x0000000000000000000000000000000000000000" && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-stone-800">
                      Current Recipient: {groupDetails.currentRecipientName || 'Unknown'}
                    </span>
                    {groupDetails.currentRecipient === address && (
                      <Badge className="bg-emerald-100 text-emerald-800">Your Turn!</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available for Cashout */}
          <Card className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <TrendingUp className="h-5 w-5" />
                Available for Cashout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-green-800">
                  {groupDetails.currentRecipient === address && groupDetails.isActive ? 
                    `${formatTokenAmount(groupDetails.contributionAmount * groupDetails.currentMembers)} ${getSupportedTokens().find(t => t.address === groupDetails.token)?.symbol}` : 
                    '0'
                  }
                </p>
                <p className="text-sm text-green-600">Available for Cashout</p>
              </div>
              
              <Button 
                onClick={handleCashout}
                disabled={groupDetails.currentRecipient !== address || !groupDetails.isActive || isProcessing}
                className="w-full bg-gradient-to-r from-terracotta to-sage hover:shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Claim Payout
                  </>
                )}
              </Button>

              {groupDetails.currentRecipient !== address && (
                <p className="text-center text-stone-500 text-sm">
                  Payout available when it's your turn to receive
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <Clock className="h-5 w-5" />
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payoutHistory.length > 0 ? (
                <div className="space-y-3">
                  {payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          payout.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm text-stone-800">Round {payout.round}</p>
                          <p className="text-xs text-stone-500">{payout.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-stone-800">{payout.amount}</p>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">No payout history available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Payouts;