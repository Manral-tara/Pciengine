import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { chatWithAI } from '../services/api';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface AIAssistantProps {
  tasks: Task[];
  settings: Settings;
  onTaskSuggestion?: (taskId: string, updates: Partial<Task>) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant({ tasks, settings, onTaskSuggestion }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI audit intelligence assistant. I can help you optimize PCI formulas, detect anomalies, suggest task factors, and answer questions about your cost modeling. How can I help?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI response generator
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Analyze specific tasks
    if (lowerMessage.includes('analyze') || lowerMessage.includes('review')) {
      const lowAasTasks = tasks.filter(task => {
        const pci = calculatePCI(task);
        const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
        return aas < 85 && aas > 0;
      });

      if (lowAasTasks.length > 0) {
        return `I've analyzed your tasks and found ${lowAasTasks.length} task(s) with AAS below 85%:\n\n${lowAasTasks.map(t => `• ${t.taskName}: AAS ${((t.aiVerifiedUnits / calculatePCI(t)) * 100).toFixed(1)}%`).join('\n')}\n\nRecommendation: Consider increasing the AI Verified Units for these tasks or reviewing if the complexity factors accurately reflect the work scope.`;
      }
      return 'All tasks currently have healthy AAS scores above 85%. Your cost modeling is well-calibrated!';
    }

    // Cost optimization
    if (lowerMessage.includes('cost') || lowerMessage.includes('reduce') || lowerMessage.includes('optimize')) {
      const totalCost = tasks.reduce((sum, task) => {
        const pci = calculatePCI(task);
        const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
        const verifiedUnits = (aas / 100) * pci;
        return sum + (verifiedUnits * settings.hourlyRate);
      }, 0);

      return `Current verified cost: $${totalCost.toFixed(2)}\n\nOptimization suggestions:\n• Review tasks with high Rework Factor (RF) - reducing RF by 0.1 can save significant units\n• Consider if Learning Curve (L) values are accurate - overestimated L increases costs\n• Look for tasks where Complexity Factor (CF) might be overstated\n• Validate that Specialty Factor (S) is only applied when truly necessary`;
    }

    // Anomaly detection
    if (lowerMessage.includes('anomaly') || lowerMessage.includes('outlier') || lowerMessage.includes('unusual')) {
      const avgPCI = tasks.reduce((sum, task) => sum + calculatePCI(task), 0) / tasks.length;
      const outliers = tasks.filter(task => {
        const pci = calculatePCI(task);
        return pci > avgPCI * 2 || pci < avgPCI * 0.3;
      });

      if (outliers.length > 0) {
        return `Found ${outliers.length} potential anomalies:\n\n${outliers.map(t => {
          const pci = calculatePCI(t);
          const deviation = pci > avgPCI ? 'significantly above' : 'significantly below';
          return `• ${t.taskName}: ${pci.toFixed(2)} units (${deviation} average of ${avgPCI.toFixed(2)})`;
        }).join('\n')}\n\nThese tasks may need review to ensure factors are correctly estimated.`;
      }
      return 'No significant anomalies detected. All tasks fall within expected ranges based on your project portfolio.';
    }

    // Task suggestions
    if (lowerMessage.includes('suggest') || lowerMessage.includes('help with') || lowerMessage.includes('how')) {
      return 'I can help you with:\n\n• **Factor Estimation**: Use the AI auto-fill button (✨) on any task row to get suggested values\n• **Natural Language Entry**: Click "AI Task Creator" to describe tasks in plain language\n• **AAS Optimization**: I can suggest adjustments to improve Accuracy Audit Scores\n• **Cost Analysis**: Ask me to analyze cost patterns across your tasks\n• **Anomaly Detection**: Request anomaly checks to find unusual patterns\n\nWhat would you like to explore?';
    }

    // Industry benchmarks
    if (lowerMessage.includes('benchmark') || lowerMessage.includes('industry') || lowerMessage.includes('standard')) {
      return `Based on industry standards for ${settings.industryPreset} projects:\n\n• Average CF (Complexity Factor): 1.2-1.5\n• Typical UXI (UX Impact): 1.3-1.8 for user-facing features\n• Standard RCF (Risk Factor): 1.1-1.4 for established technologies\n• AAS Target: 85-95% for production-ready estimates\n• Rework Factor (RF): 1.1-1.3 (higher indicates more iteration)\n\nYour tasks should align with these ranges unless there are specific justifications.`;
    }

    // Default response
    return 'I can help you with cost analysis, anomaly detection, factor suggestions, and optimization recommendations. Try asking me to:\n\n• "Analyze my tasks"\n• "Find anomalies"\n• "Suggest cost optimizations"\n• "Show me industry benchmarks"\n\nWhat would you like to know?';
  };

  const calculatePCI = (task: Task): number => {
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Call backend AI chat API
      const response = await chatWithAI(userInput, tasks);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: TrendingUp, label: 'Analyze Tasks', query: 'Analyze my tasks and show me any issues' },
    { icon: AlertCircle, label: 'Find Anomalies', query: 'Find any anomalies or outliers in my tasks' },
    { icon: Lightbulb, label: 'Optimize Costs', query: 'How can I optimize costs across my project?' },
  ];

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#010029] to-[#2BBBEF] px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <div>AI Audit Intelligence</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Your PCI optimization assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{ fontSize: '14px', lineHeight: '1.5' }}
                >
                  {message.content.split('\n').map((line, i) => (
                    <div key={i}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="mb-2 text-gray-500" style={{ fontSize: '12px' }}>Quick Actions:</div>
              <div className="flex flex-col gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(action.query);
                        handleSend();
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-[#2BBBEF] hover:bg-gray-50"
                    >
                      <Icon className="h-4 w-4 text-[#2BBBEF]" />
                      <span style={{ fontSize: '13px' }}>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your cost modeling..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-800 focus:border-[#2BBBEF] focus:outline-none"
                style={{ fontSize: '14px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}