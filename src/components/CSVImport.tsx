import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, CheckCircle2, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import type { Task } from './TaskTable';

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Partial<Task>[]) => void;
}

interface ColumnMapping {
  csvColumn: string;
  taskField: keyof Task | 'skip';
}

const TASK_FIELDS = [
  { value: 'taskName', label: 'Task Name' },
  { value: 'description', label: 'Description' },
  { value: 'estimatedHours', label: 'Estimated Hours' },
  { value: 'roleType', label: 'Role Type' },
  { value: 'costRate', label: 'Cost Rate' },
  { value: 'complexityScore', label: 'Complexity Score' },
  { value: 'riskLevel', label: 'Risk Level' },
  { value: 'ISR', label: 'ISR (Implementation Scope Rating)' },
  { value: 'CF', label: 'CF (Complexity Factor)' },
  { value: 'UXI', label: 'UXI (User Experience Impact)' },
  { value: 'RCF', label: 'RCF (Resource Consumption Factor)' },
  { value: 'AEP', label: 'AEP (Architectural Effort Points)' },
  { value: 'L', label: 'L (Learning Curve)' },
  { value: 'MLW', label: 'MLW (Maintenance Workload)' },
  { value: 'CGW', label: 'CGW (Code Generation Weight)' },
  { value: 'RF', label: 'RF (Risk Factor)' },
  { value: 'S', label: 'S (Skill Level)' },
  { value: 'GLRI', label: 'GLRI (Global Resource Index)' },
  { value: 'verifiedCost', label: 'Verified Cost (Calculated Metrics Override)' },
  { value: 'skip', label: '--- Skip Column ---' },
] as const;

