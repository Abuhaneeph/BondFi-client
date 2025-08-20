import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Eye, 
  Send, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Plus,
  UserPlus,
  Star,
  Wallet
} from 'lucide-react';

interface MyGroupsProps {
  myGroups: any[];
  setActiveTab: (tab: string) => void;
}

const MyGroups: React.FC<MyGroupsProps> = ({ myGroups, setActiveTab }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Format token amounts from Wei
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

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle BigInt values
      const timestampValue = typeof timestamp === 'bigint' 
        ? timestamp.toString() 
        : timestamp.toString();
      
      const date = new Date(Number(timestampValue) * 1000);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Get time remaining for next contribution
  const getTimeRemaining = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle BigInt values
      const timestampValue = typeof timestamp === 'bigint' 
        ? timestamp.toString() 
        : timestamp.toString();
      
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(timestampValue) - now;
      
      if (remaining <= 0) return "Overdue";
      
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      
      if (days > 0) return `${days} days`;
      if (hours > 0) return `${hours} hours`;
      return 'Less than 1 hour';
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const calculateProgress = (group: any) => {
    if (!group.currentRound || !group.totalRounds) return 0;
    return (group.currentRound / group.totalRounds) * 100;
  };

  // Parse group data to separate name and address
  const parseGroupData = (group: any, index: number) => {
    let groupName = `Group ${index + 1}`;
    let groupAddress = '';
    
    // Check if group has a name field that contains both name and address
    if (group.name && typeof group.name === 'string') {
      if (group.name.includes('/')) {
        const parts = group.name.split('/');
        groupName = parts[0].trim() || `Group ${index + 1}`;
        groupAddress = parts[1]?.trim() || '';
      } else {
        groupName = group.name.trim();
      }
    }
    
    // If no address found in name, try to get it from other fields
    if (!groupAddress && group.address) {
      groupAddress = group.address;
    }
    
    // Try other common field names
    if (!groupAddress && group.contractAddress) {
      groupAddress = group.contractAddress;
    }
    
    if (!groupAddress && group.id) {
      groupAddress = group.id;
    }
    
    return { groupName, groupAddress };
  };

  // Truncate address for display - modern approach
  const truncateAddress = (address: string) => {
    if (!address) return '';
    
    // Ensure address is a string
    const addressStr = String(address);
    
    // Check if it's a valid Ethereum address format
    if (!addressStr.startsWith('0x') || addressStr.length !== 42) {
      return addressStr;
    }
    
    if (addressStr.length <= 8) return addressStr;
    
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  // If no groups, show empty state
  if (myGroups.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Groups Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create your first ROSCA group or join an existing one to start building your financial future together.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium"
              onClick={() => setActiveTab('create-group')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
              onClick={() => setActiveTab('join-group')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Group
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex gap-3">
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium"
            onClick={() => setActiveTab('create-group')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
            onClick={() => setActiveTab('join-group')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join Group
          </Button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 px-6 py-4">Group</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4">Address</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 text-center">Members</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 text-center">Per Round</TableHead>
                <TableHead className="font-semibold text-gray-900 px-6 py-4 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myGroups.map((group, index) => {
                const { groupName, groupAddress } = parseGroupData(group, index);
                const status = group.status || 'pending';
                
                // Clean member count data - ensure it's just numbers, not addresses
                let memberCount = 0;
                let maxMembers = 0;
                
                if (group.memberCount && typeof group.memberCount === 'number') {
                  memberCount = group.memberCount;
                } else if (group.memberCount && typeof group.memberCount === 'string' && !group.memberCount.includes('0x')) {
                  memberCount = parseInt(group.memberCount) || 0;
                }
                
                if (group.groupSize && typeof group.groupSize === 'number') {
                  maxMembers = group.groupSize;
                } else if (group.groupSize && typeof group.groupSize === 'string' && !group.groupSize.includes('0x')) {
                  maxMembers = parseInt(group.groupSize) || 0;
                }
                
                const contributionAmount = group.contributionAmount || 0;
                
                return (
                  <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Group Name */}
                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{groupName}</div>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell className="px-6 py-4">
                      <Badge 
                        variant={status === 'active' ? 'default' : 'secondary'}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          status === 'active' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}
                      >
                        {status === 'active' ? 'Active' : 'Pending'}
                      </Badge>
                    </TableCell>
                    
                    {/* Address */}
                    <TableCell className="px-6 py-4">
                      {groupAddress && (
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border">
                            {truncateAddress(groupAddress)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-200 rounded"
                            onClick={() => navigator.clipboard.writeText(groupAddress)}
                          >
                            <Copy className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Members */}
                    <TableCell className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {Number(memberCount) || 0}/{Number(maxMembers) || 0}
                        </span>
                      </div>
                    </TableCell>
                    
                    {/* Per Round */}
                    <TableCell className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {formatTokenAmount(contributionAmount)}
                        </span>
                      </div>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1 text-sm"
                          onClick={() => setActiveTab('group-contributions')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Contribute
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1 text-sm"
                          onClick={() => setActiveTab('payouts')}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Payouts
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MyGroups;
