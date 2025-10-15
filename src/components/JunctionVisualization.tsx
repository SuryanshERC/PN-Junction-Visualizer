import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import JunctionDiagram from './JunctionDiagram';
import CarrierDensityDisplay from './CarrierDensityDisplay';
import {
  calculateBandDiagram,
  calculateCarrierDensities,
  type JunctionParams,
  type BandDiagramData,
  type CarrierDensities,
} from '../utils/semiconductorPhysics';

export default function JunctionVisualization() {
  const [NAMantissa, setNAMantissa] = useState<number>(1);
  const [NAExponent, setNAExponent] = useState<number>(17);
  const [NDMantissa, setNDMantissa] = useState<number>(1);
  const [NDExponent, setNDExponent] = useState<number>(17);
  const [T] = useState<number>(300);
  const [bandData, setBandData] = useState<BandDiagramData | null>(null);
  const [carriers, setCarriers] = useState<CarrierDensities | null>(null);

  const NA = NAMantissa * Math.pow(10, NAExponent);
  const ND = NDMantissa * Math.pow(10, NDExponent);

  useEffect(() => {
    const params: JunctionParams = { NA, ND, T };
    const data = calculateBandDiagram(params);
    const carrierData = calculateCarrierDensities(NA, ND);
    setBandData(data);
    setCarriers(carrierData);
  }, [NA, ND, T]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-slate-50 p-6 rounded-lg border border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            PN Junction Visualization
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              P-type Doping (N<sub>A</sub>)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={NAMantissa}
                  onChange={(e) => setNAMantissa(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.1"
                  min="0.1"
                  max="10"
                />
                <p className="mt-1 text-xs text-slate-500">Mantissa</p>
              </div>
              <span className="text-2xl text-slate-400 self-center">×</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={NAExponent}
                  onChange={(e) => setNAExponent(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-green-600">
              = {NA.toExponential(2)} cm<sup>-3</sup>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              N-type Doping (N<sub>D</sub>)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={NDMantissa}
                  onChange={(e) => setNDMantissa(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.1"
                  min="0.1"
                  max="10"
                />
                <p className="mt-1 text-xs text-slate-500">Mantissa</p>
              </div>
              <span className="text-2xl text-slate-400 self-center">×</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={NDExponent}
                  onChange={(e) => setNDExponent(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-green-600">
              = {ND.toExponential(2)} cm<sup>-3</sup>
            </p>
          </div>
        </div>
      </div>

      {bandData && (
        <>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Color-Graded PN Junction
            </h3>
            <JunctionDiagram bandData={bandData} NA={NA} ND={ND} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Depletion Width
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-600">Total Width (W):</span>
                  <p className="text-xl font-bold text-green-600">
                    {(bandData.W * 1e6).toFixed(4)} μm
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600">x<sub>p</sub>:</span>
                    <p className="font-semibold text-slate-800">
                      {(bandData.xp * 1e6).toFixed(4)} μm
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">x<sub>n</sub>:</span>
                    <p className="font-semibold text-slate-800">
                      {(bandData.xn * 1e6).toFixed(4)} μm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Built-in Potential
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg width="60" height="40" viewBox="0 0 60 40">
                    <rect x="5" y="8" width="50" height="24" fill="none" stroke="#64748b" strokeWidth="2" rx="2" />
                    <line x1="5" y1="14" x2="5" y2="26" stroke="#64748b" strokeWidth="2" />
                    <line x1="1" y1="14" x2="9" y2="14" stroke="#64748b" strokeWidth="2" />
                    <line x1="1" y1="26" x2="9" y2="26" stroke="#64748b" strokeWidth="2" />
                    <line x1="55" y1="14" x2="55" y2="26" stroke="#64748b" strokeWidth="2" />
                    <text x="30" y="23" fontSize="10" fill="#3b82f6" textAnchor="middle" fontWeight="bold">+</text>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {bandData.Vbi.toFixed(4)} V
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    V<sub>bi</sub> = (kT/q) ln(N<sub>A</sub>N<sub>D</sub>/n<sub>i</sub><sup>2</sup>)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Max Electric Field
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {(bandData.Emax / 1e5).toExponential(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">V/cm</p>
              <p className="text-xs text-slate-500 mt-2">
                E<sub>max</sub> = qN<sub>A</sub>x<sub>p</sub>/ε<sub>s</sub>
              </p>
            </div>
          </div>

          {carriers && (
            <CarrierDensityDisplay carriers={carriers} />
          )}
        </>
      )}
    </div>
  );
}