export function CSVImport({ isOpen, onClose, onImport }: CSVImportProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewTasks, setPreviewTasks] = useState<Partial<Task>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      setErrors(['CSV file is empty']);
      return;
    }

    // Parse CSV (simple implementation - handles quoted fields)
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
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

    const parsedLines = lines.map(parseLine);
    const headerRow = parsedLines[0];
    const dataRows = parsedLines.slice(1);

    setHeaders(headerRow);
    setCsvData(dataRows);

    // Auto-detect column mappings
    const autoMappings: ColumnMapping[] = headerRow.map(header => {
      const headerLower = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Try to match common column names
      const fieldMatch = TASK_FIELDS.find(field => {
        if (field.value === 'skip') return false;
        const fieldLower = field.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        return headerLower.includes(fieldLower) || fieldLower.includes(headerLower);
      });

      return {
        csvColumn: header,
        taskField: fieldMatch?.value || 'skip'
      };
    });

    setMappings(autoMappings);
    setStep('map');
    setErrors([]);
  };

  const handleMappingChange = (index: number, field: keyof Task | 'skip') => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], taskField: field };
    setMappings(newMappings);
  };

  const generatePreview = () => {
    const newErrors: string[] = [];
    const tasks: Partial<Task>[] = [];

    // Check if we have at least taskName mapped
    const hasTaskName = mappings.some(m => m.taskField === 'taskName');
    if (!hasTaskName) {
      newErrors.push('At least "Task Name" column must be mapped');
      setErrors(newErrors);
      return;
    }

    csvData.forEach((row, rowIndex) => {
      const task: any = {
        id: `imported-${Date.now()}-${rowIndex}`,
        // Default values
        ISR: 1,
        CF: 1,
        UXI: 1,
        RCF: 1,
        AEP: 1,
        L: 1,
        MLW: 1,
        CGW: 1,
        RF: 1,
        S: 1,
        GLRI: 1,
      };

      mappings.forEach((mapping, colIndex) => {
        if (mapping.taskField === 'skip') return;
        
        const value = row[colIndex]?.trim();
        if (!value) return;

        const field = mapping.taskField;

        // Parse numeric fields
        if (['ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI', 'estimatedHours', 'costRate', 'complexityScore', 'verifiedCost'].includes(field)) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            newErrors.push(`Row ${rowIndex + 1}: "${value}" is not a valid number for ${field}`);
          } else {
            task[field] = num;
          }
        } else {
          task[field] = value;
        }
      });

      // Validate required fields
      if (!task.taskName) {
        newErrors.push(`Row ${rowIndex + 1}: Task name is required`);
      }

      tasks.push(task);
    });

    setErrors(newErrors);
    setPreviewTasks(tasks);
    setStep('preview');
  };

  const handleImport = () => {
    if (errors.length > 0) return;
    onImport(previewTasks);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setCsvData([]);
    setHeaders([]);
    setMappings([]);
    setPreviewTasks([]);
    setErrors([]);
    onClose();
  };

  const downloadTemplate = () => {
    const templateHeaders = [
      'Task Name',
      'Description',
      'Estimated Hours',
      'Role Type',
      'Cost Rate',
      'Complexity Score',
      'Risk Level',
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
      'Verified Cost'
    ];

    const templateRow = [
      'User Authentication',
      'Implement user login and registration',
      '40',
      'Full Stack Developer',
      '150',
      '7',
      'Medium',
      '8',
      '7',
      '9',
      '6',
      '8',
      '4',
      '5',
      '6',
      '5',
      '8',
      '7',
      '' // Leave Verified Cost blank - optional override field
    ];

    const csv = [templateHeaders.join(','), templateRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pci_tasks_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-6 py-4 dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Import Tasks from CSV
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step === 'upload' && 'Upload your CSV file'}
                        {step === 'map' && 'Map CSV columns to task fields'}
                        {step === 'preview' && 'Preview and confirm import'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#0C0F2C] dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="mt-4 flex items-center gap-2">
                  {['upload', 'map', 'preview'].map((s, idx) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        step === s ? 'bg-[#2BBBEF] text-white' :
                        ['upload', 'map', 'preview'].indexOf(step) > idx ? 'bg-[#4AFFA8] text-[#010029]' :
                        'bg-gray-200 text-gray-400 dark:bg-gray-700'
                      }`}>
                        {['upload', 'map', 'preview'].indexOf(step) > idx ? '✓' : idx + 1}
                      </div>
                      {idx < 2 && <div className="h-px w-12 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                  <div className="space-y-6">
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-white/10 dark:bg-[#0C0F2C]">
                      <FileSpreadsheet className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        Upload CSV File
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Select a CSV file containing your task data
                      </p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 text-white transition-opacity hover:opacity-90">
                        <Upload className="h-5 w-5" />
                        Choose File
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
                      <div className="flex items-start gap-3">
                        <Download className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
                            Need a template?
                          </h4>
                          <p className="mb-3 text-sm text-blue-800 dark:text-blue-300">
                            Download our CSV template with example data to get started quickly.
                          </p>
                          <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-500/30 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Download className="h-4 w-4" />
                            Download Template
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-900/20">
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified Cost Override Feature
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Optional:</strong> Include a "Verified Cost" column in your CSV to override automatic PCI calculations. 
                        When provided, the system will reverse-calculate PCI Units and Verified Units based on your input cost, 
                        giving you full control over final pricing while maintaining audit trail integrity.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Map Columns */}
                {step === 'map' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Found {csvData.length} rows</strong> in your CSV file. Map each column to the corresponding task field.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {mappings.map((mapping, index) => (
                        <div key={index} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                          <div className="flex-1">
                            <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                              CSV Column: {mapping.csvColumn}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Sample: {csvData[0]?.[index] || 'N/A'}
                            </div>
                          </div>
                          <div className="w-64">
                            <select
                              value={mapping.taskField}
                              onChange={(e) => handleMappingChange(index, e.target.value as any)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#2BBBEF] focus:outline-none dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                            >
                              {TASK_FIELDS.map(field => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Preview */}
                {step === 'preview' && (
                  <div className="space-y-4">
                    {errors.length > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-900/20">
                        <div className="mb-2 flex items-center gap-2 font-semibold text-red-900 dark:text-red-200">
                          <AlertCircle className="h-5 w-5" />
                          {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
                        </div>
                        <ul className="space-y-1 text-sm text-red-800 dark:text-red-300">
                          {errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                      <div className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-5 w-5" />
                        <strong>{previewTasks.length} tasks ready to import</strong>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review the tasks below before importing
                      </p>
                    </div>

                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {previewTasks.map((task, idx) => (
                        <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                          <div className="mb-2 font-semibold text-gray-900 dark:text-white">
                            {idx + 1}. {task.taskName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                            {task.description && (
                              <div>
                                <span className="text-gray-500">Description:</span>
                                <span className="ml-1 text-gray-700 dark:text-gray-300">{task.description}</span>
                              </div>
                            )}
                            {task.estimatedHours !== undefined && (
                              <div>
                                <span className="text-gray-500">Hours:</span>
                                <span className="ml-1 text-gray-700 dark:text-gray-300">{task.estimatedHours}</span>
                              </div>
                            )}
                            {task.roleType && (
                              <div>
                                <span className="text-gray-500">Role:</span>
                                <span className="ml-1 text-gray-700 dark:text-gray-300">{task.roleType}</span>
                              </div>
                            )}
                            {task.complexityScore !== undefined && (
                              <div>
                                <span className="text-gray-500">Complexity:</span>
                                <span className="ml-1 text-gray-700 dark:text-gray-300">{task.complexityScore}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (step === 'map') setStep('upload');
                      else if (step === 'preview') setStep('map');
                      else handleClose();
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  >
                    {step === 'upload' ? 'Cancel' : 'Back'}
                  </button>
                  <button
                    onClick={() => {
                      if (step === 'map') generatePreview();
                      else if (step === 'preview') handleImport();
                    }}
                    disabled={step === 'preview' && errors.length > 0}
                    className="rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {step === 'map' ? 'Preview Import' : `Import ${previewTasks.length} Tasks`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}