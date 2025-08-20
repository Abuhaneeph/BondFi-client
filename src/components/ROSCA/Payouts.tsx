import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, Wallet, TrendingUp, Download, Clock, CheckCircle } from 'lucide-react';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface PayoutsProps {
  myGroups: any[];
}

const Payouts: React.FC<PayoutsProps> = ({ myGroups }) => {
  const { SAVING_CONTRACT_INSTANCE } = useContractInstances();
  const { address } = useAccount();
  const { toast } = useToast();
  
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [userContributionStatus, setUserContributionStatus] = useState<any>(null);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);

  // Format token amounts from Wei
  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '₦0';
    
    try {
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
      const groupDetails = await Saving_Contract.getGroupDetails(selectedGroup);
      
      // Find the selected group from myGroups to get the correct data structure
      const selectedGroupData = myGroups.find(group => 
        (group.id || group.groupId) === selectedGroup
      );
      
      // Clean the group name - extract only the name part, not the address
      let cleanGroupName = `Group ${selectedGroup}`;
      if (selectedGroupData?.name && typeof selectedGroupData.name === 'string') {
        if (selectedGroupData.name.includes('/')) {
          const parts = selectedGroupData.name.split('/');
          cleanGroupName = parts[0].trim() || `Group ${selectedGroup}`;
        } else {
          cleanGroupName = selectedGroupData.name.trim();
        }
      }
      
      // Clean other fields that might contain addresses - filter out any field with 0x
      const cleanMaxMembers = (() => {
        const value = selectedGroupData?.groupSize || groupSummary[4] || 0;
        if (typeof value === 'string' && value.includes('0x')) return 0;
        if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
        if (typeof value === 'number') return value;
        return 0;
      })();
      
      const cleanCurrentMembers = (() => {
        const value = selectedGroupData?.memberCount || groupSummary[8] || 0;
        if (typeof value === 'string' && value.includes('0x')) return 0;
        if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
        if (typeof value === 'number') return value;
        return 0;
      })();
      
      const cleanCurrentRound = (() => {
        const value = selectedGroupData?.currentCycle || groupSummary[10] || 0;
        if (typeof value === 'string' && value.includes('0x')) return 0;
        if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
        if (typeof value === 'number') return value;
        return 0;
      })();
      
      const cleanTotalRounds = (() => {
        const value = selectedGroupData?.totalCycles || groupSummary[11] || 0;
        if (typeof value === 'string' && value.includes('0x')) return 0;
        if (typeof value === 'string' && !isNaN(parseInt(value))) return parseInt(value);
        if (typeof value === 'number') return value;
        return 0;
      })();
      
      setGroupDetails({
        groupId: selectedGroup,
        name: cleanGroupName,
        description: selectedGroupData?.description || groupDetails[1] || '',
        creator: selectedGroupData?.creator || groupSummary[2] || '',
        contributionAmount: selectedGroupData?.contributionAmount || groupSummary[3] || 0,
        maxMembers: cleanMaxMembers,
        currentMembers: cleanCurrentMembers,
        currentRound: cleanCurrentRound,
        totalRounds: cleanTotalRounds,
        isActive: selectedGroupData?.status === 'active' || groupSummary[7] || false,
        isCompleted: selectedGroupData?.status === 'completed' || false,
        nextContributionDeadline: groupSummary[15] || 0,
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
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      // This would need to be implemented based on your smart contract structure
      // For now, we'll use a placeholder
      setPayoutHistory([
        {
          id: 1,
          amount: '₦5000',
          date: '2024-01-15',
          status: 'completed',
          round: 3
        },
        {
          id: 2,
          amount: '₦5000',
          date: '2024-02-15',
          status: 'completed',
          round: 6
        }
      ]);
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleCashout = async () => {
    if (!selectedGroup || !SAVING_CONTRACT_INSTANCE) {
      toast({
        title: "Error",
        description: "Please select a group first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      
      const tx = await Saving_Contract.cashout(selectedGroup);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Cashout successful! Your earnings have been sent to your wallet.",
      });
      
      // Refresh data
      fetchGroupDetails();
      fetchUserContributionStatus();
      fetchPayoutHistory();
      
    } catch (error) {
      console.error('Error cashing out:', error);
      toast({
        title: "Error",
        description: "Failed to cashout. Please try again.",
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
            You need to join or create a ROSCA group before you can access payouts.
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
            Select Group for Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-select">Choose a ROSCA Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group to view payouts and cashout" />
              </SelectTrigger>
              <SelectContent>
                {myGroups.map((group, index) => {
                  // Parse group name properly - extract just the name part, not the address
                  let displayName = `Group ${index + 1}`;
                  if (group.name && typeof group.name === 'string') {
                    if (group.name.includes('/')) {
                      const parts = group.name.split('/');
                      displayName = parts[0].trim() || `Group ${index + 1}`;
                    } else {
                      displayName = group.name.trim();
                    }
                  }
                  
                  return (
                    <SelectItem key={index} value={group.id || group.groupId || index.toString()}>
                      <span className="text-gray-900 font-medium">{displayName}</span>
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
          <Card className="rosca-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {groupDetails.name} - Payout Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {groupDetails.currentMembers || 0}/{groupDetails.maxMembers || 0}
                  </p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {groupDetails.currentRound || 0}/{groupDetails.totalRounds || 0}
                  </p>
                  <p className="text-sm text-gray-600">Current Round</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Wallet className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {formatTokenAmount(groupDetails.contributionAmount)}
                  </p>
                  <p className="text-sm text-gray-600">Per Round</p>
                </div>
              </div>

              {groupDetails.isActive && (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium">
                    Next contribution deadline: {getTimeRemaining(groupDetails.nextContributionDeadline)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available for Cashout */}
          <Card className="rosca-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Available for Cashout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-green-800">
                  {userContributionStatus?.availableForCashout ? 
                    formatTokenAmount(userContributionStatus.availableForCashout) : 
                    '₦0'
                  }
                </p>
                <p className="text-sm text-green-600">Available for Cashout</p>
              </div>
              
              <Button 
                onClick={handleCashout}
                disabled={!userContributionStatus?.availableForCashout || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Cashout Earnings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="rosca-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payoutHistory.length > 0 ? (
                <div className="space-y-3">
                  {payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          payout.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">Round {payout.round}</p>
                          <p className="text-xs text-muted-foreground">{payout.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{payout.amount}</p>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payout history available yet</p>
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
