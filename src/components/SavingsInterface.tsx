import React, { useState, useEffect } from 'react';
import { Crown, UserPlus, Users, TrendingUp, Calendar, DollarSign, Clock, CheckCircle, Star, Shield, AlertCircle, Loader, Plus, Search, Eye, Copy, Zap, Target, Users2, Wallet, BarChart3 } from 'lucide-react';
import { CONTRACT_ADDRESSES, useContractInstances } from '@/provider/ContractInstanceProvider';
import tokens from '@/lib/Tokens/tokens';
import { useToast } from '@/hooks/use-toast';
import { 
  ROSCADashboard, 
  CreateGroup, 
  ROSCAModals,
  JoinGroup,
  MyGroups
} from './ROSCA';
import GroupContributions from './ROSCA/GroupContributions';
import Payouts from './ROSCA/Payouts';
import ErrorBoundary from './ErrorBoundary';

const AjoEsusuInterface = () => {
  const { toast } = useToast();
  
  // All state declarations at the top
  const [contributionAmount, setContributionAmount] = useState('');
  const [groupSize, setGroupSize] = useState(5);
  const [frequency, setFrequency] = useState('weekly');
  const [activeTab, setActiveTab] = useState('my-groups');
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
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
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

  // Get supported tokens (excluding ETH which is id: 1)
  const getSupportedTokens = () => {
    return tokens.filter(token => token.id > 1);
  };

  // Format token amounts
  const formatTokenAmount = (amountInWei, decimals = 18) => {
    if (!amountInWei) return '0';
    const divisor = Math.pow(10, decimals);
    return (parseFloat(amountInWei) / divisor).toFixed(2);
  };

  // Convert token amount to wei
  const toWei = (amount, decimals = 18) => {
    const multiplier = Math.pow(10, decimals);
    return (parseFloat(amount) * multiplier).toString();
  };

  // Get time remaining
  const getTimeRemaining = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(timestamp) - now;
    
    if (remaining <= 0) return "Expired";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // All useEffect hooks together
  useEffect(() => {
    if (isConnected && address) {
      initializeData();
    }
  }, [isConnected, address]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedGroupRef && !expandedGroupRef.contains(event.target as Node)) {
        setExpandedGroup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedGroupRef]);

  // Initialize data
  const initializeData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is registered
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const userRegistration = await Saving_Contract.isUserRegistered(address);
      setIsRegistered(userRegistration || false);
      
      console.log('User registration status:', userRegistration);
      
      if (userRegistration) {
        // Check if user is an agent
        const agentStatus = await Saving_Contract.isAjoAgent(address);
        setIsAgent(agentStatus || false);
        
        // Get user info
        const userMemberInfo = await Saving_Contract.getMemberInfo(address);
        console.log('User member info:', userMemberInfo);
        setUserInfo(userMemberInfo);
        
        const name = await Saving_Contract.getUserName(address);
        setUserName(name || 'User');
        
        // Get user's groups
        const userGroupIds = await Saving_Contract.getUserGroups(address);
        console.log('User group IDs:', userGroupIds);
        
        const userGroupsData = await Promise.all(
          userGroupIds.map(async (groupId) => {
            const summary = await Saving_Contract.getGroupSummary(groupId);
            const savingInfo = await Saving_Contract.savingsGroups(groupId);
            const contributionStatus = await Saving_Contract.getUserContributionStatus(groupId, address);
            
            console.log(`Group ${groupId} summary:`, summary);
            console.log(`Group ${groupId} saving info:`, savingInfo);
            console.log(`Group ${groupId} contribution status:`, contributionStatus);
            
            // Get invite code for groups created by the user
            let inviteCode = "";
            if (summary[2] === address) {
              try {
                inviteCode = await Saving_Contract.groupInviteCode(groupId);
              } catch (error) {
                console.log(`No invite code for group ${groupId}`);
              }
            }
            
            return { 
              ...summary, 
              contributionStatus,
              inviteCode,
              id: groupId,
              name: summary[0],
              description: summary[1],
              creator: summary[2],
              contributionAmount: summary[3],
              groupSize: summary[4],
              frequency: summary[5],
              tokenAddress: summary[6],
              status: summary[7] ? 'active' : 'pending',
              memberCount: savingInfo[0],
              totalPool: savingInfo[1],
              currentCycle: savingInfo[2],
              totalCycles: savingInfo[3],
              contractAddress: summary[2], // Using creator address as contract address for now
              createdAt: 'Unknown',
              nextCycleDate: 'N/A',
              totalContributed: contributionStatus[0],
              cyclesCompleted: contributionStatus[1],
              nextPayout: 'N/A'
            };
          })
        );
        console.log('Processed user groups data:', userGroupsData);
        setMyGroups(userGroupsData);
        
        // Get available groups
        const joinableGroups = await Saving_Contract.getJoinableGroups();
        setAvailableGroups(joinableGroups || []);
        
        // Get platform statistics
        const stats = await Saving_Contract.getTotalStats();
        setTotalStats(stats);
      } else {
        console.log('User is not registered, setting default values');
        setUserInfo(null);
        setMyGroups([]);
        setAvailableGroups([]);
        setTotalStats(null);
      }
      
      // Get supported tokens
      const tokens = getSupportedTokens();
      setSupportedTokens(tokens);
      
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user registration
  const handleUserRegistration = async () => {
    if (!userName.trim()) {
      setErrorMessage('Please enter your name to register');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.registerUser(userName);
      
      toast({
        title: "Registering User... 🔄",
        description: "Processing your registration on the blockchain.",
        duration: 2000,
      });

      await tx.wait();
      
      setSuccessMessage('Successfully registered! You can now create and join groups.');
      setIsRegistered(true);
      
      // Refresh data
      await initializeData();
      
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage('Failed to register user. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!groupName || !contributionAmount || !selectedToken || !groupSize || !frequency) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const frequencySeconds = frequencyOptions.find(f => f.value === frequency)?.seconds;
      if (!frequencySeconds) {
        setErrorMessage('Invalid frequency selected');
        return;
      }

      const contributionInWei = toWei(contributionAmount, 18);
      
      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.createGroup(
        groupName,
        groupDescription || `${groupName} - A savings group`,
        selectedToken,
        contributionInWei,
        frequencySeconds,
        groupSize
      );

      await tx.wait();
      
      setSuccessMessage('Group created successfully!');
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setContributionAmount('');
      setGroupSize(5);
      setFrequency('weekly');
      setSelectedToken('');
      
      // Refresh data
      await initializeData();
      
    } catch (error) {
      console.error('Error creating group:', error);
      setErrorMessage('Failed to create group. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle join group
  const handleJoinGroup = async () => {
    if (!inviteCode) {
      setErrorMessage('Please enter an invite code');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.joinGroupWithCode(0, inviteCode); // Using groupId 0 for now, should be extracted from invite code
      await tx.wait();
      
      setSuccessMessage('Successfully joined the group!');
      setInviteCode('');
      
      // Refresh data
      await initializeData();
      
    } catch (error) {
      console.error('Error joining group:', error);
      setErrorMessage('Failed to join group. Please check the invite code and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle agent registration
  const handleRegisterUserAsAgent = async () => {
    if (!agentContactInfo) {
      setErrorMessage('Please provide contact information');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.registerAsAjoAgent(userName, agentContactInfo);
      await tx.wait();
      
      setSuccessMessage('Successfully registered as an agent!');
      setAgentContactInfo('');
      setShowAgentRegistration(false);
      setIsAgent(true);
      
      // Refresh data
      await initializeData();
      
    } catch (error) {
      console.error('Error registering as agent:', error);
      setErrorMessage('Failed to register as agent. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle generate invite code
  const handleGenerateInviteCode = async () => {
    if (!selectedGroupId || !maxUses || !validityDays) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const Saving_Contract = await SAVING_CONTRACT_INSTANCE();
      const tx = await Saving_Contract.generateInviteCode(
        selectedGroupId,
        maxUses,
        validityDays
      );

      await tx.wait();
      
      setSuccessMessage('Invite code generated successfully!');
      setSelectedGroupId(null);
      setMaxUses(10);
      setValidityDays(30);
      setShowInviteModal(false);
      
    } catch (error) {
      console.error('Error generating invite code:', error);
      setErrorMessage('Failed to generate invite code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render the main dashboard
  return (
    <>
      <ROSCAModals
        showAgentRegistration={showAgentRegistration}
        setShowAgentRegistration={setShowAgentRegistration}
        showInviteModal={showInviteModal}
        setShowInviteModal={setShowInviteModal}
        agentContactInfo={agentContactInfo}
        setAgentContactInfo={setAgentContactInfo}
        maxUses={maxUses}
        setMaxUses={setMaxUses}
        validityDays={validityDays}
        setValidityDays={setValidityDays}
        selectedGroupId={selectedGroupId}
        isProcessing={isProcessing}
        handleRegisterUserAsAgent={handleRegisterUserAsAgent}
        handleGenerateInviteCode={handleGenerateInviteCode}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <ROSCADashboard
        userName={userName}
        userInfo={userInfo}
        totalStats={totalStats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myGroups={myGroups}
        availableGroups={availableGroups}
      >
        {/* Tab Content */}
        <ErrorBoundary>
          {activeTab === 'my-groups' && (
            <MyGroups 
              myGroups={myGroups}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'create-group' && (
            <CreateGroup />
          )}

          {activeTab === 'join-group' && (
            <JoinGroup />
          )}

          {activeTab === 'group-contributions' && (
            <GroupContributions myGroups={myGroups} />
          )}

          {activeTab === 'payouts' && (
            <Payouts myGroups={myGroups} />
          )}
        </ErrorBoundary>
      </ROSCADashboard>
    </>
  );
};

export default AjoEsusuInterface;
