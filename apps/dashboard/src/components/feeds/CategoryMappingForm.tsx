import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import type { CategoryMapping } from './types';

interface CategoryMappingFormProps {
  mappings: CategoryMapping[];
  onAddMapping: (source: string, sourceCat: string, target: string, targetCat: string) => Promise<void>;
}

export default function CategoryMappingForm({ mappings, onAddMapping }: CategoryMappingFormProps) {
  const [cmSource, setCmSource] = useState('');
  const [cmSourceCat, setCmSourceCat] = useState('');
  const [cmTarget, setCmTarget] = useState('');
  const [cmTargetCat, setCmTargetCat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!cmSource.trim() || !cmSourceCat.trim() || !cmTarget.trim() || !cmTargetCat.trim()) return;
    setIsSubmitting(true);
    await onAddMapping(cmSource, cmSourceCat, cmTarget, cmTargetCat);
    setCmSource('');
    setCmSourceCat('');
    setCmTarget('');
    setCmTargetCat('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#ffffff] rounded-2xl p-8 shadow-[0_8px_30px_rgba(45,52,53,0.06)]">
      <div className="flex items-center gap-3 mb-8 border-b border-[#adb3b4]/15 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Settings className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#2d3435]">Kategori Eşleştirme</h2>
      </div>

      {mappings.length === 0 ? (
        <div className="text-center py-12 text-[#5f5e61] bg-[#f2f4f4] rounded-xl mb-8">
          Henüz kategori eşleştirmesi yok. Aşağıdaki formu kullanarak ekleyebilirsiniz.
        </div>
      ) : (
        <div className="rounded-xl border border-[#adb3b4]/15 overflow-hidden mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f2f4f4] text-[#5f5e61] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Kaynak (Mağaza)</th>
                <th className="px-6 py-4 font-medium">Kaynak Kategori</th>
                <th className="px-6 py-4 font-medium">Hedef (Pazaryeri)</th>
                <th className="px-6 py-4 font-medium">Hedef Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#adb3b4]/15">
              {mappings.map((cm) => (
                <tr key={cm.id} className="hover:bg-[#f9f9f9] transition-colors">
                  <td className="px-6 py-4 text-[#2d3435] font-medium">{cm.source}</td>
                  <td className="px-6 py-4 text-[#5f5e61]">{cm.sourceCat}</td>
                  <td className="px-6 py-4 text-[#2d3435] font-medium">{cm.target}</td>
                  <td className="px-6 py-4 text-[#5f5e61]">{cm.targetCat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add mapping form */}
      <div className="rounded-xl bg-[#f2f4f4] p-6">
        <h4 className="text-sm font-semibold text-[#2d3435] mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#5f5e61]" />
          Yeni Eşleştirme Ekle
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5f5e61]">Kaynak (Mağaza)</label>
            <input
              type="text"
              placeholder="örn: Benim Mağazam"
              className="w-full rounded-lg bg-[#ffffff] border border-transparent px-3 py-2.5 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:outline-none transition-colors"
              value={cmSource}
              onChange={(e) => setCmSource(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5f5e61]">Kaynak Kategori</label>
            <input
              type="text"
              placeholder="örn: Elektronik > Telefon"
              className="w-full rounded-lg bg-[#ffffff] border border-transparent px-3 py-2.5 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:outline-none transition-colors"
              value={cmSourceCat}
              onChange={(e) => setCmSourceCat(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5f5e61]">Hedef (Pazaryeri)</label>
            <input
              type="text"
              placeholder="örn: Trendyol"
              className="w-full rounded-lg bg-[#ffffff] border border-transparent px-3 py-2.5 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:outline-none transition-colors"
              value={cmTarget}
              onChange={(e) => setCmTarget(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5f5e61]">Hedef Kategori</label>
            <input
              type="text"
              placeholder="örn: Cep Telefonu"
              className="w-full rounded-lg bg-[#ffffff] border border-transparent px-3 py-2.5 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:outline-none transition-colors"
              value={cmTargetCat}
              onChange={(e) => setCmTargetCat(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            disabled={!cmSource.trim() || !cmSourceCat.trim() || !cmTarget.trim() || !cmTargetCat.trim() || isSubmitting}
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-[#ffffff] px-4 py-2 text-sm font-semibold text-[#2d3435] shadow-sm ring-1 ring-inset ring-[#adb3b4]/30 hover:bg-[#f9f9f9] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Kaydediliyor...' : 'Eşleştirmeyi Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
