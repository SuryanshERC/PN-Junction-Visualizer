import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import BandDiagramChart from './BandDiagramChart';
import {
  calculateBandDiagram,
  generateBandProfile,
  type JunctionParams,
  type BandDiagramData,
} from '../utils/semiconductorPhysics';

export default function BandDiagramSimulator() {
  const [NAMantissa, setNAMantissa] = useState<number>(1);
  const [NAExponent, setNAExponent] = useState<number>(17);
  const [NDMantissa, setNDMantissa] = useState<number>(1);
  const [NDExponent, setNDExponent] = useState<number>(17);
  const [T] = useState<number>(300);
  const [bandData, setBandData] = useState<BandDiagramData | null>(null);

  const NA = NAMantissa * Math.pow(10, NAExponent);
  const ND = NDMantissa * Math.pow(10, NDExponent);

  useEffect(() => {
    const params: JunctionParams = { NA, ND, T };
    const data = calculateBandDiagram(params);
    setBandData(data);
  }, [NA, ND, T]);

  const bandProfile = bandData ? generateBandProfile(bandData) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-lg border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            Energy Band Diagram Simulator
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-blue-600">
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-blue-600">
              = {ND.toExponential(2)} cm<sup>-3</sup>
            </p>
          </div>
        </div>
      </div>

      {bandData && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Built-in Potential
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {bandData.Vbi.toFixed(4)} V
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Depletion Width
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {(bandData.W * 1e5).toFixed(4)} μm
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Max Electric Field
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {(bandData.Emax /(-1)).toExponential(2)} V/cm
            </p>
          </div>
        </div>
      )}

      {bandProfile && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Energy Band Diagram
          </h3>
          <BandDiagramChart data={bandProfile} bandData={bandData!} />
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Physical Parameters
        </h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div>
            <span className="font-medium">Temperature:</span> {T} 
          </div>
          <div>
            <span className="font-medium">Intrinsic carrier concentration:</span> 1.5×10<sup>10</sup> cm<sup>-3</sup>
          </div>
          <div>
            <span className="font-medium">Bandgap (Si):</span> 1.12 eV
          </div>
          <div>
            <span className="font-medium">Permittivity:</span> 1.04×10<sup>-12</sup> F/cm
          </div>
        </div>
      </div>
    </div>
  );
}
