import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, User, ChevronDown, BarChart, Info, Scale } from 'lucide-react';
import { historicalData } from '../data/historicalData';
import { User as UserType, Role } from '../types';

const MOCK_AUDITORS: UserType[] = [
  { id: 10, nama: 'Irwanto, S.Si., M.Pd.', nip: 'irwanto', role: Role.AUDITOR, status: 'aktif' },
  { id: 12, nama: 'Dr. Mardison S, S.TP., M.Si.', nip: 'mardison', role: Role.AUDITOR, status: 'aktif' },
];

const AuditorTrendView: React.FC = () => {
  const [selectedAuditorId, setSelectedAuditorId] = useState<number>(MOCK_AUDITORS[0].id);

  const trendData = useMemo(() => {
    const dataByCycle: { [key: string]: any } = {};

    historicalData.forEach(cycle => {
      dataByCycle[cycle.cycleName] = { name: cycle.cycleName };
      const instruments = cycle.instruments;

      instruments.forEach(inst => {
        if (!inst.auditor_ids || !inst.evaluations) return;
        const [id1, id2] = inst.auditor_ids;
        const score1 = inst.evaluations[String(id1)]?.skor_desk;
        const score2 = inst.evaluations[String(id2)]?.skor_desk;

        if (score1 !== undefined) {
          dataByCycle[cycle.cycleName][`auditor_${id1}`] = (dataByCycle[cycle.cycleName][`auditor_${id1}`] || []).concat(score1);
        }
        if (score2 !== undefined) {
          dataByCycle[cycle.cycleName][`auditor_${id2}`] = (dataByCycle[cycle.cycleName][`auditor_${id2}`] || []).concat(score2);
        }
      });
    });

    return Object.values(dataByCycle).map(cycle => {
      const newCycle: any = { name: cycle.name };
      MOCK_AUDITORS.forEach(auditor => {
        const scores = cycle[`auditor_${auditor.id}`];
        if (scores) {
          newCycle[auditor.nama] = scores.reduce((a:number, b:number) => a + b, 0) / scores.length;
        }
      });
      return newCycle;
    });
  }, []);

  const selectedAuditor = MOCK_AUDITORS.find(a => a.id === selectedAuditorId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Analisis Tren Kinerja Auditor</h2>
          <p className="text-sm text-slate-500">Evaluasi konsistensi dan kalibrasi tim auditor lintas siklus.</p>
        </div>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={selectedAuditorId} 
            onChange={e => setSelectedAuditorId(Number(e.target.value))}
            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
          >
            {MOCK_AUDITORS.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm uppercase text-slate-500 mb-4 flex items-center gap-2"><TrendingUp size={16}/> Tren Skor Rata-rata per Siklus</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                {MOCK_AUDITORS.map((auditor, i) => (
                   <Line key={auditor.id} type="monotone" dataKey={auditor.nama} stroke={i === 0 ? "#4f46e5" : "#10b981"} strokeWidth={3} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-sm uppercase text-slate-500 mb-4 flex items-center gap-2"><Scale size={16}/> Analisis Konsistensi</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="border-b text-xs text-slate-500">
                       <th className="p-2 text-left">Siklus</th>
                       <th className="p-2">Skor {selectedAuditor?.nama.split(',')[0]}</th>
                       <th className="p-2">Skor Rekan</th>
                       <th className="p-2">Selisih</th>
                    </tr>
                 </thead>
                 <tbody>
                    {historicalData.map(cycle => {
                       const instruments = cycle.instruments;
                       let totalScore = 0;
                       let peerScore = 0;
                       let count = 0;
                       
                       instruments.forEach(inst => {
                           if (!inst.auditor_ids || !inst.evaluations) return;
                           const peerId = inst.auditor_ids.find(id => id !== selectedAuditorId);
                           const myEval = inst.evaluations[String(selectedAuditorId)];
                           const peerEval = peerId ? inst.evaluations[String(peerId)] : null;

                           if(myEval?.skor_desk !== undefined && peerEval?.skor_desk !== undefined) {
                              totalScore += myEval.skor_desk;
                              peerScore += peerEval.skor_desk;
                              count++;
                           }
                       });

                       const avgMyScore = count > 0 ? totalScore/count : 0;
                       const avgPeerScore = count > 0 ? peerScore/count : 0;
                       const diff = Math.abs(avgMyScore - avgPeerScore);

                       return (
                          <tr key={cycle.cycleName} className="border-b last:border-none text-center">
                             <td className="p-3 font-bold text-left">{cycle.cycleName}</td>
                             <td className="p-3 font-bold text-indigo-600">{avgMyScore.toFixed(2)}</td>
                             <td className="p-3 font-bold text-emerald-600">{avgPeerScore.toFixed(2)}</td>
                             <td className={`p-3 font-bold ${diff > 0.5 ? 'text-rose-500' : 'text-slate-700'}`}>{diff.toFixed(2)}</td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorTrendView;