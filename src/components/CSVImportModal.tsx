import { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Task } from './TaskTable';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Partial<Task>[]) => void;
}

interface ColumnMapping {
  csvColumn: string;
  taskField: keyof Task | 'skip';
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [csvData, setCSVData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewData, setPreviewData] = useState<Partial<Task>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const taskFields: { value: keyof Task | 'skip'; label: string }[] = [
    { value: 'skip', label: '-- Skip Column --' },
    { value: 'taskName', label: 'Task Name' },
    { value: 'ISR', label: 'ISR (Integration Scope Rating)' },
    { value: 'CF', label: 'CF (Complexity Factor)' },
    { value: 'UXI', label: 'UXI (UX Intensity)' },
    { value: 'RCF', label: 'RCF (Requirement Clarity Factor)' },
    { value: 'AEP', label: 'AEP (Adaptability/Edge Prep)' },
    { value: 'L', label: 'L (Leverage Factor)' },
    { value: 'MLW', label: 'MLW (Market Learning Weight)' },
    { value: 'CGW', label: 'CGW (Client Growth Weight)' },
    { value: 'RF', label: 'RF (Revenue Factor)' },
    { value: 'S', label: 'S (Stability)' },
    { value: 'GLRI', label: 'GLRI (Global Reach Impact)' },
  ];

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
    setCSVData(dataRows);

    // Auto-detect mappings
    const autoMappings: ColumnMapping[] = headerRow.map(header => {
      const headerLower = header.toLowerCase();
      
      // Try to match common column names
      if (headerLower.includes('task') || headerLower.includes('name')) {
        return { csvColumn: header, taskField: 'taskName' };
      }
      
      // Match exact field names
      const matchedField = taskFields.find(f => 
        f.value !== 'skip' && 
        f.value.toLowerCase() === headerLower
      );
      
      if (matchedField) {
        return { csvColumn: header, taskField: matchedField.value };
      }

      return { csvColumn: header, taskField: 'skip' };
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

    // Check if taskName is mapped
    const taskNameMapped = mappings.some(m => m.taskField === 'taskName');
    if (!taskNameMapped) {
      newErrors.push('Task Name column must be mapped');
    }

    csvData.forEach((row, rowIndex) => {
      const task: Partial<Task> = {
        id: `imported-${Date.now()}-${rowIndex}`,
      };

      mappings.forEach((mapping, colIndex) => {
        if (mapping.taskField === 'skip') return;

        const value = row[colIndex];
        
        if (mapping.taskField === 'taskName') {
          task.taskName = value || `Task ${rowIndex + 1}`;
        } else {
          // Parse numeric fields
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (task as any)[mapping.taskField] = numValue;
          } else if (value) {
            newErrors.push(`Row ${rowIndex + 1}: Invalid number for ${mapping.taskField}: "${value}"`);
          }
        }
      });

      // Set defaults for unmapped numeric fields
      const numericFields: (keyof Task)[] = ['ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI'];
      numericFields.forEach(field => {
        if (task[field] === undefined) {
          (task as any)[field] = 1;
        }
      });

      tasks.push(task);
    });

    setPreviewData(tasks);
    setErrors(newErrors);
    setStep('preview');
  };

  const handleImport = () => {
    if (errors.length === 0) {
      onImport(previewData);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('upload');
    setCSVData([]);
    setHeaders([]);
    setMappings([]);
    setPreviewData([]);
    setErrors([]);
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      ['Task Name', 'ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI'],
      ['User Authentication', '2.5', '3.0', '2.0', '2.5', '2.0', '1.0', '2.0', '2.5', '2.0', '3.0', '2.0'],
      ['Dashboard Design', '2.0', '2.5', '3.5', '2.0', '1.5', '1.0', '1.5', '2.0', '1.5', '2.5', '1.5'],
      ['API Integration', '3.5', '3.0', '1.5', '2.5', '2.5', '1.5', '2.5', '2.0', '2.5', '2.5', '3.0'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
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
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-6 py-4 dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Import Tasks from CSV
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload spreadsheet and map columns
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
                <div className="mt-4 flex items-center gap-4">
                  {['upload', 'map', 'preview'].map((s, idx) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                          step === s
                            ? 'bg-[#2BBBEF] text-white'
                            : ['upload', 'map', 'preview'].indexOf(step) > idx
                            ? 'bg-[#4AFFA8] text-[#010029]'
                            : 'bg-gray-200 text-gray-400 dark:bg-[#0C0F2C]'
                        }`}
                      >
                        {['upload', 'map', 'preview'].indexOf(step) > idx ? '✓' : idx + 1}
                      </div>
                      <span className={`text-sm ${step === s ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                      {idx < 2 && <div className="h-px w-8 bg-gray-300 dark:bg-white/10" />}
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
                      <Upload className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        Upload CSV File
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Drag and drop your file here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                      >
                        <Upload className="h-5 w-5" />
                        Select CSV File
                      </label>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm text-blue-900 dark:text-blue-200">
                          <strong>Don't have a CSV file?</strong>
                          <p className="mt-1">
                            Download our template with sample data to get started quickly.
                          </p>
                          <button
                            onClick={downloadTemplate}
                            className="mt-2 flex items-center gap-2 text-blue-700 hover:text-blue-800 dark:text-blue-300"
                          >
                            <Download className="h-4 w-4" />
                            Download Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Map Columns */}
                {step === 'map' && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Map CSV Columns to Task Fields
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Match your CSV columns to the correct task fields
                      </p>
                    </div>

                    <div className="space-y-3">
                      {headers.map((header, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0C0F2C]"
                        >
                          <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              CSV Column: <span className="text-[#2BBBEF]">{header}</span>
                            </label>
                            <select
                              value={mappings[index]?.taskField || 'skip'}
                              onChange={(e) => handleMappingChange(index, e.target.value as keyof Task | 'skip')}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#161A3A] dark:text-white"
                            >
                              {taskFields.map(field => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Sample: {csvData[0]?.[index] || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Preview */}
                {step === 'preview' && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preview Import ({previewData.length} tasks)
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review the tasks before importing
                      </p>
                    </div>

                    {errors.length > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-900/20">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                          <div>
                            <h4 className="font-semibold text-red-900 dark:text-red-200">
                              {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
                            </h4>
                            <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                              {errors.slice(0, 5).map((error, idx) => (
                                <li key={idx}>• {error}</li>
                              ))}
                              {errors.length > 5 && (
                                <li>• ... and {errors.length - 5} more</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="max-h-96 overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-[#0C0F2C]">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Task Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">ISR</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">CF</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">UXI</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                          {previewData.slice(0, 20).map((task, idx) => (
                            <tr key={idx} className="bg-white dark:bg-[#161A3A]">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{task.taskName}</td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{task.ISR}</td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{task.CF}</td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{task.UXI}</td>
                              <td className="px-4 py-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </td>
                            </tr>
                          ))}
                          {previewData.length > 20 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                ... and {previewData.length - 20} more tasks
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                <div className="flex justify-between">
                  <button
                    onClick={step === 'upload' ? handleClose : () => setStep(step === 'map' ? 'upload' : 'map')}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  >
                    {step === 'upload' ? 'Cancel' : 'Back'}
                  </button>
                  {step === 'map' && (
                    <button
                      onClick={generatePreview}
                      className="rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 font-medium text-white transition-all hover:shadow-lg"
                    >
                      Preview Import
                    </button>
                  )}
                  {step === 'preview' && (
                    <button
                      onClick={handleImport}
                      disabled={errors.length > 0}
                      className="rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Import {previewData.length} Tasks
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
