import { useState } from 'react';
import { X, Settings as SettingsIcon, Info, Calculator, TrendingUp, Zap, ArrowRight, HelpCircle, Palette, Image, AlertTriangle } from 'lucide-react';
import type { Settings } from '../App';

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'converter' | 'branding'>('general');
  
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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white dark:bg-[#0C0F2C] shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C0F2C] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="rounded-lg p-2"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${localSettings.primaryColor || '#2BBBEF'}, ${localSettings.secondaryColor || '#4AFFA8'})` }}
              >
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-[#010029] dark:text-white">Global Settings</h2>
                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                  Configure cost calculations and unit conversion
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-b-2 border-[#2BBBEF] text-[#2BBBEF]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Unit-to-Hour Converter
              </div>
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 transition-colors ${
                activeTab === 'branding'
                  ? 'border-b-2 border-[#2BBBEF] text-[#2BBBEF]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding
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
                <label className="mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  Static Hourly Rate
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                      The base cost per hour for development work. This is multiplied by hours to calculate project costs.
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">$</span>
                  <input
                    type="number"
                    value={localSettings.hourlyRate}
                    onChange={(e) => setLocalSettings({ ...localSettings, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 dark:bg-[#161A3A] dark:text-white py-2 pl-8 pr-4 focus:border-[#2BBBEF] focus:outline-none"
                    step="0.01"
                  />
                </div>
                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                  Industry average: $50-150/hour depending on expertise
                </p>
              </div>

              {/* Unit to Hour Ratio */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
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
                  <div className="mt-2 flex justify-between text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                    <span>1.0 (Simple)</span>
                    <span className="text-[#2BBBEF]">{localSettings.unitToHourRatio.toFixed(1)}</span>
                    <span>3.0 (Complex)</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={localSettings.unitToHourRatio}
                  onChange={(e) => handleRatioChange(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 dark:bg-[#161A3A] dark:text-white px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                  step="0.1"
                />
                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                  Recommended: 1.5 for standard projects, 1.8-2.0 for complex projects
                </p>
              </div>

              {/* Visual Ratio Comparison */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#2BBBEF]" />
                  <h3 className="text-[#010029] dark:text-white">Quick Conversion</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white dark:bg-[#161A3A] p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>10 Units</div>
                    <div className="text-[#010029] dark:text-white">{(10 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#161A3A] p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>50 Units</div>
                    <div className="text-[#010029] dark:text-white">{(50 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#161A3A] p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>100 Units</div>
                    <div className="text-[#010029] dark:text-white">{(100 * localSettings.unitToHourRatio).toFixed(1)} hrs</div>
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={localSettings.currency}
                  onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 dark:bg-[#161A3A] dark:text-white px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
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
                <label className="mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
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
                          ? 'border-[#2BBBEF] bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[#010029] dark:text-white">
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
                      <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                        {preset.description}
                      </div>
                      <div className="mt-2 flex gap-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
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

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Informational Header */}
              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-6 w-6 text-purple-600" />
                  <h3 className="text-[#010029]">White-Label Customization</h3>
                </div>
                <p className="text-gray-700" style={{ fontSize: '14px' }}>
                  Customize the application with your own branding elements. All changes apply globally across the entire platform.
                </p>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="mb-4 text-[#010029]">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={localSettings.companyName || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                      placeholder="Plataforma Technologies"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                    />
                    <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                      Displayed in the header and throughout the application
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-gray-700">Tagline / Product Name</label>
                    <input
                      type="text"
                      value={localSettings.companyTagline || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, companyTagline: e.target.value })}
                      placeholder="PCI Engine"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                    />
                    <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                      Appears below company name in navigation
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <h3 className="mb-4 text-[#010029]">Logo</h3>
                <div>
                  <label className="mb-2 block text-gray-700">Logo URL</label>
                  <input
                    type="url"
                    value={localSettings.logoUrl || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                  />
                  <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                    Enter a URL for your logo image. Recommended size: 40×40px or larger. Leave empty to use company initials.
                  </p>
                  
                  {/* Logo Preview */}
                  {localSettings.logoUrl && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 text-gray-600" style={{ fontSize: '13px' }}>Preview:</div>
                      <div className="flex items-center gap-3">
                        <img 
                          src={localSettings.logoUrl} 
                          alt="Logo preview"
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'Failed to load';
                            e.currentTarget.className = 'h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600';
                          }}
                        />
                        <div>
                          <div style={{ color: localSettings.accentColor }}>{localSettings.companyName}</div>
                          <div className="text-gray-500" style={{ fontSize: '12px' }}>{localSettings.companyTagline}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <h3 className="mb-4 text-[#010029]">Brand Colors</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-gray-700">
                      Primary Color (Blue Accent)
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-400" />
                        <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                          Main brand color used for buttons, links, and interactive elements. Default: #2BBBEF
                        </div>
                      </div>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localSettings.primaryColor || '#2BBBEF'}
                        onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                        className="h-12 w-16 cursor-pointer rounded-lg border border-gray-200"
                      />
                      <input
                        type="text"
                        value={localSettings.primaryColor || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                        placeholder="#2BBBEF"
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-gray-700">
                      Secondary Color (Mint/Aqua Accent)
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-400" />
                        <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                          Secondary brand color used in gradients and highlights. Default: #4AFFA8
                        </div>
                      </div>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localSettings.secondaryColor || '#4AFFA8'}
                        onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                        className="h-12 w-16 cursor-pointer rounded-lg border border-gray-200"
                      />
                      <input
                        type="text"
                        value={localSettings.secondaryColor || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                        placeholder="#4AFFA8"
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-gray-700">
                      Accent Color (Dark Navy)
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-400" />
                        <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-white group-hover:block" style={{ fontSize: '12px' }}>
                          Dark accent color used for headings and text emphasis. Default: #010029
                        </div>
                      </div>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localSettings.accentColor || '#010029'}
                        onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                        className="h-12 w-16 cursor-pointer rounded-lg border border-gray-200"
                      />
                      <input
                        type="text"
                        value={localSettings.accentColor || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                        placeholder="#010029"
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 text-gray-600" style={{ fontSize: '13px' }}>Color Preview:</div>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-lg p-4 text-center text-white" style={{ backgroundColor: localSettings.primaryColor }}>
                        <div style={{ fontSize: '13px' }}>Primary</div>
                      </div>
                      <div className="flex-1 rounded-lg p-4 text-center text-white" style={{ backgroundColor: localSettings.secondaryColor }}>
                        <div style={{ fontSize: '13px' }}>Secondary</div>
                      </div>
                      <div className="flex-1 rounded-lg p-4 text-center text-white" style={{ backgroundColor: localSettings.accentColor }}>
                        <div style={{ fontSize: '13px' }}>Accent</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg p-4 text-white" style={{ backgroundImage: `linear-gradient(to right, ${localSettings.primaryColor}, ${localSettings.secondaryColor})` }}>
                      <div className="text-center">Gradient Preview</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <div>
                <h3 className="mb-4 text-[#010029]">Footer Customization</h3>
                <div>
                  <label className="mb-2 block text-gray-700">Footer Text</label>
                  <textarea
                    value={localSettings.footerText}
                    onChange={(e) => setLocalSettings({ ...localSettings, footerText: e.target.value })}
                    placeholder="PCI Engine by Plataforma Technologies — AI-Powered Project Accuracy Modeling"
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#2BBBEF] focus:outline-none"
                  />
                  <p className="mt-1 text-gray-500" style={{ fontSize: '13px' }}>
                    Custom text displayed in the application footer
                  </p>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <strong className="text-orange-800">Reset Branding</strong>
                </div>
                <p className="mb-3 text-orange-700" style={{ fontSize: '14px' }}>
                  Restore default Plataforma Technologies / PCI Engine branding
                </p>
                <button
                  onClick={() => {
                    setLocalSettings({
                      ...localSettings,
                      companyName: 'Plataforma Technologies',
                      companyTagline: 'PCI Engine',
                      logoUrl: '',
                      primaryColor: '#2BBBEF',
                      secondaryColor: '#4AFFA8',
                      accentColor: '#010029',
                      footerText: 'PCI Engine by Plataforma Technologies — AI-Powered Project Accuracy Modeling',
                    });
                  }}
                  className="rounded-lg border border-orange-300 bg-white px-4 py-2 text-orange-700 transition-colors hover:bg-orange-50"
                >
                  Reset to Default Branding
                </button>
              </div>
            </div>
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
              className="rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
              style={{ backgroundImage: `linear-gradient(to bottom right, ${localSettings.primaryColor || '#2BBBEF'}, ${localSettings.secondaryColor || '#4AFFA8'})` }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}