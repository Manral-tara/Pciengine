import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

interface FormulaPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FormulaPanel({ isOpen, onToggle }: FormulaPanelProps) {
  return (
    <div className={`fixed right-0 top-[73px] bottom-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="flex h-32 w-8 items-center justify-center self-start rounded-l-lg bg-[#010029] text-white transition-colors hover:bg-[#010029]/90"
          style={{ marginTop: '100px' }}
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Panel Content */}
        <div className="h-full w-96 overflow-y-auto bg-[#010029] p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <Calculator className="h-6 w-6 text-[#4AFFA8]" />
            <h2>Formula Engine Inspector</h2>
          </div>

          {/* Core PCI Formula */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#4AFFA8]" />
              <h3 className="text-[#4AFFA8]">Core PCI Formula</h3>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <code className="block text-[#2BBBEF]" style={{ fontFamily: 'monospace' }}>
                PCI = (ISR × CF × UXI) + <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(RCF × AEP − L) + <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(MLW × CGW × RF) + <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(S × GLRI)
              </code>
            </div>
            <p className="mt-3 text-gray-400" style={{ fontSize: '13px' }}>
              Calculates the total Project Complexity Index units based on weighted factors across scope, risk, engineering, coordination, and specialty dimensions.
            </p>
          </div>

          {/* Audit Formula */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#4AFFA8]" />
              <h3 className="text-[#4AFFA8]">Audit Formula (AAS)</h3>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <code className="block text-[#2BBBEF]" style={{ fontFamily: 'monospace' }}>
                AAS = (AI Verified Units ÷ PCI Units) × 100
              </code>
            </div>
            <p className="mt-3 text-gray-400" style={{ fontSize: '13px' }}>
              Accuracy Audit Score measures the percentage of AI-verified units relative to modeled PCI units. Values below 85% indicate variance requiring review.
            </p>
          </div>

          {/* Final Cost Formula */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#4AFFA8]" />
              <h3 className="text-[#4AFFA8]">Final Cost Formula</h3>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <code className="block text-[#2BBBEF]" style={{ fontFamily: 'monospace' }}>
                Verified Cost = Verified Units × Hourly Rate
              </code>
            </div>
            <p className="mt-3 text-gray-400" style={{ fontSize: '13px' }}>
              Converts verified units to dollar cost using the configured hourly rate from settings.
            </p>
          </div>

          {/* Variable Definitions */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#4AFFA8]" />
              <h3 className="text-[#4AFFA8]">Variable Definitions</h3>
            </div>
            <div className="space-y-2">
              {[
                { key: 'ISR', desc: 'Initial Scope Rating' },
                { key: 'CF', desc: 'Complexity Factor' },
                { key: 'UXI', desc: 'User Experience Impact' },
                { key: 'RCF', desc: 'Risk Complexity Factor' },
                { key: 'AEP', desc: 'Architecture & Engineering Points' },
                { key: 'L', desc: 'Learning Curve' },
                { key: 'MLW', desc: 'Multi-Layer Work' },
                { key: 'CGW', desc: 'Cross-Group Work' },
                { key: 'RF', desc: 'Rework Factor' },
                { key: 'S', desc: 'Specialty Factor' },
                { key: 'GLRI', desc: 'Governance & Legal Risk Index' },
              ].map(({ key, desc }) => (
                <div key={key} className="rounded bg-white/5 px-3 py-2">
                  <span className="text-[#2BBBEF]">{key}</span>
                  <span className="text-gray-400"> — {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
