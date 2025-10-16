import { useState } from 'react';
import BandDiagramSimulator from './components/BandDiagramSimulator';
import JunctionVisualization from './components/JunctionVisualization';
import ElectricFieldSimulator from './components/ElectricFieldSimulator';

function App() {
  const [activeTab, setActiveTab] = useState<'band' | 'junction' | 'field'>('band');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            PN Junction Simulator
          </h1>
          <p className="text-slate-600">
            Interactive semiconductor physics simulation
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('band')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'band'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Band Diagram
            </button>
            <button
              onClick={() => setActiveTab('junction')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'junction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Junction Visualization
            </button>
            <button
              onClick={() => setActiveTab('field')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'field'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Electric Field & Carriers
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'band' ? (
              <BandDiagramSimulator />
            ) : activeTab === 'junction' ? (
              <JunctionVisualization />
            ) : (
              <ElectricFieldSimulator />
            )}
          </div>
        </div>
        <footer className="text-center mt-8 pb-4">
          <p className="text-slate-500 text-sm">
            Created by <span className="font-semibold text-slate-700">Suryansh Singh, Ayush Jha, Tanisha Srivastava, Aditya Gullannavar, Sai Chaudhari, Adarsh Praveen</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            For further queries contact: <a href="mailto:Suryahssngh@gmail.com" className="hover:text-slate-600 transition-colors">f20230196@goa.bits-pilani.ac.in</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
