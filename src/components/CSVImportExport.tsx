import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, ArrowRight, CheckCircle, AlertTriangle, FileText, Layers, Calendar, DollarSign, Info } from 'lucide-react';
import type { Task } from './TaskTable';

interface CSVImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Omit<Task, 'id'>[]) => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  appField: string;
}

const APP_FIELDS = [
  { value: 'phase', label: 'Phase', required: false },
  { value: 'taskName', label: 'Task Name', required: true },
  { value: 'description', label: 'Description', required: false },
  { value: 'subTask', label: 'Sub-Task', required: false },
  { value: 'resources', label: 'Resources/Team Members', required: false },
  { value: 'taskType', label: 'Task Type/Complexity', required: false },
  { value: 'startDate', label: 'Start Date', required: false },
  { value: 'completionDate', label: 'Completion Date', required: false },
  { value: 'estimatedHours', label: 'Estimated Hours', required: false },
  { value: 'actualHours', label: 'Actual Hours', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'notes', label: 'Notes', required: false },
  { value: 'ISR', label: 'ISR (Initial Scope Rating)', required: false },
  { value: 'CF', label: 'CF (Complexity Factor)', required: false },
  { value: 'UXI', label: 'UXI (UX Impact)', required: false },
  { value: 'RCF', label: 'RCF (Resource Consumption)', required: false },
  { value: 'AEP', label: 'AEP (Architectural Effort)', required: false },
  { value: 'L', label: 'L (Learning Curve)', required: false },
  { value: 'MLW', label: 'MLW (Maintenance Load)', required: false },
  { value: 'CGW', label: 'CGW (Code Generation)', required: false },
  { value: 'RF', label: 'RF (Risk Factor)', required: false },
  { value: 'S', label: 'S (Skill Level)', required: false },
  { value: 'GLRI', label: 'GLRI (Global Resource Index)', required: false },
  { value: 'verifiedCost', label: 'Verified Cost (Override)', required: false },
  { value: 'skip', label: '--- Skip Column ---', required: false }
];

// Auto-calculate PCI factors based on task type and estimated hours
function calculatePCIFromTaskType(taskType: string, estimatedHours: number) {
  const normalized = taskType.toLowerCase().trim();
  
  // Base multiplier from estimated hours (complexity indicator)
  const hourMultiplier = estimatedHours > 80 ? 1.3 : estimatedHours > 40 ? 1.15 : estimatedHours > 20 ? 1.0 : 0.85;
  
  // Task type presets
  if (normalized.includes('critical') || normalized.includes('high') || normalized.includes('complex')) {
    return {
      ISR: 3.0 * hourMultiplier,
      CF: 3.5 * hourMultiplier,
      UXI: 2.5 * hourMultiplier,
      RCF: 2.0 * hourMultiplier,
      AEP: 2.5 * hourMultiplier,
      L: 1.5,
      MLW: 2.0 * hourMultiplier,
      CGW: 1.5 * hourMultiplier,
      RF: 1.2,
      S: 1.5,
      GLRI: 1.5,
    };
  } else if (normalized.includes('medium') || normalized.includes('moderate')) {
    return {
      ISR: 2.0 * hourMultiplier,
      CF: 2.5 * hourMultiplier,
      UXI: 2.0 * hourMultiplier,
      RCF: 1.5 * hourMultiplier,
      AEP: 2.0 * hourMultiplier,
      L: 1.0,
      MLW: 1.5 * hourMultiplier,
      CGW: 1.2 * hourMultiplier,
      RF: 1.0,
      S: 1.2,
      GLRI: 1.0,
    };
  } else if (normalized.includes('low') || normalized.includes('simple') || normalized.includes('easy')) {
    return {
      ISR: 1.5 * hourMultiplier,
      CF: 1.8 * hourMultiplier,
      UXI: 1.5 * hourMultiplier,
      RCF: 1.0,
      AEP: 1.5 * hourMultiplier,
      L: 0.5,
      MLW: 1.0,
      CGW: 1.0,
      RF: 1.0,
      S: 1.0,
      GLRI: 1.0,
    };
  }
  
  // Default: Medium complexity
  return {
    ISR: 2.0 * hourMultiplier,
    CF: 2.5 * hourMultiplier,
    UXI: 2.0 * hourMultiplier,
    RCF: 1.5 * hourMultiplier,
    AEP: 2.0 * hourMultiplier,
    L: 1.0,
    MLW: 1.5 * hourMultiplier,
    CGW: 1.2 * hourMultiplier,
    RF: 1.0,
    S: 1.0,
    GLRI: 1.0,
  };
}

