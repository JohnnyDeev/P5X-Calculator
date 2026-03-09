import React, { useState, useMemo } from 'react';
import { Calculator, Info, Shield, Sword, Target, Zap } from 'lucide-react';
import {
  calcFinalDamage,
  DamageInput,
  normalizePercent,
  WeaknessType
} from './calculator';

type FormState = {
  // Character
  totalAttack: string;
  damageMultPercent: string;
  elementalMultPercent: string;
  critMultPercent: string;
  critBasePercent: string;

  // Skill
  skillCoeffPercent: string;
  finalDamageBonusPercent: string;
  otherMultipliers: string;
  isCritical: boolean;

  // Enemy
  enemyDefenseValue: string;
  increasedDamageTakenPercent: string;
  defenseReductionPercent: string;
  piercePercent: string;
  additionalDefenseCoeffPercent: string;
  windsweptPercent: string;
  weaknessType: WeaknessType;
};

const INITIAL_STATE: FormState = {
  totalAttack: '3457',
  damageMultPercent: '38.3',
  elementalMultPercent: '10',
  critMultPercent: '220.6',
  critBasePercent: '40', // Base from Lufelnet

  skillCoeffPercent: '140', // Exemplo: Mapsio
  finalDamageBonusPercent: '0',
  otherMultipliers: '',
  isCritical: true,

  enemyDefenseValue: '1200',
  increasedDamageTakenPercent: '0',
  defenseReductionPercent: '0',
  piercePercent: '0',
  additionalDefenseCoeffPercent: '0',
  windsweptPercent: '0',
  weaknessType: 'weak',
};

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const parsedInput = useMemo<DamageInput>(() => {
    const parseNum = (val: string) => Number(val) || 0;
    const parsePct = (val: string) => normalizePercent(Number(val) || 0);
    
    const otherMults = form.otherMultipliers
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    return {
      totalAttack: parseNum(form.totalAttack),
      damageMultPercent: parsePct(form.damageMultPercent),
      elementalMultPercent: parsePct(form.elementalMultPercent),
      critMultPercent: parsePct(form.critMultPercent),
      critBasePercent: parsePct(form.critBasePercent),

      skillCoeffPercent: parsePct(form.skillCoeffPercent),
      finalDamageBonusPercent: parsePct(form.finalDamageBonusPercent),
      otherMultipliers: otherMults,
      isCritical: form.isCritical,

      enemyDefenseValue: parseNum(form.enemyDefenseValue),
      increasedDamageTakenPercent: parsePct(form.increasedDamageTakenPercent),
      defenseReductionPercent: parsePct(form.defenseReductionPercent),
      piercePercent: parsePct(form.piercePercent),
      additionalDefenseCoeffPercent: parsePct(form.additionalDefenseCoeffPercent),
      windsweptPercent: parsePct(form.windsweptPercent),
      weaknessType: form.weaknessType,
    };
  }, [form]);

  const result = useMemo(() => calcFinalDamage(parsedInput), [parsedInput]);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex items-center gap-3 border-b-2 border-[#141414] pb-4">
          <Calculator className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter">P5X Damage Calculator</h1>
            <p className="font-mono text-sm opacity-70"></p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Character Stats */}
            <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_#141414]">
              <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5" /> 1. Character Stats (From Screen)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputGroup label="Total Attack" name="totalAttack" value={form.totalAttack} onChange={handleChange} />
                <InputGroup label="Damage Mult. (%)" name="damageMultPercent" value={form.damageMultPercent} onChange={handleChange} />
                <InputGroup label="Elemental Mult. (%)" name="elementalMultPercent" value={form.elementalMultPercent} onChange={handleChange} />
                <InputGroup label="Crit Mult. (%)" name="critMultPercent" value={form.critMultPercent} onChange={handleChange} />
              </div>
              <div className="mt-4 pt-4 border-t border-[#141414]/10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-full md:w-1/4">
                  <InputGroup label="Crit Base (%) (Hidden)" name="critBasePercent" value={form.critBasePercent} onChange={handleChange} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-[#141414] text-white px-4 py-2 mt-4 md:mt-0">
                  <input 
                    type="checkbox" 
                    name="isCritical" 
                    checked={form.isCritical} 
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#00FF00]"
                  />
                  <span className="font-mono text-sm uppercase font-bold">Is Critical Hit?</span>
                </label>
              </div>
            </section>

            {/* 2. Skill & Combat */}
            <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_#141414]">
              <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> 2. Skill & Combat Multipliers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputGroup label="Skill Coeff (%)" name="skillCoeffPercent" value={form.skillCoeffPercent} onChange={handleChange} />
                <InputGroup label="Final DMG Bonus (%)" name="finalDamageBonusPercent" value={form.finalDamageBonusPercent} onChange={handleChange} />
                <InputGroup label="Other Mults (comma sep)" name="otherMultipliers" value={form.otherMultipliers} onChange={handleChange} />
              </div>
            </section>

            {/* 3. Enemy & Debuffs */}
            <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_#141414]">
              <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> 3. Enemy & Debuffs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InputGroup label="Enemy Defense Value" name="enemyDefenseValue" value={form.enemyDefenseValue} onChange={handleChange} />
                <InputGroup label="Enemy DMG Taken Inc (%)" name="increasedDamageTakenPercent" value={form.increasedDamageTakenPercent} onChange={handleChange} />
                <InputGroup label="Def Reduction (%)" name="defenseReductionPercent" value={form.defenseReductionPercent} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputGroup label="Pierce (%)" name="piercePercent" value={form.piercePercent} onChange={handleChange} />
                <InputGroup label="Add. Def Coeff (%)" name="additionalDefenseCoeffPercent" value={form.additionalDefenseCoeffPercent} onChange={handleChange} />
                <InputGroup label="Windswept (%)" name="windsweptPercent" value={form.windsweptPercent} onChange={handleChange} />
                
                <div className="flex flex-col">
                  <label className="font-mono text-xs font-bold uppercase mb-1">Weakness Type</label>
                  <select 
                    name="weaknessType" 
                    value={form.weaknessType} 
                    onChange={handleChange}
                    className="border-2 border-[#141414] p-2 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]"
                  >
                    <option value="weak">Weakness (120%)</option>
                    <option value="normal">Normal (100%)</option>
                    <option value="resistance">Resistance (50%)</option>
                  </select>
                </div>
              </div>
            </section>

          </div>

          {/* Results Section */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-[#141414] text-[#E4E3E0] p-6 border border-[#141414] shadow-[4px_4px_0px_0px_#141414]">
              <h2 className="text-2xl font-bold uppercase mb-6 border-b border-[#E4E3E0]/30 pb-4">
                Results
              </h2>
              
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-xs uppercase opacity-70 mb-1">Final Damage Range</p>
                  <div className="text-4xl font-bold tracking-tighter text-[#00FF00]">
                    {Math.floor(result.minDamage).toLocaleString()} ~ {Math.ceil(result.maxDamage).toLocaleString()}
                  </div>
                  <p className="font-mono text-sm mt-2 opacity-80">
                    Base: {Math.floor(result.baseDamage).toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-[#E4E3E0]/30 pt-6">
                  <p className="font-mono text-xs uppercase opacity-70 mb-4">Calculation Breakdown</p>
                  <div className="space-y-2 font-mono text-sm">
                    <ResultRow label="A. Attack Power" value={result.A} />
                    <ResultRow label="B. Damage Bonus" value={result.B} />
                    <ResultRow label="C. Enemy Defense" value={result.C} />
                    <ResultRow label="D. Critical" value={result.D} />
                    <ResultRow label="E. Skill Coeff" value={result.E} />
                    <ResultRow label="F. Weakness Coeff" value={result.F} />
                    <ResultRow label="G. Final DMG Bonus" value={result.G} />
                    <ResultRow label="H. Other Coeffs" value={result.H} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex flex-col">
      <label className="font-mono text-xs font-bold uppercase mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border-2 border-[#141414] p-2 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414] transition-shadow"
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#E4E3E0]/10">
      <span className="opacity-80">{label}</span>
      <span className="font-bold">{value.toFixed(4)}</span>
    </div>
  );
}
