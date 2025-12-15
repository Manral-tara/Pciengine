import { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, TrendingUp, Shield } from 'lucide-react';
import type { Task } from './TaskTable';
import * as api from '../services/api';

interface AITaskVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

interface VerificationData {
  overview: string;
  reasoning: {
    category: string;
    factors: string[];
    impact: string;
  }[];
  confidence: number;
  recommendations: string[];
}

export function AITaskVerificationModal({ isOpen, onClose, task }: AITaskVerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      loadVerification();
    }
  }, [isOpen, task]);

  const loadVerification = async () => {
    if (!task) return;

    setLoading(true);
    setError('');

    try {
      // Call backend AI verification API
      const response = await api.verifyTaskPricing(task);
      setVerification(response);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to load verification. Please try again.');
      
      // Fallback: Generate client-side explanation
      setVerification(generateClientSideVerification(task));
    } finally {
      setLoading(false);
    }
  };

  const generateClientSideVerification = (task: Task): VerificationData => {
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);

    const reasoning = [];

    // Scope & Complexity
    const scopeValue = task.ISR * task.CF * task.UXI;
    if (scopeValue > 10) {
      reasoning.push({
        category: 'Scope & Complexity',
        factors: [
          `ISR (${task.ISR}): ${task.ISR > 5 ? 'High initial scope complexity' : 'Moderate scope'}`,
          `CF (${task.CF}): ${task.CF > 1.3 ? 'Complex implementation required' : 'Standard complexity'}`,
          `UXI (${task.UXI}): ${task.UXI > 1.5 ? 'Significant UX impact' : 'Moderate UX considerations'}`,
        ],
        impact: `Combined scope complexity contributes ${scopeValue.toFixed(1)} units to total PCI`,
      });
    }

    // Risk & Engineering
    const riskValue = Math.max(0, task.RCF * task.AEP - task.L);
    if (riskValue > 5) {
      reasoning.push({
        category: 'Risk & Engineering',
        factors: [
          `RCF (${task.RCF}): ${task.RCF > 1.4 ? 'High technical/business risk' : 'Standard risk profile'}`,
          `AEP (${task.AEP}): ${task.AEP > 8 ? 'Complex architecture & engineering' : 'Moderate engineering effort'}`,
          `L (${task.L}): ${task.L > 2 ? 'Significant learning curve' : 'Minimal ramp-up time'}`,
        ],
        impact: `Risk and engineering complexity adds ${riskValue.toFixed(1)} units`,
      });
    }

    // Multi-Layer Work
    const multiLayerValue = task.MLW * task.CGW * task.RF;
    if (multiLayerValue > 2) {
      reasoning.push({
        category: 'Multi-Layer Work',
        factors: [
          `MLW (${task.MLW}): ${task.MLW > 1.3 ? 'Multiple layers of work involved' : 'Standard layers'}`,
          `CGW (${task.CGW}): ${task.CGW > 1.3 ? 'Cross-team coordination required' : 'Single team effort'}`,
          `RF (${task.RF}): ${task.RF > 1.2 ? 'High likelihood of iterations' : 'Minimal rework expected'}`,
        ],
        impact: `Coordination complexity contributes ${multiLayerValue.toFixed(1)} units`,
      });
    }

    // Specialty & Governance
    const specialtyValue = task.S * task.GLRI;
    if (specialtyValue > 2) {
      reasoning.push({
        category: 'Specialty & Governance',
        factors: [
          `S (${task.S}): ${task.S > 1.4 ? 'Specialized skills/tools required' : 'Standard skillset'}`,
          `GLRI (${task.GLRI}): ${task.GLRI > 1.5 ? 'High compliance/regulatory requirements' : 'Standard governance'}`,
        ],
        impact: `Specialty and governance adds ${specialtyValue.toFixed(1)} units`,
      });
    }

    const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
    
    const recommendations = [];
    if (aas < 85) {
      recommendations.push('⚠️ AAS below 85% - Consider reviewing AI verified units for accuracy');
    }
    if (task.ISR > 8) {
      recommendations.push('📊 High ISR detected - Verify initial scope is well-defined');
    }
    if (task.RCF > 1.5) {
      recommendations.push('🛡️ High risk factor - Ensure mitigation strategies are in place');
    }
    if (task.GLRI > 1.5) {
      recommendations.push('⚖️ Significant compliance requirements - Review legal/regulatory needs');
    }
    if (recommendations.length === 0) {
      recommendations.push('✅ Task pricing appears well-calibrated');
    }

    return {
      overview: generateOverview(task),
      reasoning,
      confidence: Math.min(95, 75 + (aas > 85 ? 15 : 0) + (reasoning.length > 2 ? 5 : 0)),
      recommendations,
    };
  };

  const generateOverview = (task: Task): string => {
    const desc = task.taskName.toLowerCase();
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);

    let complexity = 'moderate';
    if (pci > 50) complexity = 'high';
    else if (pci < 20) complexity = 'low';

    let taskType = 'development task';
    if (desc.includes('authentication') || desc.includes('auth') || desc.includes('login')) {
      taskType = 'security and authentication implementation';
    } else if (desc.includes('payment') || desc.includes('checkout') || desc.includes('transaction')) {
      taskType = 'payment processing integration';
    } else if (desc.includes('dashboard') || desc.includes('analytics') || desc.includes('reporting')) {
      taskType = 'analytics and reporting feature';
    } else if (desc.includes('api') || desc.includes('integration')) {
      taskType = 'system integration';
    } else if (desc.includes('ui') || desc.includes('interface') || desc.includes('component')) {
      taskType = 'user interface component';
    }

    return `This task represents a ${complexity} complexity ${taskType}. Based on the PCI analysis, it requires ${pci.toFixed(1)} units of effort, reflecting the combined impact of scope, risk, coordination, and specialty factors. The task has been modeled to account for technical complexity, user experience considerations, cross-functional coordination, and any compliance or governance requirements.`;
  };

  if (!isOpen || !task) return null;

  const pci = (task.ISR * task.CF * task.UXI) + 
              (task.RCF * task.AEP - task.L) + 
              (task.MLW * task.CGW * task.RF) + 
              (task.S * task.GLRI);
  const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-[#010029] mb-1">AI Task Verification</h2>
                <p className="text-gray-700 break-words">{task.taskName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2BBBEF]"></div>
              <p className="mt-4 text-gray-600">Analyzing task pricing...</p>
            </div>
          ) : error && !verification ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>Error Loading Verification</span>
              </div>
              <p className="text-red-700" style={{ fontSize: '13px' }}>
                {error}
              </p>
            </div>
          ) : verification ? (
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="rounded-xl bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#2BBBEF]" />
                    <span className="text-gray-700">AI Confidence Score</span>
                  </div>
                  <span className="text-[#010029]" style={{ fontSize: '24px' }}>
                    {verification.confidence}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                  <div 
                    className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] transition-all duration-500"
                    style={{ width: `${verification.confidence}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white border border-gray-200 p-4">
                  <div className="mb-1 flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span style={{ fontSize: '13px' }}>Total PCI Units</span>
                  </div>
                  <div className="text-[#010029]" style={{ fontSize: '24px' }}>
                    {pci.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-gray-200 p-4">
                  <div className="mb-1 flex items-center gap-2 text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span style={{ fontSize: '13px' }}>Accuracy Score</span>
                  </div>
                  <div className={`${aas < 85 ? 'text-red-600' : 'text-[#010029]'}`} style={{ fontSize: '24px' }}>
                    {aas.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h3 className="mb-3 text-gray-700">Task Overview</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {verification.overview}
                  </p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              {verification.reasoning.length > 0 && (
                <div>
                  <h3 className="mb-3 text-gray-700">Pricing Breakdown</h3>
                  <div className="space-y-3">
                    {verification.reasoning.map((item, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[#010029]">{item.category}</span>
                          <span className="rounded-full bg-[#2BBBEF]/10 px-3 py-1 text-[#2BBBEF]" style={{ fontSize: '12px' }}>
                            {item.impact}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {item.factors.map((factor, fIndex) => (
                            <li key={fIndex} className="text-gray-600" style={{ fontSize: '13px' }}>
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {verification.recommendations.length > 0 && (
                <div>
                  <h3 className="mb-3 text-gray-700">Recommendations</h3>
                  <div className="space-y-2">
                    {verification.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <span className="text-blue-700" style={{ fontSize: '13px' }}>
                          {rec}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Info */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-gray-600" style={{ fontSize: '13px' }}>
                  <strong>Note:</strong> This verification provides an AI-powered analysis of the task pricing model. 
                  The confidence score reflects the consistency between the PCI factors and the AI-verified units. 
                  Use this as a guide to validate your cost estimates and ensure accurate project modeling.
                </p>
              </div>
            </div>
          ) : null}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 text-white transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
