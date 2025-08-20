import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import ReactMarkdown from 'react-markdown';
import {
  X,
  Send,
  MessageCircle,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  CheckCircle,
  Loader2,
  Sparkles,
  GripVertical,
  AlertTriangle
} from 'lucide-react';

// Import the OpenRouter service
import { getAIResponse, getContextualHelp, isConfigured } from './OpenRouter';

// Utility function for className concatenation
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const AIChatModal = ({ isOpen, onClose, context = 'general' }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "How can I help!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const nodeRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if OpenRouter is configured
  useEffect(() => {
    if (!isConfigured()) {
      setError('OpenRouter API is not properly configured. Please set up your API key.');
    }
  }, []);

  // Get AI response using OpenRouter
  const getSmartAIResponse = async (userMessage, messageHistory) => {
    try {
      // Prepare conversation history for context
      const conversationMessages = messageHistory
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));

      // Add current message
      conversationMessages.push({
        role: 'user',
        content: userMessage
      });

      // Get AI response
      const response = await getAIResponse(conversationMessages);
      return response;
    } catch (error) {
      console.error('AI Response Error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Get AI response
      const aiResponse = await getSmartAIResponse(userMessage, [...messages, userMsg]);
      
      // Add AI response
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setError(error.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: '1',
        text: getContextualHelp(context),
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  // Mobile view - full screen modal
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-terracotta to-sage">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">BondFi AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex space-x-3',
                message.isUser ? 'justify-end' : 'justify-start'
              )}
            >
              {!message.isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-terracotta to-sage rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.isUser
                    ? 'bg-gradient-to-r from-terracotta to-sage text-white'
                    : 'bg-stone-100 text-stone-800'
                )}
              >
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {message.text}
                </ReactMarkdown>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {!message.isUser && (
                    <button
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      {copiedId === message.id ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {message.isUser && (
                <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-stone-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-terracotta to-sage rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-stone-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-stone-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Input */}
        <div className="p-4 border-t border-stone-200">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about BondFi..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-terracotta to-sage text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view - draggable modal
  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
      bounds="body"
    >
      <div
        ref={nodeRef}
        className={cn(
          'fixed z-50 bg-white rounded-2xl shadow-2xl border border-stone-200 transition-all duration-300',
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        )}
        style={{
          top: Math.max(20, position.y),
          left: Math.max(20, position.x),
          right: Math.max(20, window.innerWidth - position.x - 384)
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-terracotta to-sage rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">
              {isMinimized ? 'BondFi AI' : 'BondFi AI Assistant'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMinimize}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex space-x-3',
                    message.isUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!message.isUser && (
                    <div className="w-6 h-6 bg-gradient-to-br from-terracotta to-sage rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                      message.isUser
                        ? 'bg-gradient-to-r from-terracotta to-sage text-white'
                        : 'bg-stone-100 text-stone-800'
                    )}
                  >
                    <ReactMarkdown className="prose prose-sm max-w-none">
                      {message.text}
                    </ReactMarkdown>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {!message.isUser && (
                        <button
                          onClick={() => copyToClipboard(message.text, message.id)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          {copiedId === message.id ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {message.isUser && (
                    <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-stone-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-terracotta to-sage rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-stone-100 rounded-2xl px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-stone-600 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-3 py-2">
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-stone-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about BondFi..."
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-terracotta to-sage text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all text-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Reset Button */}
              <div className="flex justify-center mt-3">
                <button
                  onClick={resetConversation}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Chat</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Drag Handle */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-white/60" />
        </div>
      </div>
    </Draggable>
  );
};

export default AIChatModal;