export function CSVImportExport({ isOpen, onClose, onImport }: CSVImportExportProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [parsedTasks, setParsedTasks] = useState<Omit<Task, 'id'>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  const handleDownloadTemplate = () => {
    const template = [
      [
        'Phase',
        'Task Name',
        'Description',
        'Sub-Task',
        'Resources/Team Members',
        'Task Type/Complexity',
        'Start Date (YYYY-MM-DD)',
        'Completion Date (YYYY-MM-DD)',
        'Estimated Hours',
        'Actual Hours',
        'Status',
        'Notes',
        'ISR',
        'CF',
        'UXI',
        'RCF',
        'AEP',
        'L',
        'MLW',
        'CGW',
        'RF',
        'S',
        'GLRI',
        'Verified Cost (Override)'
      ],
      [
        'Phase 1: Discovery',
        'User Authentication System',
        'Build complete OAuth 2.0 authentication with social login',
        'Setup OAuth providers',
        'John Doe, Jane Smith',
        'High',
        '2024-01-15',
        '2024-02-15',
        '80',
        '0',
        'not-started',
        'Requires integration with Google and GitHub',
        '2.5',
        '3.0',
        '2.0',
        '1.5',
        '2.0',
        '1',
        '1.5',
        '1.5',
        '1',
        '1',
        '1',
        ''  // Verified Cost - leave blank for auto-calculation
      ],
      [
        'Phase 1: Discovery',
        'User Authentication System',
        'Build complete OAuth 2.0 authentication with social login',
        'Implement JWT token management',
        'John Doe, Jane Smith',
        'High',
        '2024-01-15',
        '2024-02-15',
        '40',
        '0',
        'not-started',
        'Token refresh and revocation',
        '2.5',
        '3.0',
        '2.0',
        '1.5',
        '2.0',
        '1',
        '1.5',
        '1.5',
        '1',
        '1',
        '1',
        ''  // Verified Cost - leave blank for auto-calculation
      ],
      [
        'Phase 2: Development',
        'Payment Gateway Integration',
        'Integrate Stripe payment processing with subscription support',
        '',
        'Alice Johnson, Bob Brown',
        'Medium',
        '2024-02-16',
        '2024-03-15',
        '60',
        '0',
        'not-started',
        'PCI compliance required',
        '3.0',
        '3.5',
        '2.5',
        '2.0',
        '2.5',
        '1.5',
        '2.0',
        '1.5',
        '1',
        '1.5',
        '2.0',
        '15000'  // Example: Manual cost override
      ],
      [
        'Phase 3: Testing',
        'End-to-End Testing Suite',
        'Comprehensive E2E tests covering all user flows',
        '',
        'Charlie White, David Black',
        'Low',
        '2024-03-16',
        '2024-04-01',
        '40',
        '0',
        'not-started',
        'Use Cypress or Playwright',
        '2.0',
        '2.5',
        '1.5',
        '1',
        '1.5',
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        ''  // Verified Cost - leave blank for auto-calculation
      ],
    ];

    const csvContent = template.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'PCI_Engine_Import_Template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse CSV with proper quote handling
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.some(v => v)) { // Only include non-empty rows
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }

    return rows;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        setErrors(['The CSV file is empty or invalid']);
        return;
      }

      const headers = Object.keys(rows[0]);
      setCSVHeaders(headers);
      setCSVData(rows);
      
      // Auto-detect column mappings
      const autoMappings: ColumnMapping[] = [];
      headers.forEach(header => {
        const normalized = header.toLowerCase().trim();
        
        // Try to match common column names
        if (normalized.includes('phase')) {
          autoMappings.push({ csvColumn: header, appField: 'phase' });
        } else if (normalized.includes('task') && normalized.includes('name')) {
          autoMappings.push({ csvColumn: header, appField: 'taskName' });
        } else if (normalized.includes('description') || normalized.includes('desc')) {
          autoMappings.push({ csvColumn: header, appField: 'description' });
        } else if (normalized.includes('sub') && normalized.includes('task')) {
          autoMappings.push({ csvColumn: header, appField: 'subTask' });
        } else if (normalized.includes('resources') || normalized.includes('team')) {
          autoMappings.push({ csvColumn: header, appField: 'resources' });
        } else if (normalized.includes('task') && normalized.includes('type')) {
          autoMappings.push({ csvColumn: header, appField: 'taskType' });
        } else if (normalized.includes('start') && normalized.includes('date')) {
          autoMappings.push({ csvColumn: header, appField: 'startDate' });
        } else if (normalized.includes('completion') || normalized.includes('end') && normalized.includes('date')) {
          autoMappings.push({ csvColumn: header, appField: 'completionDate' });
        } else if (normalized.includes('estimated') && normalized.includes('hour')) {
          autoMappings.push({ csvColumn: header, appField: 'estimatedHours' });
        } else if (normalized.includes('actual') && normalized.includes('hour')) {
          autoMappings.push({ csvColumn: header, appField: 'actualHours' });
        } else if (normalized.includes('status')) {
          autoMappings.push({ csvColumn: header, appField: 'status' });
        } else if (normalized.includes('note')) {
          autoMappings.push({ csvColumn: header, appField: 'notes' });
        } else if (normalized === 'isr') {
          autoMappings.push({ csvColumn: header, appField: 'ISR' });
        } else if (normalized === 'cf') {
          autoMappings.push({ csvColumn: header, appField: 'CF' });
        } else if (normalized === 'uxi') {
          autoMappings.push({ csvColumn: header, appField: 'UXI' });
        } else if (normalized === 'rcf') {
          autoMappings.push({ csvColumn: header, appField: 'RCF' });
        } else if (normalized === 'aep') {
          autoMappings.push({ csvColumn: header, appField: 'AEP' });
        } else if (normalized === 'l') {
          autoMappings.push({ csvColumn: header, appField: 'L' });
        } else if (normalized === 'mlw') {
          autoMappings.push({ csvColumn: header, appField: 'MLW' });
        } else if (normalized === 'cgw') {
          autoMappings.push({ csvColumn: header, appField: 'CGW' });
        } else if (normalized === 'rf') {
          autoMappings.push({ csvColumn: header, appField: 'RF' });
        } else if (normalized === 's') {
          autoMappings.push({ csvColumn: header, appField: 'S' });
        } else if (normalized === 'glri') {
          autoMappings.push({ csvColumn: header, appField: 'GLRI' });
        } else if (normalized === 'verifiedcost') {
          autoMappings.push({ csvColumn: header, appField: 'verifiedCost' });
        }
      });

      setColumnMappings(autoMappings);
      setErrors([]);
      setStep('mapping');
    };

    reader.readAsText(file);
  };

  const handleMappingChange = (csvColumn: string, appField: string) => {
    setColumnMappings(prev => {
      // Remove existing mapping for this CSV column
      const filtered = prev.filter(m => m.csvColumn !== csvColumn);
      
      // Add new mapping if appField is not 'ignore'
      if (appField !== 'ignore') {
        // Also remove any existing mapping to this app field
        const final = filtered.filter(m => m.appField !== appField);
        return [...final, { csvColumn, appField }];
      }
      
      return filtered;
    });
  };

  const parseTasksFromCSV = () => {
    const newErrors: string[] = [];
    const tasks: Omit<Task, 'id'>[] = [];
    const taskGroups = new Map<string, { task: Omit<Task, 'id'>; subTasks: any[] }>();

    // Check required fields
    const hasTaskName = columnMappings.some(m => m.appField === 'taskName');
    if (!hasTaskName) {
      newErrors.push('Task Name column is required. Please map a column to Task Name.');
      setErrors(newErrors);
      return;
    }

    csvData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of header and 0-based index
      
      // Get mapped values
      const getValue = (field: string): string => {
        const mapping = columnMappings.find(m => m.appField === field);
        return mapping ? row[mapping.csvColumn] : '';
      };

      const phase = getValue('phase');
      const taskName = getValue('taskName');
      const description = getValue('description');
      const subTask = getValue('subTask');
      const resources = getValue('resources');
      const taskType = getValue('taskType');
      const startDate = getValue('startDate');
      const completionDate = getValue('completionDate');
      const estimatedHours = getValue('estimatedHours');
      const actualHours = getValue('actualHours');
      const status = getValue('status');
      const notes = getValue('notes');
      const verifiedCostValue = getValue('verifiedCost');

      // Check if PCI factors are provided
      const hasISR = getValue('ISR');
      const hasCF = getValue('CF');
      
      // Determine whether to use provided values or auto-calculate
      const shouldAutoCalculate = (!hasISR || !hasCF) && (taskType || estimatedHours);
      
      let pciFactors;
      if (shouldAutoCalculate) {
        // Auto-calculate PCI factors based on task type and estimated hours
        const hours = parseFloat(estimatedHours) || 40; // Default to 40 hours if not provided
        pciFactors = calculatePCIFromTaskType(taskType || 'Medium', hours);
      } else {
        // Use provided values or defaults
        pciFactors = {
          ISR: parseFloat(getValue('ISR')) || 1,
          CF: parseFloat(getValue('CF')) || 1,
          UXI: parseFloat(getValue('UXI')) || 1,
          RCF: parseFloat(getValue('RCF')) || 1,
          AEP: parseFloat(getValue('AEP')) || 1,
          L: parseFloat(getValue('L')) || 0,
          MLW: parseFloat(getValue('MLW')) || 1,
          CGW: parseFloat(getValue('CGW')) || 1,
          RF: parseFloat(getValue('RF')) || 1,
          S: parseFloat(getValue('S')) || 1,
          GLRI: parseFloat(getValue('GLRI')) || 1,
        };
      }

      if (!taskName.trim()) {
        newErrors.push(`Row ${rowNumber}: Task Name is required`);
        return;
      }

      // Create unique key for grouping
      const taskKey = phase ? `${phase}:::${taskName}` : taskName;

      // Get or create task group
      if (!taskGroups.has(taskKey)) {
        const fullTaskName = phase ? `${phase} - ${taskName}` : taskName;
        
        const baseTask: Omit<Task, 'id'> = {
          taskName: fullTaskName,
          ISR: pciFactors.ISR,
          CF: pciFactors.CF,
          UXI: pciFactors.UXI,
          RCF: pciFactors.RCF,
          AEP: pciFactors.AEP,
          L: pciFactors.L,
          MLW: pciFactors.MLW,
          CGW: pciFactors.CGW,
          RF: pciFactors.RF,
          S: pciFactors.S,
          GLRI: pciFactors.GLRI,
          aiVerifiedUnits: (pciFactors.ISR * pciFactors.CF * pciFactors.UXI) + (pciFactors.RCF * pciFactors.AEP) + (pciFactors.L + pciFactors.MLW + pciFactors.CGW + pciFactors.RF + pciFactors.S) + pciFactors.GLRI,
          startDate: startDate || undefined,
          completionDate: completionDate || undefined,
          actualHours: parseFloat(actualHours) || undefined,
          status: (status as any) || 'not-started',
          taskElements: [],
        };

        // Add verified cost override if provided
        if (verifiedCostValue && !isNaN(parseFloat(verifiedCostValue))) {
          baseTask.verifiedCost = parseFloat(verifiedCostValue);
        }

        // Add description if present
        if (description) {
          baseTask.taskElements = [{
            id: `desc-${Date.now()}-${index}`,
            title: 'Description',
            description: description,
            category: 'description',
          }];
        }

        taskGroups.set(taskKey, { task: baseTask, subTasks: [] });
      }

      // Add sub-task if present
      if (subTask) {
        const group = taskGroups.get(taskKey)!;
        group.subTasks.push({
          id: `subtask-${Date.now()}-${index}`,
          title: subTask,
          description: notes || '',
          category: 'subtask',
          estimatedHours: parseFloat(estimatedHours) || 0,
        });
      }

      // Add notes as additional element if no sub-task
      if (!subTask && notes) {
        const group = taskGroups.get(taskKey)!;
        if (!group.task.taskElements) group.task.taskElements = [];
        group.task.taskElements.push({
          id: `note-${Date.now()}-${index}`,
          title: 'Notes',
          description: notes,
          category: 'note',
        });
      }
    });

    // Finalize tasks with sub-tasks
    taskGroups.forEach(group => {
      if (group.subTasks.length > 0) {
        group.task.taskElements = [
          ...(group.task.taskElements || []),
          ...group.subTasks,
        ];
      }
      tasks.push(group.task);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setParsedTasks(tasks);
    setErrors([]);
    setStep('preview');
  };

  const handleImport = () => {
    onImport(parsedTasks);
    onClose();
    resetState();
  };

  const resetState = () => {
    setStep('upload');
    setCSVData([]);
    setCSVHeaders([]);
    setColumnMappings([]);
    setParsedTasks([]);
    setErrors([]);
    setFileName('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center transition-transform duration-500 ease-out animate-slide-up">
        <div 
          className="w-full max-w-6xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Decorative Top Bar */}
          <div className="flex justify-center border-b border-gray-100 py-3 dark:border-white/5">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-lg">
                    <FileSpreadsheet className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    CSV Import & Template
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '600px' }}>
                    Download a pre-formatted template or upload your own CSV file to bulk import tasks with phases, descriptions, and sub-tasks
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A] dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center gap-4">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'mapping', label: 'Map Columns', icon: Layers },
                { id: 'preview', label: 'Preview', icon: CheckCircle },
              ].map((s, index) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                    step === s.id
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : step === 'mapping' && s.id === 'upload'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : step === 'preview' && (s.id === 'upload' || s.id === 'mapping')
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}>
                    <s.icon className="h-4 w-4" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{s.label}</span>
                  </div>
                  {index < 2 && <ArrowRight className="h-5 w-5 text-gray-300" />}
                </div>
              ))}
            </div>

            {/* Content */}
            {step === 'upload' && (
              <div className="space-y-6">
                {/* Download Template */}
                <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6 dark:border-green-900/30 dark:from-green-950/20 dark:to-blue-950/20">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                        Step 1: Download Template
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                        Get our pre-formatted CSV template with example data and all required columns
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-green-600 to-blue-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    <Download className="h-5 w-5" />
                    Download CSV Template
                  </button>
                </div>

                {/* Template Info */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h4 className="mb-2 text-blue-900 dark:text-blue-100" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Template Includes:
                      </h4>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-200" style={{ fontSize: '13px' }}>
                        <li>• Phase grouping for organizing tasks</li>
                        <li>• Task names, descriptions, and notes</li>
                        <li>• <strong>Resources/Team Members</strong> - Assign team members to tasks</li>
                        <li>• <strong>Task Type/Complexity</strong> - Auto-calculate PCI from type (Low/Medium/High)</li>
                        <li>• Sub-task support for detailed breakdowns</li>
                        <li>• Start and completion dates</li>
                        <li>• Estimated and actual hours tracking</li>
                        <li>• All 11 PCI factors (ISR, CF, UXI, RCF, AEP, L, MLW, CGW, RF, S, GLRI)</li>
                        <li>• <strong>Verified Cost (Override)</strong> - Optional column to manually set fixed costs</li>
                        <li>• Status field (not-started, in-progress, completed, on-hold)</li>
                        <li>• <strong>Smart Auto-Calculation:</strong> Leave PCI columns empty and the system will calculate based on Task Type + Estimated Hours!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/20">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
                    <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Step 2: Upload Your CSV
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                    Upload your filled CSV file or any CSV with project data
                  </p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-br from-green-600 to-blue-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl">
                    <Upload className="h-5 w-5" />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Choose CSV File</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{fileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'mapping' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#161A3A]">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h4 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Column Mapping
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                        Map your CSV columns to the application fields. We've auto-detected some mappings for you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {csvHeaders.map(header => {
                    const currentMapping = columnMappings.find(m => m.csvColumn === header);
                    return (
                      <div key={header} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                        <div className="flex-1">
                          <div className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
                            CSV Column
                          </div>
                          <div className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                            {header}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <select
                            value={currentMapping?.appField || 'ignore'}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                            style={{ fontSize: '14px' }}
                          >
                            <option value="ignore">Ignore this column</option>
                            {APP_FIELDS.map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label} {field.required && '*'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {errors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <div className="flex-1">
                        <h4 className="mb-2 text-red-900 dark:text-red-100" style={{ fontSize: '14px', fontWeight: 600 }}>
                          Mapping Errors
                        </h4>
                        <ul className="space-y-1 text-red-800 dark:text-red-200" style={{ fontSize: '13px' }}>
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep('upload')}
                    className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Back
                  </button>
                  <button
                    onClick={parseTasksFromCSV}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Continue to Preview
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="mb-1 text-green-900 dark:text-green-100" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Ready to Import
                      </h4>
                      <p className="text-green-800 dark:text-green-200" style={{ fontSize: '13px' }}>
                        Found {parsedTasks.length} task{parsedTasks.length !== 1 ? 's' : ''} ready to import. Review below and confirm to add them to your project.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {parsedTasks.map((task, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                          {task.taskName}
                        </h4>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-300" style={{ fontSize: '11px', fontWeight: 600 }}>
                          PCI: {task.aiVerifiedUnits.toFixed(1)}
                        </span>
                      </div>
                      {task.taskElements && task.taskElements.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {task.taskElements.map((element, idx) => (
                            <div key={idx} className="rounded bg-gray-50 p-2 dark:bg-[#0C0F2C]">
                              <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
                                {element.category === 'subtask' ? '↳ Sub-task' : element.category === 'description' ? '📝 Description' : '📌 Note'}
                              </div>
                              <div className="text-gray-900 dark:text-white" style={{ fontSize: '13px' }}>
                                {element.title || element.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                        {task.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.startDate}
                          </div>
                        )}
                        {task.status && (
                          <div className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {task.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep('mapping')}
                    className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Import {parsedTasks.length} Task{parsedTasks.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  );
}