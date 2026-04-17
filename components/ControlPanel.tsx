import React, { useState } from 'react';
import { AnalysisStatus, AlternateInputType } from '../types';
import { Play, Sparkles, History, FileText, Image as ImageIcon, Link as LinkIcon, FileCheck, Layers } from 'lucide-react';

interface ControlPanelProps {
  onProcessCustom: (text: string, sourceDetails: string) => void;
  status: AnalysisStatus;
  actionLog: string[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onProcessCustom, status, actionLog }) => {
  const [transcriptInput, setTranscriptInput] = useState('');
  const [altInputType, setAltInputType] = useState<AlternateInputType>('Story Pitch');
  const [altInputValue, setAltInputValue] = useState('');

  const handleGenerateArticle = () => {
    if (!transcriptInput.trim()) return;
    onProcessCustom(transcriptInput, "Manual Transcript Input");
  };

  const handleGenerateOutputAutomation = () => {
    if (!altInputValue.trim()) return;
    onProcessCustom(altInputValue, `Automation Block: ${altInputType}`);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">

      {/* Primary Control Block */}
      <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase font-mono mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Layers size={16} /> CORE CONTROLS
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-xs font-mono text-slate-400 uppercase flex justify-between">
               Generate Transcript
               {transcriptInput.length > 0 && <span className="text-emerald-500">{transcriptInput.split(' ').length} words</span>}
             </label>
             <textarea 
               className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-sm text-slate-200 resize-none h-24 focus:ring-1 focus:ring-blue-500"
               placeholder="Paste transcript or raw article text here..."
               value={transcriptInput}
               onChange={(e) => setTranscriptInput(e.target.value)}
             />
             <div className="flex gap-2">
               <button 
                 onClick={handleGenerateArticle}
                 disabled={status.state === 'ANALYZING' || !transcriptInput.trim()}
                 className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
               >
                 {status.state === 'ANALYZING' ? 'PROCESSING...' : <><Play size={14} fill="currentColor"/> GENERATE ARTICLE</>}
               </button>
               <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm shadow-md">
                 <Sparkles size={14} /> RECOMMENDATIONS
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Details & Logs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Show Audit */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 flex flex-col h-40">
           <h3 className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center gap-2">
            <FileCheck size={14}/> SHOW AUDIT
           </h3>
           <div className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 overflow-y-auto font-mono text-xs text-slate-400">
             {status.state === 'IDLE' && 'System Ready. Awaiting Input.'}
             {status.state === 'ANALYZING' && 'Running v4.3 standards check...'}
             {status.state === 'COMPLETE' && <span className="text-emerald-400">Audit Passed. Content Generated.</span>}
             {status.state === 'ERROR' && <span className="text-red-400">{status.message}</span>}
           </div>
        </section>

        {/* Action Taken */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 flex flex-col h-40">
           <h3 className="text-xs font-bold text-slate-300 uppercase font-mono mb-2 flex items-center gap-2">
            <History size={14}/> ACTION TAKEN
           </h3>
           <div className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 overflow-y-auto font-mono text-xs space-y-1">
             {actionLog.length === 0 ? (
               <div className="text-slate-500 italic">No actions logged yet.</div>
             ) : (
               [...actionLog].reverse().map((log, i) => (
                 <div key={i} className="text-blue-300 pb-1 border-b border-slate-800 border-dashed last:border-0">{log}</div>
               ))
             )}
           </div>
        </section>
      </div>

      {/* AUTOMATION BLOCK (Block 2 replacement) */}
      <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-5 flex-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Layers size={80} />
        </div>
        <h3 className="text-sm relative z-10 font-bold text-slate-300 uppercase font-mono mb-4 border-b border-slate-700 pb-2">
          AUTOMATION BLOCK
        </h3>
        
        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1">Input Source</label>
            <select 
              value={altInputType} 
              onChange={(e) => setAltInputType(e.target.value as AlternateInputType)}
              className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="Story Pitch">Story Pitch / Raw Text</option>
              <option value="URL">External URL</option>
              <option value="Image Upload">Image Upload</option>
              <option value="PDF Upload">PDF Upload</option>
            </select>
          </div>

          <div>
            {altInputType === 'Story Pitch' && (
              <textarea
                className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-3 text-slate-200 text-sm resize-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter Story Pitch or unstructured data..."
                value={altInputValue}
                onChange={(e) => setAltInputValue(e.target.value)}
              />
            )}
            {altInputType === 'URL' && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded p-2">
                <LinkIcon className="text-slate-400 ml-2" size={16} />
                <input
                  type="url"
                  className="w-full bg-transparent border-0 focus:ring-0 text-slate-200 text-sm p-1"
                  placeholder="https://"
                  value={altInputValue}
                  onChange={(e) => setAltInputValue(e.target.value)}
                />
              </div>
            )}
            {(altInputType === 'Image Upload' || altInputType === 'PDF Upload') && (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded cursor-pointer bg-slate-900 hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {altInputType === 'Image Upload' ? <ImageIcon className="w-6 h-6 mb-2 text-slate-400" /> : <FileCheck className="w-6 h-6 mb-2 text-slate-400" />}
                    <p className="text-xs text-slate-400"><span className="font-semibold">Click to upload</span></p>
                  </div>
                  <input type="file" className="hidden" accept={altInputType === 'Image Upload' ? "image/*" : "application/pdf"} />
                </label>
              </div>
            )}
          </div>

          <button 
             onClick={handleGenerateOutputAutomation}
             disabled={status.state === 'ANALYZING' || (!altInputValue.trim() && altInputType !== 'Image Upload' && altInputType !== 'PDF Upload')}
             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]"
           >
             {status.state === 'ANALYZING' ? 'PROCESSING...' : <><Play size={14} fill="currentColor"/> GENERATE OUTPUT</>}
           </button>
        </div>
      </section>

    </div>
  );
};

export default ControlPanel;
