import { useState, useEffect } from 'react';
import { FileText, Sparkles, Download, Save, Wand2, Eye, Edit3, Palette, RefreshCw, Check, Lightbulb, AlertTriangle, TrendingUp, Plus, X, Shield } from 'lucide-react';
import * as api from '../services/api';
import type { Task } from './TaskTable';
import type { Settings } from '../App';
import jsPDF from 'jspdf';
import { VerificationBadgeGroup } from './VerificationBadge';
import { CelebrationConfetti, SuccessAnimation } from './CelebrationConfetti';
import { VerificationDetailsModal } from './VerificationDetailsModal';

interface ProposalBuilderProps {
  settings: Settings;
  tasks: Task[];
}

interface ProposalData {
  clientName: string;
  projectTitle: string;
  executiveSummary: string;
  projectDescription: string;
  scope: string;
  methodology: string;
  timeline: string;
  deliverables: string;
  investment: string;
  termsConditions: string;
  // Branding
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  companyName: string;
  contactInfo: string;
}

interface RecommendedTask {
  taskName: string;
  description: string;
  estimatedPCI: number;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
}

interface BudgetRecommendation {
  recommendedBudget: string;
  breakdown: string;
  justification: string;
  alternatives: string[];
}

export function ProposalBuilder({ settings, tasks }: ProposalBuilderProps) {
  const [step, setStep] = useState<'setup' | 'generate' | 'expand' | 'edit' | 'preview'>('setup');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandingTasks, setExpandingTasks] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    clientName: '',
    projectTitle: '',
    executiveSummary: '',
    projectDescription: '',
    scope: '',
    methodology: '',
    timeline: '',
    deliverables: '',
    investment: '',
    termsConditions: '',
    logoUrl: settings?.logoUrl || '',
    primaryColor: settings?.primaryColor || '#2BBBEF',
    accentColor: settings?.accentColor || '#010029',
    companyName: settings?.companyName || 'Plataforma Technologies',
    contactInfo: '',
  });
  const [editSection, setEditSection] = useState<string | null>(null);
  const [recommendedTasks, setRecommendedTasks] = useState<RecommendedTask[]>([]);
  const [budgetRecommendation, setBudgetRecommendation] = useState<BudgetRecommendation | null>(null);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  // Celebration and verification state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Setup form state
  const [setupForm, setSetupForm] = useState({
    clientName: '',
    projectTitle: '',
    projectType: '',
    industryContext: '',
    keyObjectives: '',
    timeline: '',
    budget: '',
  });

  // Logo upload state
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [clientLogo, setClientLogo] = useState<string | null>(null);

  // Handle company logo upload
  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle client logo upload
  const handleClientLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to calculate PCI
  const calculatePCI = (task: Task): number => {
    return (task.ISR * task.CF * task.UXI) + 
           (task.RCF * task.AEP - task.L) + 
           (task.MLW * task.CGW * task.RF) + 
           (task.S * task.GLRI);
  };

  // Get all tasks ranked by PCI (no limit)
  const getAllTasksRanked = (allTasks: Task[]): Task[] => {
    return [...allTasks]
      .sort((a, b) => calculatePCI(b) - calculatePCI(a));
  };

  const handleGenerateProposal = async () => {
    setLoading(true);
    try {
      // Get all tasks ranked by PCI
      const rankedTasks = getAllTasksRanked(tasks);
      
      // Calculate total PCI and costs from ALL tasks
      const totalPCI = tasks.reduce((sum, task) => {
        const pci = calculatePCI(task);
        return sum + pci;
      }, 0);

      const totalCost = totalPCI * settings.hourlyRate;
      const totalHours = totalPCI * 1.5; // Assuming 1 unit = 1.5 hours

      // Generate proposal using AI with top tasks
      const generated = await api.generateProposal({
        clientName: setupForm.clientName,
        projectTitle: setupForm.projectTitle,
        projectType: setupForm.projectType,
        industryContext: setupForm.industryContext,
        keyObjectives: setupForm.keyObjectives,
        timeline: setupForm.timeline,
        budget: setupForm.budget,
        tasks: rankedTasks, // Pass all ranked tasks
        totalPCI,
        totalCost,
        totalHours,
        companyName: settings?.companyName || 'Plataforma Technologies',
      });

      setProposalData({
        ...proposalData,
        clientName: setupForm.clientName,
        projectTitle: setupForm.projectTitle,
        executiveSummary: generated.executiveSummary,
        projectDescription: generated.projectDescription,
        scope: generated.scope,
        methodology: generated.methodology,
        timeline: generated.timeline,
        deliverables: generated.deliverables,
        investment: generated.investment,
        termsConditions: generated.termsConditions,
      });

      // Check budget and trigger recommendations
      if (setupForm.budget) {
        const budgetNum = parseBudgetRange(setupForm.budget);
        if (budgetNum && totalCost > budgetNum) {
          setShowBudgetWarning(true);
          await handleGetBudgetRecommendations(totalCost, budgetNum);
        }
      }

      setStep('expand');
    } catch (error) {
      console.error('Failed to generate proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandTasks = async () => {
    setExpandingTasks(true);
    try {
      const recommendations = await api.getTaskRecommendations({
        projectTitle: setupForm.projectTitle,
        projectType: setupForm.projectType,
        industryContext: setupForm.industryContext,
        keyObjectives: setupForm.keyObjectives,
        existingTasks: tasks,
        timeline: setupForm.timeline,
      });
      
      setRecommendedTasks(recommendations);
    } catch (error) {
      console.error('Failed to get task recommendations:', error);
      alert('Failed to get task recommendations. Please try again.');
    } finally {
      setExpandingTasks(false);
    }
  };

  const handleGetBudgetRecommendations = async (totalCost: number, budget: number) => {
    try {
      const recommendation = await api.getBudgetRecommendations({
        projectTitle: setupForm.projectTitle,
        projectType: setupForm.projectType,
        currentCost: totalCost,
        proposedBudget: budget,
        tasks,
      });
      
      setBudgetRecommendation(recommendation);
    } catch (error) {
      console.error('Failed to get budget recommendations:', error);
    }
  };

  const parseBudgetRange = (budgetStr: string): number | null => {
    // Extract numbers from budget string like "$50,000 - $75,000"
    const matches = budgetStr.match(/[\d,]+/g);
    if (!matches || matches.length === 0) return null;
    
    // Take the upper end of the range if there are two numbers
    const numbers = matches.map(m => parseInt(m.replace(/,/g, ''), 10));
    return numbers.length > 1 ? numbers[1] : numbers[0];
  };

  const handleSaveProposal = async () => {
    setSaving(true);
    try {
      await api.saveProposal(proposalData);
      alert('Proposal saved successfully!');
    } catch (error) {
      console.error('Failed to save proposal:', error);
      alert('Failed to save proposal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Get all tasks ranked by PCI for proposal
    const allTasksRanked = getAllTasksRanked(tasks);

    // Helper function to add text with wrapping
    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, contentWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    // Header with branding
    doc.setFillColor(proposalData.accentColor || '#010029');
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Add company logo if exists
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'PNG', margin, 10, 0, 20); // Auto width, 20mm height
      } catch (e) {
        console.log('Could not add company logo to PDF:', e);
      }
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(proposalData.companyName, companyLogo ? margin + 45 : margin, 25);
    
    // Add client logo if exists
    if (clientLogo) {
      try {
        doc.addImage(clientLogo, 'PNG', pageWidth - margin - 30, 10, 0, 20); // Auto width, 20mm height
      } catch (e) {
        console.log('Could not add client logo to PDF:', e);
      }
    }
    
    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    const title = `Proposal: ${proposalData.projectTitle}`;
    doc.text(title, margin, yPosition);
    yPosition += 15;

    // Client name
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Prepared for: ${proposalData.clientName}`, margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    if (proposalData.executiveSummary) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Executive Summary', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.executiveSummary, 11);
    }

    // Project Description
    if (proposalData.projectDescription) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Project Description', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.projectDescription, 11);
    }

    // Scope of Work
    if (proposalData.scope) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Scope of Work', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.scope, 11);
    }

    // Tasks breakdown
    if (allTasksRanked && allTasksRanked.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Project Tasks & Effort Estimation', margin, yPosition);
      yPosition += 6;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Top ${allTasksRanked.length} tasks ranked by PCI complexity`, margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);

      allTasksRanked.forEach((task, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        const pci = calculatePCI(task);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${task.taskName}`, margin, yPosition);
        yPosition += 6;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`   Estimated Effort: ${pci.toFixed(1)} units`, margin, yPosition);
        yPosition += 10;
      });
      yPosition += 5;
    }

    // Methodology
    if (proposalData.methodology) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Methodology', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.methodology, 11);
    }

    // Timeline
    if (proposalData.timeline) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Timeline', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.timeline, 11);
    }

    // Deliverables
    if (proposalData.deliverables) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Deliverables', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.deliverables, 11);
    }

    // Investment
    if (proposalData.investment) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Investment', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.investment, 11);
    }

    // Terms & Conditions
    if (proposalData.termsConditions) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const rgb = hexToRgb(proposalData.primaryColor);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text('Terms & Conditions', margin, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      addWrappedText(proposalData.termsConditions, 10);
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${proposalData.companyName} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const filename = `${proposalData.projectTitle.replace(/[^a-z0-9]/gi, '_')}_Proposal_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 43, g: 187, b: 239 };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#010029]" style={{ fontSize: '28px', fontWeight: 700 }}>
            AI Proposal Builder
          </h2>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Generate professional project proposals with AI-powered content and PCI estimations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#2BBBEF]/10 px-4 py-2 text-[#2BBBEF]" style={{ fontSize: '12px', fontWeight: 600 }}>
            <Sparkles className="mr-1 inline-block h-4 w-4" />
            AI-Powered
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['setup', 'generate', 'expand', 'edit', 'preview'].map((s, idx) => (
          <div key={s} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  step === s
                    ? 'bg-[#2BBBEF] text-white'
                    : idx < ['setup', 'generate', 'expand', 'edit', 'preview'].indexOf(step)
                    ? 'bg-[#4AFFA8] text-[#010029]'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {idx < ['setup', 'generate', 'expand', 'edit', 'preview'].indexOf(step) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>
              <span
                className={`${
                  step === s ? 'text-[#010029]' : 'text-gray-500'
                }`}
                style={{ fontSize: '14px', fontWeight: step === s ? 600 : 400 }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            </div>
            {idx < 4 && <div className="h-px w-12 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {step === 'setup' && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2BBBEF]/10">
              <FileText className="h-6 w-6 text-[#2BBBEF]" />
            </div>
            <div>
              <h3 className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 600 }}>
                Project Setup
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Provide key details about your project
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Client Name *
              </label>
              <input
                type="text"
                value={setupForm.clientName}
                onChange={(e) => setSetupForm({ ...setupForm, clientName: e.target.value })}
                placeholder="Acme Corporation"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Project Title *
              </label>
              <input
                type="text"
                value={setupForm.projectTitle}
                onChange={(e) => setSetupForm({ ...setupForm, projectTitle: e.target.value })}
                placeholder="E-commerce Platform Development"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Project Type
              </label>
              <select
                value={setupForm.projectType}
                onChange={(e) => setSetupForm({ ...setupForm, projectType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              >
                <option value="">Select type...</option>
                <option value="Web Application">Web Application</option>
                <option value="Mobile App">Mobile App</option>
                <option value="API Development">API Development</option>
                <option value="Full Stack">Full Stack Development</option>
                <option value="Design System">Design System</option>
                <option value="Integration">Integration Project</option>
                <option value="Custom">Custom Solution</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Industry Context
              </label>
              <input
                type="text"
                value={setupForm.industryContext}
                onChange={(e) => setSetupForm({ ...setupForm, industryContext: e.target.value })}
                placeholder="E-commerce, Healthcare, FinTech..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Key Objectives
              </label>
              <textarea
                value={setupForm.keyObjectives}
                onChange={(e) => setSetupForm({ ...setupForm, keyObjectives: e.target.value })}
                placeholder="Describe the main goals and objectives of this project..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Estimated Timeline
              </label>
              <input
                type="text"
                value={setupForm.timeline}
                onChange={(e) => setSetupForm({ ...setupForm, timeline: e.target.value })}
                placeholder="8-12 weeks"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                Budget Range (Optional)
              </label>
              <input
                type="text"
                value={setupForm.budget}
                onChange={(e) => setSetupForm({ ...setupForm, budget: e.target.value })}
                placeholder="$50,000 - $75,000"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                All {tasks.length} task{tasks.length !== 1 ? 's' : ''} (ranked by PCI) will be included in the proposal
              </p>
              <p className="text-gray-500" style={{ fontSize: '12px' }}>
                Total: {tasks.length} tasks • Sorted by complexity
              </p>
            </div>
            <button
              onClick={handleGenerateProposal}
              disabled={!setupForm.clientName || !setupForm.projectTitle || loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wand2 className="h-5 w-5" />
              {loading ? 'Generating...' : 'Generate Proposal with AI'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Expand */}
      {step === 'expand' && (
        <div className="space-y-4">
          {/* Budget Warning */}
          {showBudgetWarning && budgetRecommendation && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-200">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900" style={{ fontSize: '18px', fontWeight: 700 }}>
                    ⚠️ Budget Exceeded Warning
                  </h3>
                  <p className="text-red-700" style={{ fontSize: '14px' }}>
                    Project cost exceeds proposed budget range
                  </p>
                </div>
                <button
                  onClick={() => setShowBudgetWarning(false)}
                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4">
                  <h4 className="mb-2 text-red-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                    AI Budget Recommendation
                  </h4>
                  <p className="mb-3 text-gray-700" style={{ fontSize: '14px' }}>
                    <strong className="text-red-700">Recommended Budget:</strong> {budgetRecommendation.recommendedBudget}
                  </p>
                  <p className="mb-3 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {budgetRecommendation.justification}
                  </p>
                  <div className="mb-3">
                    <p className="mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Budget Breakdown:
                    </p>
                    <p className="text-gray-600" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      {budgetRecommendation.breakdown}
                    </p>
                  </div>
                  {budgetRecommendation.alternatives && budgetRecommendation.alternatives.length > 0 && (
                    <div>
                      <p className="mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                        Alternative Options:
                      </p>
                      <ul className="space-y-1">
                        {budgetRecommendation.alternatives.map((alt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600" style={{ fontSize: '13px' }}>
                            <span className="text-[#2BBBEF]">•</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Task Expansion */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2BBBEF]/10">
                  <Lightbulb className="h-6 w-6 text-[#2BBBEF]" />
                </div>
                <div>
                  <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                    AI Task Expansion
                  </h3>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>
                    Get AI recommendations for additional tasks to ensure complete project delivery
                  </p>
                </div>
              </div>
              <button
                onClick={handleExpandTasks}
                disabled={expandingTasks}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-5 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {expandingTasks ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </button>
            </div>

            {recommendedTasks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                  No recommendations yet
                </p>
                <p className="text-gray-500" style={{ fontSize: '13px' }}>
                  Click "Get AI Recommendations" to analyze your project and receive suggestions for additional tasks based on industry standards, project type, and key objectives.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                            style={{ fontSize: '11px', fontWeight: 600 }}
                          >
                            {task.priority.toUpperCase()} PRIORITY
                          </span>
                          <span className="text-gray-500" style={{ fontSize: '13px' }}>
                            Est. {task.estimatedPCI.toFixed(1)} PCI units
                          </span>
                        </div>
                        <h4 className="mb-2 text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                          {task.taskName}
                        </h4>
                        <p className="mb-2 text-gray-600" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                          {task.description}
                        </p>
                        <div className="rounded-md bg-blue-50 p-3">
                          <p className="text-gray-700" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                            <strong className="text-[#2BBBEF]">Rationale:</strong> {task.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branding Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-[#2BBBEF]" />
                <h3 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Branding & Customization
                </h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={proposalData.companyName}
                  onChange={(e) => setProposalData({ ...proposalData, companyName: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={proposalData.primaryColor}
                    onChange={(e) => setProposalData({ ...proposalData, primaryColor: e.target.value })}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-gray-200"
                  />
                  <input
                    type="text"
                    value={proposalData.primaryColor}
                    onChange={(e) => setProposalData({ ...proposalData, primaryColor: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={proposalData.accentColor}
                    onChange={(e) => setProposalData({ ...proposalData, accentColor: e.target.value })}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-gray-200"
                  />
                  <input
                    type="text"
                    value={proposalData.accentColor}
                    onChange={(e) => setProposalData({ ...proposalData, accentColor: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoUpload}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#2BBBEF]/10 file:px-4 file:py-2 file:text-sm file:text-[#2BBBEF] hover:file:bg-[#2BBBEF]/20"
                />
                {companyLogo && (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                  Client Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleClientLogoUpload}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#2BBBEF]/10 file:px-4 file:py-2 file:text-sm file:text-[#2BBBEF] hover:file:bg-[#2BBBEF]/20"
                />
                {clientLogo && (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <img src={clientLogo} alt="Client Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-gray-700" style={{ fontSize: '13px' }}>
                Contact Information
              </label>
              <textarea
                value={proposalData.contactInfo}
                onChange={(e) => setProposalData({ ...proposalData, contactInfo: e.target.value })}
                placeholder="Email, phone, address..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Content Sections */}
          {[
            { key: 'executiveSummary', label: 'Executive Summary', icon: FileText },
            { key: 'projectDescription', label: 'Project Description', icon: FileText },
            { key: 'scope', label: 'Scope of Work', icon: FileText },
            { key: 'methodology', label: 'Methodology', icon: FileText },
            { key: 'timeline', label: 'Timeline', icon: FileText },
            { key: 'deliverables', label: 'Deliverables', icon: FileText },
            { key: 'investment', label: 'Investment', icon: FileText },
            { key: 'termsConditions', label: 'Terms & Conditions', icon: FileText },
          ].map((section) => {
            const Icon = section.icon;
            const isEditing = editSection === section.key;
            
            return (
              <div key={section.key} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                      {section.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditSection(isEditing ? null : section.key)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#2BBBEF] transition-colors hover:bg-[#2BBBEF]/10"
                  >
                    <Edit3 className="h-4 w-4" />
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={proposalData[section.key as keyof ProposalData] as string}
                    onChange={(e) => setProposalData({ ...proposalData, [section.key]: e.target.value })}
                    rows={8}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                  />
                ) : (
                  <div
                    className="whitespace-pre-wrap text-gray-700"
                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                  >
                    {proposalData[section.key as keyof ProposalData] || 'No content yet...'}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              onClick={() => setStep('setup')}
              className="rounded-lg border border-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to Setup
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProposal}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-[#2BBBEF] px-6 py-3 text-[#2BBBEF] transition-colors hover:bg-[#2BBBEF]/10"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => setStep('preview')}
                className="flex items-center gap-2 rounded-lg bg-[#2BBBEF] px-6 py-3 text-white transition-opacity hover:opacity-90"
              >
                <Eye className="h-5 w-5" />
                Preview & Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (() => {
        const allTasksRanked = getAllTasksRanked(tasks);
        
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Preview Header */}
              <div
                className="rounded-t-xl p-8 text-white"
                style={{ backgroundColor: proposalData.accentColor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {companyLogo && (
                      <img src={companyLogo} alt="Company Logo" className="h-16 w-auto object-contain" />
                    )}
                    <h1 style={{ fontSize: '32px', fontWeight: 700 }}>
                      {proposalData.companyName}
                    </h1>
                  </div>
                  {clientLogo && (
                    <div className="rounded-lg bg-white p-2">
                      <img src={clientLogo} alt="Client Logo" className="h-12 w-auto object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {/* Title */}
                <h2 className="mb-2 text-[#010029]" style={{ fontSize: '24px', fontWeight: 700 }}>
                  Proposal: {proposalData.projectTitle}
                </h2>
                <p className="mb-2 text-gray-700" style={{ fontSize: '16px' }}>
                  Prepared for: {proposalData.clientName}
                </p>
                <p className="mb-4 text-gray-500" style={{ fontSize: '13px' }}>
                  Date: {new Date().toLocaleDateString()}
                </p>

                {/* AI Verification Badges */}
                <div className="mb-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-r from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-6 dark:border-[#2BBBEF]/30 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#010029] dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                          AI-Verified Proposal
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
                          Multi-model verification with latest market data
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-[#2BBBEF] bg-white px-4 py-2 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white dark:bg-[#161A3A] dark:hover:bg-[#2BBBEF]"
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      <Shield className="h-4 w-4" />
                      View Full Verification
                    </button>
                  </div>
                  <VerificationBadgeGroup 
                    badges={['multi-model', 'data-fresh', 'benchmark-verified', 'high-confidence']} 
                  />
                </div>

                {/* Content Sections */}
                {[
                  { title: 'Executive Summary', content: proposalData.executiveSummary },
                  { title: 'Project Description', content: proposalData.projectDescription },
                  { title: 'Scope of Work', content: proposalData.scope },
                  { title: 'Methodology', content: proposalData.methodology },
                  { title: 'Timeline', content: proposalData.timeline },
                  { title: 'Deliverables', content: proposalData.deliverables },
                  { title: 'Investment', content: proposalData.investment },
                  { title: 'Terms & Conditions', content: proposalData.termsConditions },
                ].map((section) => (
                  section.content && (
                    <div key={section.title} className="mb-8">
                      <h3
                        className="mb-3"
                        style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: proposalData.primaryColor,
                        }}
                      >
                        {section.title}
                      </h3>
                      <div
                        className="whitespace-pre-wrap text-gray-700"
                        style={{ fontSize: '14px', lineHeight: '1.7' }}
                      >
                        {section.content}
                      </div>
                    </div>
                  )
                ))}

                {/* Tasks Section */}
                {allTasksRanked && allTasksRanked.length > 0 && (
                  <div className="mb-8">
                    <h3
                      className="mb-2"
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: proposalData.primaryColor,
                      }}
                    >
                      Project Tasks & Effort Estimation
                    </h3>
                    <p className="mb-4 text-gray-500" style={{ fontSize: '13px' }}>
                      Top {allTasksRanked.length} tasks ranked by PCI complexity
                    </p>
                    <div className="space-y-3">
                      {allTasksRanked.map((task, index) => {
                        const pci = calculatePCI(task);
                        
                        return (
                          <div key={task.id} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                  {index + 1}. {task.taskName}
                                </p>
                                <p className="mt-1 text-gray-600" style={{ fontSize: '13px' }}>
                                  Estimated Effort: {pci.toFixed(1)} units
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <button
                onClick={() => setStep('edit')}
                className="rounded-lg border border-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 text-white transition-opacity hover:opacity-90"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
            </div>
          </div>
        );
      })()}

      {/* Celebration Confetti */}
      <CelebrationConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      {/* Success Animation */}
      <SuccessAnimation 
        show={showSuccess} 
        message="Proposal Generated Successfully!" 
        onComplete={() => setShowSuccess(false)} 
      />

      {/* Verification Details Modal */}
      <VerificationDetailsModal 
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        proposalData={{
          title: proposalData.projectTitle,
          totalCost: tasks.reduce((sum, task) => sum + calculatePCI(task) * settings.hourlyRate, 0),
          totalHours: tasks.reduce((sum, task) => sum + calculatePCI(task) * 1.5, 0),
          taskCount: tasks.length,
        }}
      />
    </div>
  );
}