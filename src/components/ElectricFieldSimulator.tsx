import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import ElectricFieldChart from './ElectricFieldChartLegacy';
import PotentialChart from './PotentialChartLegacy';
import {
  calculateElectricFieldProfile,
  type ElectricFieldData,
} from '../utils/poissonCalculations';
import { calculateBandDiagram, type JunctionParams } from '../utils/semiconductorPhysics';

export default function ElectricFieldSimulator() {
  const [NAMantissa, setNAMantissa] = useState<number>(1);
  const [NAExponent, setNAExponent] = useState<number>(17);
  const [NDMantissa, setNDMantissa] = useState<number>(1);
  const [NDExponent, setNDExponent] = useState<number>(17);
  const [T] = useState<number>(300);
  const [fieldData, setFieldData] = useState<ElectricFieldData | null>(null);
  const [Vbi, setVbi] = useState<number>(0);
  const [depletionStart, setDepletionStart] = useState<number>(0);
  const [depletionEnd, setDepletionEnd] = useState<number>(0);

  const NA = NAMantissa * Math.pow(10, NAExponent);
  const ND = NDMantissa * Math.pow(10, NDExponent);

  useEffect(() => {
    const params: JunctionParams = { NA, ND, T };
    const bandData = calculateBandDiagram(params);
    const data = calculateElectricFieldProfile(NA, ND, T);

    setFieldData(data);
    setVbi(bandData.Vbi);
    setDepletionStart(-bandData.xp * 1e6);
    setDepletionEnd(bandData.xn * 1e6);
  }, [NA, ND, T]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-slate-50 p-6 rounded-lg border border-orange-100">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            Electric Field & Carrier Distribution
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-orange-600">
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  step="1"
                  min="10"
                  max="22"
                />
                <p className="mt-1 text-xs text-slate-500">Exponent (10<sup>x</sup>)</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-orange-600">
              = {ND.toExponential(2)} cm<sup>-3</sup>
            </p>
          </div>
        </div>
      </div>

      {fieldData && (
        <>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Electric Field Distribution E(x)
            </h3>
            <ElectricFieldChart
              x={fieldData.x}
              E={fieldData.E}
              depletionStart={depletionStart}
              depletionEnd={depletionEnd}
            />
            <p className="mt-3 text-sm text-slate-600">
              The electric field is maximum at the metallurgical junction (x=0) and linearly decreases
              to zero at the depletion region boundaries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Electrostatic Potential φ(x)
            </h3>
            <PotentialChart
              x={fieldData.x}
              potential={fieldData.potential}
              depletionStart={depletionStart}
              depletionEnd={depletionEnd}
              Vbi={Vbi}
            />
            <p className="mt-3 text-sm text-slate-600">
              The electrostatic potential varies quadratically within the depletion region,
              with total drop equal to the built-in potential V<sub>bi</sub>.
            </p>
          </div>


          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Calculation Method
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="font-medium">Approach:</span> Depletion approximation with Boltzmann statistics
              </div>
              <div>
                <span className="font-medium">Temperature:</span> {T} K
              </div>
              <div>
                <span className="font-medium">V<sub>T</sub>:</span> {(0.0259 * (T / 300)).toFixed(4)} V
              </div>
              <div>
                <span className="font-medium">n<sub>i</sub>:</span> 1.08×10<sup>10</sup> cm<sup>-3</sup>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
