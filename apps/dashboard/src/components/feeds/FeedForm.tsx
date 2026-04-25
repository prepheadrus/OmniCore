import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';

interface FeedFormProps {
  onSave: (data: {
    name: string;
    source: string;
    sourceUrl: string;
    format: string;
    schedule: string;
  }) => Promise<void>;
}

export default function FeedForm({ onSave }: FeedFormProps) {
  const [formName, setFormName] = useState('');
  const [formSource, setFormSource] = useState('url');
  const [formUrl, setFormUrl] = useState('');
  const [formFormat, setFormFormat] = useState('xml');
  const [formSchedule, setFormSchedule] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    await onSave({
      name: formName,
      source: formSource,
      sourceUrl: formUrl,
      format: formFormat,
      schedule: formSchedule,
    });
    
    // Reset form after saving
    setFormName('');
    setFormUrl('');
    setIsSubmitting(false);
  };

  const defaultMappings = [
    { source: 'title', target: 'name' },
    { source: 'price', target: 'price' },
    { source: 'category', target: 'category' },
    { source: 'description', target: 'description' },
    { source: 'image_link', target: 'images' },
    { source: 'link', target: 'url' },
    { source: 'gtin', target: 'barcode' },
    { source: 'stock', target: 'stock' },
  ];

  return (
    <div className="bg-[#ffffff] rounded-2xl p-8 shadow-[0_8px_30px_rgba(45,52,53,0.06)] max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8 border-b border-[#adb3b4]/15 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f4]">
          <Upload className="h-5 w-5 text-[#5f5e61]" />
        </div>
        <h2 className="text-xl font-semibold text-[#2d3435]">Yeni Feed Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#5f5e61]">Feed Adı</label>
          <input
            type="text"
            className="w-full rounded-lg bg-[#f2f4f4] border border-transparent px-4 py-3 text-sm text-[#2d3435] placeholder:text-[#5f5e61]/50 focus:border-[#5f5e61]/30 focus:bg-[#ffffff] focus:outline-none transition-colors"
            placeholder="örn: Trendyol XML Feed"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5f5e61]">Kaynak Türü</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg bg-[#f2f4f4] border border-transparent px-4 py-3 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:bg-[#ffffff] focus:outline-none transition-colors cursor-pointer"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
              >
                <option value="url">URL Yükleme</option>
                <option value="upload">Dosya Yükleme</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5f5e61]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5f5e61]">Format</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg bg-[#f2f4f4] border border-transparent px-4 py-3 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:bg-[#ffffff] focus:outline-none transition-colors cursor-pointer"
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
              >
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5f5e61]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {formSource === 'url' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5f5e61]">URL</label>
            <input
              type="url"
              className="w-full rounded-lg bg-[#f2f4f4] border border-transparent px-4 py-3 text-sm text-[#2d3435] placeholder:text-[#5f5e61]/50 focus:border-[#5f5e61]/30 focus:bg-[#ffffff] focus:outline-none transition-colors"
              placeholder="https://example.com/feed.xml"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              required={formSource === 'url'}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#5f5e61]">Çalışma Planı</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg bg-[#f2f4f4] border border-transparent px-4 py-3 text-sm text-[#2d3435] focus:border-[#5f5e61]/30 focus:bg-[#ffffff] focus:outline-none transition-colors cursor-pointer"
              value={formSchedule}
              onChange={(e) => setFormSchedule(e.target.value)}
            >
              <option value="manual">Manuel</option>
              <option value="30min">30 Dakikada Bir</option>
              <option value="hourly">Saatlik</option>
              <option value="daily">Günlük</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5f5e61]">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-[#5f5e61]">Alan Eşleştirme (Önizleme)</label>
          <div className="rounded-xl bg-[#f2f4f4] p-5 space-y-3">
            {defaultMappings.map((m) => (
              <div key={m.source} className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center rounded-md bg-[#ffffff] px-2.5 py-1 text-xs font-mono font-medium text-[#2d3435] shadow-sm">
                  {m.source}
                </span>
                <span className="text-[#adb3b4]">→</span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-700">
                  {m.target}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={!formName.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5f5e61] to-[#535255] px-6 py-3.5 text-sm font-semibold text-[#faf7fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform active:scale-[0.98] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Kaydediliyor...' : 'Feed\'i Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
