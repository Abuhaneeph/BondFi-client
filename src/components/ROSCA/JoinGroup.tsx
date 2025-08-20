import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserPlus, 
  Search, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Loader
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContractInstances } from '@/provider/ContractInstanceProvider';

const JoinGroup = () => {
  const { toast } = useToast();
  const { SAVING_CONTRACT_INSTANCE } = useContractInstances();
  
  const [inviteCode, setInviteCode] = useState('');
  const [foundGroup, setFoundGroup] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Format token amounts from Wei
  const formatTokenAmount = (amountInWei: any, decimals = 18) => {
    if (!amountInWei) return '₦0';
    const divisor = Math.pow(10, decimals);
    const amount = parseFloat(amountInWei.toString()) / divisor;
    return `₦${amount.toLocaleString()}`;
  };

  // Format frequency from seconds to readable format
  const formatFrequency = (seconds: any) => {
    if (!seconds) return 'N/A';
    const secs = Number(seconds);
    if (secs === 300) return '5 minutes';
    if (secs === 86400) return 'Daily';
    if (secs === 604800) return 'Weekly';
    if (secs === 1209600) return 'Bi-weekly';
    if (secs === 2592000) return 'Monthly';
    return `${secs} seconds`;
  };

  // Search for group using invite code
  const searchGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Enter Invite Code",
        description: "Please enter a valid invite code to search for groups.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      if (!Saving_Contract) {
        throw new Error('Smart contract not initialized');
      }
      
      console.log('Searching for invite code:', inviteCode.toUpperCase());
      console.log('Smart contract instance:', Saving_Contract);
      
      const inviteInfo = await Saving_Contract.getInviteCodeInfo(inviteCode.toUpperCase());
      console.log('Invite code info:', inviteInfo);
      
      if (inviteInfo && inviteInfo.isActive) {
        console.log('Invite code is active, getting group details...');
        
        // Get group details
        const groupDetails = await Saving_Contract.getGroupDetails(inviteInfo.groupId);
        const groupSummary = await Saving_Contract.getGroupSummary(inviteInfo.groupId);
        
        console.log('Group details:', groupDetails);
        console.log('Group summary:', groupSummary);
        
        // Check if group is full
        if (groupDetails.currentMembers >= groupDetails.maxMembers) {
          setFoundGroup(null);
          toast({
            title: "Group is Full",
            description: "This group has reached its maximum member limit.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
        
        // Check if invite code has expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (inviteInfo.expiryTime && currentTime > inviteInfo.expiryTime) {
          setFoundGroup(null);
          toast({
            title: "Invite Code Expired",
            description: "This invite code has expired. Please request a new one.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
        
        // Check if invite code usage limit reached
        if (inviteInfo.currentUses >= inviteInfo.maxUses) {
          setFoundGroup(null);
          toast({
            title: "Invite Code Limit Reached",
            description: "This invite code has reached its maximum usage limit.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
        
        // Format group data
        const group = {
          id: inviteInfo.groupId,
          name: groupDetails.name,
          description: groupDetails.description,
          members: { 
            current: groupDetails.currentMembers, 
            max: groupDetails.maxMembers 
          },
          contribution: groupDetails.contributionAmount,
          frequency: groupDetails.contributionFrequency,
          duration: `${groupDetails.maxMembers} rounds`,
          organizer: groupDetails.creatorName,
          reputation: 4.8, // This would come from agent info
          contractAddress: inviteInfo.agent,
          status: groupDetails.isActive ? 'active' : 'inactive',
          nextStartDate: groupDetails.startTime,
          tokenType: 'NGN', // This would come from token info
          totalPool: groupDetails.contributionAmount * groupDetails.maxMembers,
          requirements: [
            'Minimum 6 months blockchain transaction history',
            'Verified identity through KYC',
            'LinkedIn profile in tech industry'
          ],
          benefits: [
            'Access to tech equipment loans',
            'Priority training opportunities',
            'Networking events'
          ],
          inviteInfo: inviteInfo
        };
        
        setFoundGroup(group);
        toast({
          title: "Group Found! ✅",
          description: `Found "${group.name}" - Review details below.`,
          duration: 3000,
        });
      } else {
        setFoundGroup(null);
        
        // More specific error messages based on what we know
        if (!inviteInfo) {
          toast({
            title: "Invalid Invite Code",
            description: "The invite code you entered does not exist.",
            variant: "destructive",
            duration: 4000,
          });
        } else if (!inviteInfo.isActive) {
          toast({
            title: "Invite Code Inactive",
            description: "This invite code is no longer active.",
            variant: "destructive",
            duration: 4000,
          });
        } else {
          toast({
            title: "Group Not Found",
            description: "Invalid invite code or group may have expired.",
            variant: "destructive",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Error searching for group:', error);
      setFoundGroup(null);
      toast({
        title: "Search Failed",
        description: "Error searching for group. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Join group using invite code
  const joinGroup = async () => {
    if (!foundGroup) return;

    setIsJoining(true);
    
    try {
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      if (!Saving_Contract) {
        throw new Error('Smart contract not initialized');
      }
      
      console.log('Joining group with ID:', foundGroup.id);
      console.log('Using invite code:', inviteCode.toUpperCase());
      
      const tx = await Saving_Contract.joinGroupWithCode(
        foundGroup.id, 
        inviteCode.toUpperCase()
      );
      
      console.log('Join transaction created:', tx);
      
      toast({
        title: "Joining Group... 🔄",
        description: "Processing your request and smart contract interaction.",
        duration: 2000,
      });

      await tx.wait();
      
      toast({
        title: "Successfully Joined! 🎉",
        description: `Welcome to ${foundGroup.name}! Check your My Groups tab.`,
        duration: 5000,
      });
      
      // Reset form
      setInviteCode('');
      setFoundGroup(null);
    } catch (error) {
      console.error('Error joining group:', error);
      
      let errorMessage = "Failed to join group. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'recruiting': return 'bg-primary/10 text-primary border-primary/20';
      case 'full': return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active & Running';
      case 'recruiting': return 'Recruiting Members';
      case 'full': return 'Full (Waitlist Available)';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  // Helper function to generate a sample invite code for testing
  const generateSampleInviteCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const groupHash = btoa('TestGroup' + '10000' + '5').slice(0, 8).toUpperCase();
    const sampleCode = `${groupHash}-${timestamp}`;
    setInviteCode(sampleCode);
    toast({
      title: "Sample Code Generated",
      description: "A sample invite code has been generated for testing purposes.",
      duration: 3000,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Join Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="rosca-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Join ROSCA Group
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter an invite code to find and join an existing ROSCA group
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  id="inviteCode"
                  placeholder="e.g., TECH2024XYZ"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button 
                  onClick={searchGroup} 
                  disabled={isSearching}
                  className="rosca-hero"
                >
                  {isSearching ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Invite codes are case-insensitive and usually 10-12 characters long
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSampleInviteCode}
                  className="text-xs"
                >
                  Generate Sample Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Details */}
        {foundGroup && (
          <Card className="rosca-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{foundGroup.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{foundGroup.description}</p>
                </div>
                <Badge className={getStatusColor(foundGroup.status)}>
                  {getStatusText(foundGroup.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Group Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-semibold">{foundGroup.members.current}/{foundGroup.members.max}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
                  <p className="text-sm text-muted-foreground">Contribution</p>
                  <p className="font-semibold">{formatTokenAmount(foundGroup.contribution)}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{formatFrequency(foundGroup.frequency)}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{foundGroup.duration}</p>
                </div>
              </div>

              <Separator />

              {/* Organizer Info */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium">Group Organizer</p>
                  <p className="text-sm text-muted-foreground">{foundGroup.organizer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-success" />
                    {foundGroup.reputation}/5
                  </p>
                  <p className="text-xs text-muted-foreground">Trust Score</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Membership Requirements
                </h4>
                <ul className="space-y-2">
                  {foundGroup.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  Member Benefits
                </h4>
                <ul className="space-y-2">
                  {foundGroup.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Smart Contract Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Smart Contract</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {foundGroup.contractAddress}
                  </code>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {foundGroup.status === 'active' ? (
                  <Button 
                    onClick={joinGroup} 
                    disabled={isJoining}
                    className="flex-1 rosca-hero text-lg font-semibold py-6"
                  >
                    {isJoining ? (
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-5 w-5 mr-2" />
                    )}
                    {isJoining ? 'Joining...' : 'Join This Group'}
                  </Button>
                ) : (
                  <Button disabled className="flex-1" variant="secondary">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Group Not Available
                  </Button>
                )}
              </div>

              {/* Status Alerts */}
              {foundGroup.status === 'inactive' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This group is currently inactive. Please contact the organizer for more information.
                  </AlertDescription>
                </Alert>
              )}

              {foundGroup.inviteInfo && foundGroup.inviteInfo.maxUses > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This invite code has {foundGroup.inviteInfo.maxUses - foundGroup.inviteInfo.currentUses} uses remaining.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* How to Join */}
        <Card className="rosca-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              How to Join
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium text-sm">Get Invite Code</p>
                <p className="text-xs text-muted-foreground">From existing group member</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium text-sm">Review Group Details</p>
                <p className="text-xs text-muted-foreground">Check terms and requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium text-sm">Join & Contribute</p>
                <p className="text-xs text-muted-foreground">Smart contract handles security</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="rosca-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-success" />
              Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="font-medium text-sm">Verify Group Organizer</p>
                <p className="text-xs text-muted-foreground">Check reputation and past groups</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="font-medium text-sm">Review Smart Contract</p>
                <p className="text-xs text-muted-foreground">All transactions are transparent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="font-medium text-sm">Start Small</p>
                <p className="text-xs text-muted-foreground">Begin with smaller amounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Groups */}
        <Card className="rosca-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-accent" />
              Try These Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
                onClick={() => setInviteCode('TECH2024XYZ')}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">TECH2024XYZ</p>
                  <p className="text-xs text-muted-foreground">Lagos Tech Professionals</p>
                </div>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto"
                onClick={() => setInviteCode('STUDENT2024DEF')}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">STUDENT2024DEF</p>
                  <p className="text-xs text-muted-foreground">University Students Group</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinGroup;
