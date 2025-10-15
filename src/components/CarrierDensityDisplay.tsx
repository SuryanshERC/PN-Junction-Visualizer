import type { CarrierDensities } from '../utils/semiconductorPhysics';

interface CarrierDensityDisplayProps {
  carriers: CarrierDensities;
}

export default function CarrierDensityDisplay({ carriers }: CarrierDensityDisplayProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Carrier Densities
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            P-Type Region
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-600">Hole Density (p<sub>p</sub>):</span>
                <span className="text-sm font-mono text-slate-500">Majority Carrier</span>
              </div>
              <p className="text-xl font-bold text-red-700">
                {carriers.pP.toExponential(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">cm<sup>-3</sup></p>
              <div className="mt-2 bg-white p-2 rounded text-xs font-mono text-slate-600">
                p<sub>p</sub> ≈ N<sub>A</sub>
              </div>
            </div>

            <div className="border-t border-red-200 pt-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-600">Electron Density (n<sub>p</sub>):</span>
                <span className="text-sm font-mono text-slate-500">Minority Carrier</span>
              </div>
              <p className="text-xl font-bold text-red-700">
                {carriers.nP.toExponential(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">cm<sup>-3</sup></p>
              <div className="mt-2 bg-white p-2 rounded text-xs font-mono text-slate-600">
                n<sub>p</sub> = n<sub>i</sub><sup>2</sup> / N<sub>A</sub>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            N-Type Region
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-600">Electron Density (n<sub>n</sub>):</span>
                <span className="text-sm font-mono text-slate-500">Majority Carrier</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {carriers.nN.toExponential(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">cm<sup>-3</sup></p>
              <div className="mt-2 bg-white p-2 rounded text-xs font-mono text-slate-600">
                n<sub>n</sub> ≈ N<sub>D</sub>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-600">Hole Density (p<sub>n</sub>):</span>
                <span className="text-sm font-mono text-slate-500">Minority Carrier</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {carriers.pN.toExponential(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">cm<sup>-3</sup></p>
              <div className="mt-2 bg-white p-2 rounded text-xs font-mono text-slate-600">
                p<sub>n</sub> = n<sub>i</sub><sup>2</sup> / N<sub>D</sub>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Key Principles
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <div>
              <p className="font-medium">Mass-Action Law:</p>
              <p className="font-mono mt-1">n × p = n<sub>i</sub><sup>2</sup></p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <div>
              <p className="font-medium">Boltzmann Approximation:</p>
              <p className="font-mono mt-1">n = N<sub>C</sub> exp(-(E<sub>C</sub> - E<sub>F</sub>)/kT)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <div>
              <p className="font-medium">Intrinsic Concentration:</p>
              <p className="font-mono mt-1">n<sub>i</sub> = 1.5×10<sup>16</sup> cm<sup>-3</sup> (Si, 300K)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <div>
              <p className="font-medium">Doping Effects:</p>
              <p className="mt-1">Higher doping → More majority carriers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
