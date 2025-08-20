import React, { useState, useEffect } from 'react';
import { formatEther, JsonRpcProvider } from 'ethers';

import Currencies from '@/lib/Tokens/currencies';
import { useContractInstances } from '@/provider/ContractInstanceProvider';
import { shortenAddress } from '@/lib/utils';
import { roundToFiveDecimalPlaces, roundToTwoDecimalPlaces} from '@/lib/utils.ts';
import tokens from '@/lib/Tokens/tokens';

// Import the separated components
import WalletNotConnected from './Notconnected';
import ConnectedDashboard from './ConnectedDashboard';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('cNGN');
  const { fetchBalance, address, isConnected, PRICEAPI_CONTRACT_INSTANCE, signer, TEST_TOKEN_CONTRACT_INSTANCE, AFRISTABLE_CONTRACT_INSTANCE } = useContractInstances();
  const [bal1, setBal1] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<number>(0);
  const [currentTokenPrice, setCurrentTokenPrice] = useState<number>(0);
  const [portfolioGrowth, setPortfolioGrowth] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: { rate: number, change: number, positive: boolean | null }}>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);

  // Get selected token based on currency
  useEffect(() => {
    const token = tokens.find(t => t.symbol === selectedCurrency);
    setSelectedToken(token || null);
  }, [selectedCurrency]);

  // Fetch balance and price data
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address || !selectedToken) return;

      try {
        // Fetch balance
        const balance = await fetchBalance(selectedToken.address);
        if (balance !== undefined) {
          setBal1(parseFloat(balance));
        }

        // Fetch token price
        const priceContract = await PRICEAPI_CONTRACT_INSTANCE();
        if (priceContract) {
          const price = await priceContract.getTokenPrice(selectedToken.address);
          const priceInUSD = parseFloat(formatEther(price));
          setCurrentTokenPrice(priceInUSD);
          
          // Calculate USD value
          if (balance !== undefined) {
            setUsdValue(parseFloat(balance) * priceInUSD);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isConnected, address, selectedToken, fetchBalance, PRICEAPI_CONTRACT_INSTANCE]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      const priceContract = await PRICEAPI_CONTRACT_INSTANCE();
      if (!priceContract) return;

      try {
        const rates: {[key: string]: { rate: number, change: number, positive: boolean | null }} = {};
        
        for (const token of tokens) {
          try {
            const price = await priceContract.getTokenPrice(token.address);
            const priceInUSD = parseFloat(formatEther(price));
            
            // Simulate price change (in real app, this would come from historical data)
            const change = (Math.random() - 0.5) * 2; // -1% to +1%
            const positive = change > 0 ? true : change < 0 ? false : null;
            
            rates[token.symbol] = {
              rate: priceInUSD,
              change: Math.abs(change),
              positive
            };
          } catch (error) {
            console.error(`Error fetching price for ${token.symbol}:`, error);
          }
        }
        
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    fetchExchangeRates();
    
    // Update rates every 30 seconds
    const interval = setInterval(fetchExchangeRates, 30000);
    return () => clearInterval(interval);
  }, [PRICEAPI_CONTRACT_INSTANCE]);

  // Fetch transactions from blockchain
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address || !signer) return;

      setTxLoading(true);
      setTxError(null);

      try {
        const provider = signer.provider as JsonRpcProvider | undefined;
        if (!provider) {
          throw new Error('Provider not available');
        }

        const allTransactions: any[] = [];
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(currentBlock - 10000, 0); // Last 10k blocks

        // Fetch transactions for all supported tokens
        for (const token of tokens) {
          if (!token.address) continue;

          let contract;
          if (token.symbol === 'AFX') {
            contract = await AFRISTABLE_CONTRACT_INSTANCE();
          } else {
            contract = await TEST_TOKEN_CONTRACT_INSTANCE(token.address);
          }

          if (!contract) continue;

          try {
            // Fetch Transfer events
            const sentEvents = await contract.queryFilter(
              contract.filters.Transfer(address, null),
              fromBlock,
              currentBlock
            );

            const receivedEvents = await contract.queryFilter(
              contract.filters.Transfer(null, address),
              fromBlock,
              currentBlock
            );

            // Process sent transactions
            const sent = sentEvents.map(event => ({
              hash: event.transactionHash,
              blockNumber: event.blockNumber,
              direction: 'sent' as const,
              counterparty: event.args?.to,
              amount: parseFloat(formatEther(event.args?.value || 0)),
              token: token.symbol,
              timestamp: null,
              gasUsed: null,
              gasPrice: null
            }));

            // Process received transactions
            const received = receivedEvents.map(event => ({
              hash: event.transactionHash,
              blockNumber: event.blockNumber,
              direction: 'received' as const,
              counterparty: event.args?.from,
              amount: parseFloat(formatEther(event.args?.value || 0)),
              token: token.symbol,
              timestamp: null,
              gasUsed: null,
              gasPrice: null
            }));

            allTransactions.push(...sent, ...received);
          } catch (error) {
            console.error(`Error fetching transactions for ${token.symbol}:`, error);
          }
        }

        // Fetch transaction details (gas, timestamp) for each unique transaction
        const uniqueTxs = allTransactions.filter((tx, index, self) => 
          index === self.findIndex(t => t.hash === tx.hash)
        );

        const enrichedTxs = await Promise.all(
          uniqueTxs.map(async (tx) => {
            try {
              const txReceipt = await provider.getTransactionReceipt(tx.hash);
              const txDetails = await provider.getTransaction(tx.hash);
              
              return {
                ...tx,
                gasUsed: txReceipt?.gasUsed ? parseFloat(txReceipt.gasUsed.toString()) : null,
                gasPrice: txDetails?.gasPrice ? parseFloat(txDetails.gasPrice.toString()) : null,
                timestamp: tx.timestamp || null
              };
            } catch (error) {
              console.error(`Error fetching details for tx ${tx.hash}:`, error);
              return tx;
            }
          })
        );

        // Sort by block number (newest first) and take the most recent 10
        enrichedTxs.sort((a, b) => b.blockNumber - a.blockNumber);
        const recentTxs = enrichedTxs.slice(0, 10);

        setTransactions(recentTxs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTxError('Failed to load transactions from blockchain');
      } finally {
        setTxLoading(false);
      }
    };

    fetchTransactions();
    
    // Poll every 30 seconds for new transactions
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, signer, TEST_TOKEN_CONTRACT_INSTANCE, AFRISTABLE_CONTRACT_INSTANCE]);

  // Calculate portfolio growth (simulated)
  useEffect(() => {
    // Simulate portfolio growth calculation
    const growth = Math.random() * 10; // 0-10% growth
    setPortfolioGrowth(roundToTwoDecimalPlaces(growth));
  }, [usdValue]);

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    console.log('Quick action clicked:', action);
    if (onPageChange) {
      console.log('Calling onPageChange with:', action);
      onPageChange(action);
    } else {
      console.log('onPageChange is not available');
    }
  };

  // Render based on connection status
  if (!isConnected) {
    return <WalletNotConnected exchangeRates={exchangeRates} />;
  }

  return (
    <ConnectedDashboard
      selectedCurrency={selectedCurrency}
      setSelectedCurrency={setSelectedCurrency}
      balanceVisible={balanceVisible}
      setBalanceVisible={setBalanceVisible}
      walletAddress={address || ''}
      copied={copied}
      onCopyAddress={handleCopyAddress}
      selectedToken={selectedToken}
      bal1={bal1}
      usdValue={usdValue}
      currentTokenPrice={currentTokenPrice}
      portfolioGrowth={portfolioGrowth}
      onQuickAction={handleQuickAction}
      exchangeRates={exchangeRates}
      transactions={transactions}
      txLoading={txLoading}
      txError={txError}
    />
  );
};

export default Dashboard;