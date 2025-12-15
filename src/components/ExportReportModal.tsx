import { useState } from 'react';
import { X, Download, FileText, Table, CheckSquare, Calendar, User, Building2, DollarSign } from 'lucide-react';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  settings: Settings;
}

export function ExportReportModal({ isOpen, onClose, tasks, settings }: ExportReportModalProps) {
  const [reportName, setReportName] = useState(`PCI_Report_${new Date().toISOString().split('T')[0]}`);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [includeMetrics, setIncludeMetrics] = useState({
    taskName: true,
    pciUnits: true,
    hourConversion: true,
    costs: true,
    verification: true,
    confidence: true,
    accuracy: true,
    allFactors: false,
    auditStatus: true,
    timestamp: true,
  });
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [colorScheme, setColorScheme] = useState<'brand' | 'professional' | 'minimal'>('brand');
  const [isExporting, setIsExporting] = useState(false);

  const calculatePCI = (task: Task): number => {
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const calculateHours = (task: Task): number => {
    return calculatePCI(task) * (settings.unitToHourRatio || 1);
  };

  const calculateCost = (task: Task): number => {
    return calculateHours(task) * (settings.hourlyRate || 0);
  };

  const calculateAAS = (task: Task): number => {
    const pci = calculatePCI(task);
    if (pci === 0) return 0;
    return (task.aiVerifiedUnits / pci) * 100;
  };

  const calculateVerifiedUnits = (task: Task): number => {
    const pci = calculatePCI(task);
    const aas = calculateAAS(task);
    if (pci === 0) return 0;
    return (aas / 100) * pci;
  };

  const calculateVerifiedCost = (task: Task): number => {
    return calculateVerifiedUnits(task) * (settings.unitToHourRatio || 1) * (settings.hourlyRate || 0);
  };

  const calculateConfidence = (task: Task): number => {
    const aas = calculateAAS(task);
    const pci = calculatePCI(task);
    let confidence = 75;
    if (aas > 85) confidence += 15;
    if (pci > 10 && pci < 100) confidence += 5;
    if (task.taskName.length > 10) confidence += 5;
    return Math.min(95, confidence);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === 'pdf') {
        await exportToPDF();
      } else {
        await exportToExcel();
      }
      
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    // Dynamic import to avoid bundling jspdf unless needed
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Color scheme
    const colors = {
      brand: { primary: [43, 187, 239], secondary: [74, 255, 168], dark: [1, 0, 41] },
      professional: { primary: [41, 98, 255], secondary: [100, 100, 100], dark: [33, 33, 33] },
      minimal: { primary: [0, 0, 0], secondary: [150, 150, 150], dark: [0, 0, 0] },
    };
    const scheme = colors[colorScheme];

    // Header
    doc.setFillColor(...scheme.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PCI Engine Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(reportName, pageWidth / 2, 30, { align: 'center' });

    yPosition = 50;

    // Project Information
    if (projectName || clientName || preparedBy) {
      doc.setTextColor(...scheme.dark);
      doc.setFontSize(14);
      doc.text('Project Information', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      if (projectName) {
        doc.text(`Project: ${projectName}`, 14, yPosition);
        yPosition += 6;
      }
      if (clientName) {
        doc.text(`Client: ${clientName}`, 14, yPosition);
        yPosition += 6;
      }
      if (preparedBy) {
        doc.text(`Prepared By: ${preparedBy}`, 14, yPosition);
        yPosition += 6;
      }
      if (includeMetrics.timestamp) {
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Summary Section
    if (includeSummary) {
      const totalPCI = tasks.reduce((sum, task) => sum + calculatePCI(task), 0);
      const totalHours = tasks.reduce((sum, task) => sum + calculateHours(task), 0);
      const totalCost = tasks.reduce((sum, task) => sum + calculateCost(task), 0);
      const avgAAS = tasks.length > 0 
        ? tasks.reduce((sum, task) => sum + calculateAAS(task), 0) / tasks.length 
        : 0;

      doc.setFontSize(14);
      doc.setTextColor(...scheme.dark);
      doc.text('Executive Summary', 14, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Total Tasks', tasks.length.toString()],
        ['Total PCI Units', totalPCI.toFixed(2)],
        ['Total Hours', totalHours.toFixed(2)],
        [`Total Cost (${settings.currency})`, `$${totalCost.toFixed(2)}`],
        ['Average AAS', `${avgAAS.toFixed(1)}%`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: scheme.primary, textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Task Table
    doc.setFontSize(14);
    doc.setTextColor(...scheme.dark);
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text('Task Breakdown', 14, yPosition);
    yPosition += 10;

    const headers: string[] = [];
    if (includeMetrics.taskName) headers.push('Task Name');
    if (includeMetrics.pciUnits) headers.push('PCI Units');
    if (includeMetrics.hourConversion) headers.push('Hours');
    if (includeMetrics.costs) headers.push(`Cost (${settings.currency})`);
    if (includeMetrics.verification) headers.push('AI Verified Units');
    if (includeMetrics.accuracy) headers.push('AAS %');
    if (includeMetrics.confidence) headers.push('Confidence %');
    if (includeMetrics.auditStatus) headers.push('Audit Status');
    if (includeMetrics.allFactors) {
      headers.push('ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI');
    }

    const tableData = tasks.map(task => {
      const row: any[] = [];
      if (includeMetrics.taskName) row.push(task.taskName);
      if (includeMetrics.pciUnits) row.push(calculatePCI(task).toFixed(2));
      if (includeMetrics.hourConversion) row.push(calculateHours(task).toFixed(2));
      if (includeMetrics.costs) row.push(`$${calculateCost(task).toFixed(2)}`);
      if (includeMetrics.verification) row.push(task.aiVerifiedUnits.toFixed(2));
      if (includeMetrics.accuracy) row.push(`${calculateAAS(task).toFixed(1)}%`);
      if (includeMetrics.confidence) row.push(`${calculateConfidence(task)}%`);
      if (includeMetrics.auditStatus) row.push(task.auditStatus || 'Pending');
      if (includeMetrics.allFactors) {
        row.push(
          task.ISR, task.CF, task.UXI, task.RCF, task.AEP, task.L,
          task.MLW, task.CGW, task.RF, task.S, task.GLRI
        );
      }
      return row;
    });

    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: scheme.primary, textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: includeMetrics.taskName ? { 0: { cellWidth: 40 } } : {},
    });

    // Task Elements Summary Page
    const tasksWithElements = tasks.filter(task => task.taskElements && task.taskElements.length > 0);
    
    if (tasksWithElements.length > 0) {
      doc.addPage();
      yPosition = 20;

      // Page Title
      doc.setFillColor(...scheme.primary);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Task Elements Summary', 14, 22);
      
      yPosition = 45;

      // Loop through each task with elements
      tasksWithElements.forEach((task, taskIndex) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Task Header
        doc.setFontSize(12);
        doc.setTextColor(...scheme.dark);
        doc.setFont(undefined, 'bold');
        const refNum = task.referenceNumber || `TASK-${String(taskIndex + 1).padStart(3, '0')}`;
        doc.text(`${refNum}: ${task.taskName}`, 14, yPosition);
        yPosition += 7;

        // Task Elements
        task.taskElements?.forEach((element, elemIndex) => {
          // Check if we need a new page for the element
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          // Element Category Badge
          doc.setFontSize(8);
          const categoryColors: Record<string, number[]> = {
            'Development': [43, 187, 239],
            'Design': [74, 255, 168],
            'Testing': [255, 107, 107],
            'Deployment': [255, 165, 0],
          };
          const catColor = categoryColors[element.category] || [150, 150, 150];
          doc.setFillColor(...catColor);
          doc.roundedRect(14, yPosition - 3, 25, 5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(element.category, 15, yPosition);
          
          // Element Title
          doc.setTextColor(...scheme.dark);
          doc.setFont(undefined, 'bold');
          doc.setFontSize(9);
          doc.text(element.title, 42, yPosition);
          yPosition += 5;

          // Element Description
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const descLines = doc.splitTextToSize(element.description, pageWidth - 30);
          doc.text(descLines, 14, yPosition);
          yPosition += descLines.length * 4 + 4;
        });

        yPosition += 5; // Space between tasks
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} • Generated by PCI Engine • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${reportName}.pdf`);
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (includeSummary) {
      const totalPCI = tasks.reduce((sum, task) => sum + calculatePCI(task), 0);
      const totalHours = tasks.reduce((sum, task) => sum + calculateHours(task), 0);
      const totalCost = tasks.reduce((sum, task) => sum + calculateCost(task), 0);
      const avgAAS = tasks.length > 0 
        ? tasks.reduce((sum, task) => sum + calculateAAS(task), 0) / tasks.length 
        : 0;

      const summaryData = [
        ['PCI ENGINE REPORT'],
        [reportName],
        [''],
        ['PROJECT INFORMATION'],
        ['Project Name', projectName || 'N/A'],
        ['Client Name', clientName || 'N/A'],
        ['Prepared By', preparedBy || 'N/A'],
        ['Date', new Date().toLocaleDateString()],
        [''],
        ['EXECUTIVE SUMMARY'],
        ['Total Tasks', tasks.length],
        ['Total PCI Units', totalPCI.toFixed(2)],
        ['Total Hours', totalHours.toFixed(2)],
        [`Total Cost (${settings.currency})`, totalCost.toFixed(2)],
        ['Average AAS', `${avgAAS.toFixed(1)}%`],
        ['Currency', settings.currency],
        ['Hourly Rate', settings.hourlyRate],
        ['Unit to Hour Ratio', settings.unitToHourRatio],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Tasks Sheet
    const headers: string[] = [];
    if (includeMetrics.taskName) headers.push('Task Name');
    if (includeMetrics.pciUnits) headers.push('PCI Units');
    if (includeMetrics.hourConversion) headers.push('Hours');
    if (includeMetrics.costs) headers.push(`Cost (${settings.currency})`);
    if (includeMetrics.verification) headers.push('AI Verified Units');
    if (includeMetrics.accuracy) headers.push('AAS %');
    if (includeMetrics.confidence) headers.push('Confidence %');
    if (includeMetrics.auditStatus) headers.push('Audit Status');
    if (includeMetrics.allFactors) {
      headers.push('ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI');
    }

    const tasksData = [headers];
    tasks.forEach(task => {
      const row: any[] = [];
      if (includeMetrics.taskName) row.push(task.taskName);
      if (includeMetrics.pciUnits) row.push(calculatePCI(task).toFixed(2));
      if (includeMetrics.hourConversion) row.push(calculateHours(task).toFixed(2));
      if (includeMetrics.costs) row.push(calculateCost(task).toFixed(2));
      if (includeMetrics.verification) row.push(task.aiVerifiedUnits.toFixed(2));
      if (includeMetrics.accuracy) row.push(calculateAAS(task).toFixed(1));
      if (includeMetrics.confidence) row.push(calculateConfidence(task));
      if (includeMetrics.auditStatus) row.push(task.auditStatus || 'Pending');
      if (includeMetrics.allFactors) {
        row.push(
          task.ISR, task.CF, task.UXI, task.RCF, task.AEP, task.L,
          task.MLW, task.CGW, task.RF, task.S, task.GLRI
        );
      }
      tasksData.push(row);
    });

    const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

    // Write file
    XLSX.writeFile(workbook, `${reportName}.xlsx`);
  };

  if (!isOpen) return null;

  const selectedCount = Object.values(includeMetrics).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-[#010029]">Export Report</h2>
                <p className="text-gray-500">Customize and download your PCI analysis report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Report Name */}
          <div>
            <label className="mb-2 block text-gray-700">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 focus:border-[#2BBBEF] focus:outline-none"
              placeholder="Enter report name..."
            />
          </div>

          {/* Project Information */}
          <div>
            <h3 className="mb-3 text-gray-700">Project Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-600" style={{ fontSize: '13px' }}>
                  <Building2 className="h-4 w-4" />
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-[#2BBBEF] focus:outline-none"
                  placeholder="Project name..."
                  style={{ fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-600" style={{ fontSize: '13px' }}>
                  <User className="h-4 w-4" />
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-[#2BBBEF] focus:outline-none"
                  placeholder="Client name..."
                  style={{ fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-600" style={{ fontSize: '13px' }}>
                  <User className="h-4 w-4" />
                  Prepared By
                </label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-[#2BBBEF] focus:outline-none"
                  placeholder="Your name..."
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="mb-3 text-gray-700">Export Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                  format === 'pdf'
                    ? 'border-[#2BBBEF] bg-[#2BBBEF]/10 text-[#2BBBEF]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>PDF Document</span>
              </button>
              <button
                onClick={() => setFormat('excel')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                  format === 'excel'
                    ? 'border-[#4AFFA8] bg-[#4AFFA8]/10 text-[#4AFFA8]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Table className="h-5 w-5" />
                <span>Excel Spreadsheet</span>
              </button>
            </div>
          </div>

          {/* Metrics to Include */}
          <div>
            <h3 className="mb-3 text-gray-700">Metrics to Include ({selectedCount} selected)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.taskName}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, taskName: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Task Name</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.pciUnits}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, pciUnits: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>PCI Units</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.hourConversion}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, hourConversion: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Hour Conversion</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.costs}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, costs: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Costs</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.verification}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, verification: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Verification</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.confidence}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, confidence: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Confidence</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.accuracy}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, accuracy: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Accuracy (AAS)</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.auditStatus}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, auditStatus: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Audit Status</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeMetrics.allFactors}
                  onChange={(e) => setIncludeMetrics({ ...includeMetrics, allFactors: e.target.checked })}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>All PCI Factors</span>
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 className="mb-3 text-gray-700">Additional Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded text-[#2BBBEF]"
                />
                <span className="text-gray-700" style={{ fontSize: '13px' }}>Include Executive Summary</span>
              </label>
              {format === 'pdf' && (
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="rounded text-[#2BBBEF]"
                  />
                  <span className="text-gray-700" style={{ fontSize: '13px' }}>Include Charts & Visualizations</span>
                </label>
              )}
            </div>
          </div>

          {/* Color Scheme (PDF only) */}
          {format === 'pdf' && (
            <div>
              <h3 className="mb-3 text-gray-700">Color Scheme</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setColorScheme('brand')}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 transition-all ${
                    colorScheme === 'brand'
                      ? 'border-[#2BBBEF] bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 flex justify-center gap-1">
                    <div className="h-4 w-4 rounded bg-[#2BBBEF]"></div>
                    <div className="h-4 w-4 rounded bg-[#4AFFA8]"></div>
                    <div className="h-4 w-4 rounded bg-[#010029]"></div>
                  </div>
                  <span className="text-gray-700" style={{ fontSize: '13px' }}>Brand Colors</span>
                </button>
                <button
                  onClick={() => setColorScheme('professional')}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 transition-all ${
                    colorScheme === 'professional'
                      ? 'border-[#2962FF] bg-[#2962FF]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 flex justify-center gap-1">
                    <div className="h-4 w-4 rounded bg-[#2962FF]"></div>
                    <div className="h-4 w-4 rounded bg-[#646464]"></div>
                    <div className="h-4 w-4 rounded bg-[#212121]"></div>
                  </div>
                  <span className="text-gray-700" style={{ fontSize: '13px' }}>Professional</span>
                </button>
                <button
                  onClick={() => setColorScheme('minimal')}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 transition-all ${
                    colorScheme === 'minimal'
                      ? 'border-gray-700 bg-gray-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 flex justify-center gap-1">
                    <div className="h-4 w-4 rounded bg-black"></div>
                    <div className="h-4 w-4 rounded bg-gray-400"></div>
                    <div className="h-4 w-4 rounded bg-white border border-gray-300"></div>
                  </div>
                  <span className="text-gray-700" style={{ fontSize: '13px' }}>Minimal</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-800">
              <CheckSquare className="h-4 w-4" />
              <span>Export Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-blue-700" style={{ fontSize: '13px' }}>
              <div>📊 {tasks.length} tasks</div>
              <div>📋 {selectedCount} metrics</div>
              <div>💾 {format.toUpperCase()} format</div>
              <div>🎨 {colorScheme} theme</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="rounded-lg border border-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !reportName.trim() || selectedCount === 0}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}