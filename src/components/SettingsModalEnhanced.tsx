import { useState } from 'react';
import { X, Settings as SettingsIcon, Info, Calculator, TrendingUp, Zap, ArrowRight, HelpCircle } from 'lucide-react';
import type { Settings } from '../App';
import { UserTrainingGuide } from './UserTrainingGuide';

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'converter' | 'training'>('general');
  
  // Calculator state
  const [calculatorUnits, setCalculatorUnits] = useState(10);
  const [calculatorHours, setCalculatorHours] = useState(10 * localSettings.unitToHourRatio);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  // Update calculator when ratio changes
  const handleRatioChange = (newRatio: number) => {
    setLocalSettings({ ...localSettings, unitToHourRatio: newRatio });
    setCalculatorHours(calculatorUnits * newRatio);
  };

  const handleUnitsChange = (units: number) => {
    setCalculatorUnits(units);
    setCalculatorHours(units * localSettings.unitToHourRatio);
  };

  const handleHoursChange = (hours: number) => {
    setCalculatorHours(hours);
    setCalculatorUnits(hours / localSettings.unitToHourRatio);
  };

  // Industry preset ratios
  const industryPresets = {
    general: { ratio: 1.5, rate: 66, description: 'Standard software development projects' },
    fintech: { ratio: 1.8, rate: 95, description: 'High complexity, regulatory compliance' },
    healthcare: { ratio: 1.7, rate: 88, description: 'HIPAA compliance, medical accuracy' },
    ecommerce: { ratio: 1.4, rate: 72, description: 'Transaction systems, inventory management' },
    enterprise: { ratio: 1.6, rate: 85, description: 'Large-scale systems, multiple integrations' },
    'ai-ml': { ratio: 2.0, rate: 110, description: 'Machine learning, data science projects' },
  };

  const applyIndustryPreset = (preset: string) => {
    const presetData = industryPresets[preset as keyof typeof industryPresets];
    setLocalSettings({
      ...localSettings,
      industryPreset: preset,
      unitToHourRatio: presetData.ratio,
      hourlyRate: presetData.rate,
    });
  };

  // Example scenarios
  const scenarios = [
    {
      name: 'Simple CRUD API',
      units: 8.5,
      description: 'Basic REST endpoints with database operations',
      complexity: 'Low',
    },
    {
      name: 'Authentication System',
      units: 32.4,
      description: 'OAuth2, JWT, password reset, 2FA',
      complexity: 'Medium',
    },
    {
      name: 'Payment Integration',
      units: 71.8,
      description: 'Stripe/PayPal, webhooks, refunds, security',
      complexity: 'High',
    },
    {
      name: 'AI Model Training',
      units: 125.3,
      description: 'Data preprocessing, model development, deployment',
      complexity: 'Very High',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] p-2">
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-[#010029]">Global Settings</h2>
                <p className="text-gray-500" style={{ fontSize: '13px' }}>
                  Configure cost calculations and unit conversion
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-b-2 border-[#2BBBEF] text-[#2BBBEF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                General Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'converter'
                  ? 'border-b-2 border-[#2BBBEF] text-[#2BBBEF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Unit-to-Hour Converter
              </div>
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'training'
                  ? 'border-b-2 border-[#2BBBEF] text-[#2BBBEF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Training & Resources
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Hourly Rate */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-700">
                  Static Hourly Rate
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                      The base cost per hour for development work. This is multiplied by hours to calculate project costs.
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={localSettings.hourlyRate}
                    onChange={(e) => setLocalSettings({ ...localSettings, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-4 focus:border-[#2BBBEF] focus:outline-none"
                    step="0.01"
                  />
                </div>
                <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                  Industry average: $50-150/hour depending on expertise
                </p>
              </div>

              {/* Unit to Hour Ratio */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-700">
                  Unit-to-Hour Ratio
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                      Conversion factor: 1 PCI Unit = X Hours. Higher values mean more complex projects require more time per unit of work.
                    </div>
                  </div>
                </label>
                <div className="mb-3">
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={localSettings.unitToHourRatio}
                    onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-gray-500" style={{ fontSize: '12px' }}>
                    <span>1.0 (Simple)</span>
                    <span className="text-[#2BBBEF]">{localSettings.unitToHourRatio.toFixed(1)}</span>
                    <span>3.0 (Complex)</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={localSettings.unitToHourRatio}
                  onChange={(e) => handleRatioChange(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                  step="0.1"
                />
                <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                  Recommended: 1.5 for standard projects, 1.8-2.0 for complex projects
                </p>
              </div>

              {/* Visual Ratio Comparison */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#2BBBEF]" />
                  <h3 className="text-[#010029]">Quick Conversion</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white p-3 text-center">
                    <div className="text-gray-500" style={{ fontSize: '12px' }}>10 Units</div>
                    <div className="text-[#010029]">{(10 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    <div className="text-gray-500" style={{ fontSize: '12px' }}>50 Units</div>
                    <div className="text-[#010029]">{(50 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    <div className="text-gray-500" style={{ fontSize: '12px' }}>100 Units</div>
                    <div className="text-[#010029]">{(100 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-2 block text-gray-700">Currency</label>
                <select
                  value={localSettings.currency}
                  onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="CAD">CAD - Canadian Dollar (C$)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                </select>
              </div>

              {/* Industry Presets */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-700">
                  Industry Preset
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full left-1/2 mb-2 hidden w-80 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                      Pre-configured settings based on industry standards. Automatically adjusts both hourly rate and unit-to-hour ratio.
                    </div>
                  </div>
                </label>
                <div className="space-y-2">
                  {Object.entries(industryPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyIndustryPreset(key)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        localSettings.industryPreset === key
                          ? 'border-[#2BBBEF] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[#010029]">
                          {key === 'general' && 'General Software Development'}
                          {key === 'fintech' && 'FinTech / Banking'}
                          {key === 'healthcare' && 'Healthcare / MedTech'}
                          {key === 'ecommerce' && 'E-Commerce / Retail'}
                          {key === 'enterprise' && 'Enterprise SaaS'}
                          {key === 'ai-ml' && 'AI / Machine Learning'}
                        </span>
                        {localSettings.industryPreset === key && (
                          <Zap className="h-4 w-4 text-[#2BBBEF]" />
                        )}
                      </div>
                      <div className="text-gray-500" style={{ fontSize: '12px' }}>
                        {preset.description}
                      </div>
                      <div className="mt-2 flex gap-4 text-gray-600" style={{ fontSize: '12px' }}>
                        <span>Ratio: {preset.ratio.toFixed(1)}x</span>
                        <span>Rate: ${preset.rate}/hr</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Unit-to-Hour Converter Tab */}
          {activeTab === 'converter' && (
            <div className="space-y-6">
              {/* Educational Header */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-[#2BBBEF]" />
                  <h3 className="text-[#010029]">Understanding Unit-to-Hour Mapping</h3>
                </div>
                <p className="mb-4 text-gray-700" style={{ fontSize: '14px' }}>
                  PCI Units represent the <strong>complexity and scope</strong> of work, while Hours represent actual <strong>time investment</strong>. 
                  The conversion ratio accounts for project complexity, team experience, and industry factors.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-[#010029]">Standard Projects (1.2-1.5x)</div>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>
                      Well-defined scope, familiar tech stack, experienced team. 1 unit ≈ 1.2-1.5 hours.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-[#010029]">Complex Projects (1.8-2.5x)</div>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>
                      New technology, high complexity, R&D required. 1 unit ≈ 1.8-2.5 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Calculator */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#2BBBEF]" />
                  <h3 className="text-[#010029]">Interactive Converter</h3>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
                  {/* Units Input */}
                  <div>
                    <label className="mb-2 block text-gray-600" style={{ fontSize: '13px' }}>PCI Units</label>
                    <input
                      type="number"
                      value={calculatorUnits.toFixed(2)}
                      onChange={(e) => handleUnitsChange(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                      step="0.1"
                    />
                  </div>

                  {/* Conversion Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white">
                      × {localSettings.unitToHourRatio.toFixed(1)}
                    </div>
                  </div>

                  {/* Hours Output */}
                  <div>
                    <label className="mb-2 block text-gray-600" style={{ fontSize: '13px' }}>Hours</label>
                    <input
                      type="number"
                      value={calculatorHours.toFixed(2)}
                      onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Cost Calculation */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 text-gray-600" style={{ fontSize: '13px' }}>Estimated Cost</div>
                  <div className="text-[#010029]" style={{ fontSize: '28px' }}>
                    ${(calculatorHours * localSettings.hourlyRate).toFixed(2)}
                  </div>
                  <p className="mt-1 text-gray-500" style={{ fontSize: '12px' }}>
                    {calculatorHours.toFixed(1)} hours × ${localSettings.hourlyRate}/hr
                  </p>
                </div>
              </div>

              {/* Example Scenarios */}
              <div>
                <h3 className="mb-4 text-[#010029]">Real-World Examples</h3>
                <div className="space-y-3">
                  {scenarios.map((scenario) => {
                    const hours = scenario.units * localSettings.unitToHourRatio;
                    const cost = hours * localSettings.hourlyRate;
                    const complexityColor = 
                      scenario.complexity === 'Low' ? 'text-green-600 bg-green-50' :
                      scenario.complexity === 'Medium' ? 'text-blue-600 bg-blue-50' :
                      scenario.complexity === 'High' ? 'text-orange-600 bg-orange-50' :
                      'text-red-600 bg-red-50';

                    return (
                      <div key={scenario.name} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 text-[#010029]">{scenario.name}</div>
                            <div className="text-gray-600" style={{ fontSize: '13px' }}>
                              {scenario.description}
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 ${complexityColor}`} style={{ fontSize: '12px' }}>
                            {scenario.complexity}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-gray-200 pt-3">
                          <div>
                            <div className="text-gray-500" style={{ fontSize: '12px' }}>PCI Units</div>
                            <div className="text-[#010029]">{scenario.units.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500" style={{ fontSize: '12px' }}>Hours</div>
                            <div className="text-[#010029]">{hours.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500" style={{ fontSize: '12px' }}>Est. Cost</div>
                            <div className="text-[#010029]">${cost.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Table */}
              <div>
                <h3 className="mb-4 text-[#010029]">Ratio Comparison Chart</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>PCI Units</th>
                        <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>1.2x Ratio</th>
                        <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>1.5x Ratio</th>
                        <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>1.8x Ratio</th>
                        <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>2.0x Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[10, 25, 50, 100, 200].map((units) => (
                        <tr key={units} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-[#010029]">{units}</td>
                          <td className="px-4 py-3 text-gray-600">{(units * 1.2).toFixed(1)} hrs</td>
                          <td className="px-4 py-3 text-gray-600">{(units * 1.5).toFixed(1)} hrs</td>
                          <td className="px-4 py-3 text-gray-600">{(units * 1.8).toFixed(1)} hrs</td>
                          <td className="px-4 py-3 text-gray-600">{(units * 2.0).toFixed(1)} hrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mapping Visualization */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-[#010029]">Current Ratio Visualization</h3>
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-gray-600" style={{ fontSize: '13px' }}>
                    <span>1 PCI Unit</span>
                    <span>{localSettings.unitToHourRatio.toFixed(1)} Hours</span>
                  </div>
                  <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100">
                    <div 
                      className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] transition-all duration-300"
                      style={{ width: `${(localSettings.unitToHourRatio / 3) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-gray-400" style={{ fontSize: '11px' }}>
                    <span>1.0 (Fast)</span>
                    <span>3.0 (Detailed)</span>
                  </div>
                </div>
                <p className="text-gray-600" style={{ fontSize: '13px' }}>
                  Your current ratio means each unit of work translates to <strong>{localSettings.unitToHourRatio.toFixed(1)} hours</strong> of development time.
                  {localSettings.unitToHourRatio < 1.4 && ' This is optimized for simple, well-defined projects.'}
                  {localSettings.unitToHourRatio >= 1.4 && localSettings.unitToHourRatio < 1.7 && ' This is ideal for standard complexity projects.'}
                  {localSettings.unitToHourRatio >= 1.7 && ' This accounts for high complexity or specialized work.'}
                </p>
              </div>
            </div>
          )}

          {/* Training & Resources Tab */}
          {activeTab === 'training' && (
            <UserTrainingGuide />
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}