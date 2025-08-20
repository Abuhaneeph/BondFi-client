import OpenAI from 'openai';

// Configure OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': import.meta.env.VITE_SITE_URL || 'https://bondfi.vercel.app/',
    'X-Title': 'BondFi - AI Assistant',
  },
  dangerouslyAllowBrowser: true,
});

// System prompt for BondFi-specific context
const BONDFI_SYSTEM_PROMPT = `You are the BondFi AI Assistant, an expert in blockchain technology, cryptocurrency, DeFi, and the BondFi platform specifically. You have deep knowledge about:

**BondFi Platform:**
- DeFi platform built on blockchain technology
- Supported tokens and stablecoins
- Core features: Token swapping, Digital savings groups (ROSCA), Send money, Faucet, Buy/Sell, Utility payments
- Smart contract addresses and blockchain integration
- Agent system for managing savings groups with invite codes
- Liquidity provision and LP token rewards

**Blockchain & DeFi Expertise:**
- Blockchain technology and ecosystem
- Cross-border stablecoin transactions
- Liquidity pools and automated market makers (AMM)
- Yield farming and staking mechanisms
- Smart contract security and best practices
- Web3 wallet integration (MetaMask, WalletConnect)

**Financial Context:**
- Traditional savings systems (ROSCA, Tontine)
- Cross-border remittances
- Mobile money integration
- Financial inclusion challenges and solutions
- Regulatory considerations across markets

**Communication Style:**
- Be helpful, professional, and knowledgeable
- Use clear explanations for complex blockchain concepts
- Provide step-by-step guidance when needed
- Reference specific BondFi features when relevant
- Be encouraging about financial inclusion and DeFi adoption
- Always prioritize user security and best practices

**Key Guidelines:**
- Always verify smart contract addresses before transactions
- Remind users about testnet vs mainnet differences
- Emphasize the importance of seed phrase security
- Explain gas fees and transaction costs clearly
- Highlight the benefits of decentralized finance

Respond as a knowledgeable, helpful assistant focused on empowering users with blockchain and BondFi platform knowledge.`;

/**
 * Send a message to OpenRouter API and get AI response
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} model - Model to use (default: openai/gpt-4o)
 * @returns {Promise<string>} - AI response text
 */
export const getAIResponse = async (messages, model = 'openai/gpt-4o') => {
  try {
    // Check configuration first
    if (!isConfigured()) {
      throw new Error('OpenRouter API is not properly configured. Please set up your API key.');
    }

    // Prepare messages with system prompt
    const messagesWithSystem = [
      {
        role: 'system',
        content: BONDFI_SYSTEM_PROMPT
      },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('No response received from AI service');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    
    // Handle different error types with more specific messages
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenRouter configuration.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('AI service temporarily unavailable. Please try again.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Generic error message
    throw new Error('AI service error. Please try again later.');
  }
};

/**
 * Get contextual help based on the current page/context
 * @param {string} context - The current context (e.g., 'dashboard', 'savings', 'merchant')
 * @returns {string} - Contextual help message
 */
export const getContextualHelp = (context = 'general') => {
  const helpMessages = {
    dashboard: "I can help you with your BondFi dashboard! Ask me about your portfolio, recent transactions, or how to use specific features.",
    savings: "Need help with savings groups (ROSCA)? I can explain how to create or join groups, manage contributions, and understand the process.",
    merchant: "Merchant services questions? I can help with payment processing, integration, and merchant account management.",
    ai: "I'm here to help! Ask me anything about BondFi, blockchain, DeFi, or general financial questions.",
    general: "Welcome to BondFi! I'm your AI assistant. How can I help you today?"
  };
  
  return helpMessages[context] || helpMessages.general;
};

/**
 * Check if OpenRouter is properly configured
 * @returns {boolean} - True if configured, false otherwise
 */
export const isConfigured = () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  return apiKey && apiKey !== '<OPENROUTER_API_KEY>' && apiKey.length > 0;
};

/**
 * Get available AI models
 * @returns {Array} - Array of available model objects
 */
export const getAvailableModels = () => {
  return [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Most capable model, best for complex tasks' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient, good for most tasks' },
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Excellent reasoning and analysis' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Fast and lightweight' },
    { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Good for creative and analytical tasks' }
  ];
};

/**
 * Get model pricing information
 * @param {string} model - Model ID
 * @returns {Object} - Pricing information
 */
export const getModelPricing = (model) => {
  const pricing = {
    'openai/gpt-4o': { input: 0.0025, output: 0.01 },
    'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'anthropic/claude-3-5-sonnet': { input: 0.003, output: 0.015 },
    'meta-llama/llama-3.1-8b-instruct': { input: 0.0002, output: 0.0002 },
    'google/gemini-pro': { input: 0.0005, output: 0.0015 }
  };
  
  return pricing[model] || { input: 0.001, output: 0.002 };
};
