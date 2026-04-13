'use client';

import React, { useState } from 'react';
import { Zap, Shield, TrendingUp, AlertTriangle, PlayCircle, PauseCircle } from 'lucide-react';

type PricingRule = {
  id: string;
  productName: string;
  strategy: 'Agresif (Buybox)' | 'Dengeli (Eşitle)' | 'Defansif (Kâr Koru)';
  minMargin: number;
  limitAction: 'Satışı Durdur' | 'Uyarı Gönder' | 'Maliyete Sabitle';
  isActive: boolean;
};

const MOCK_RULES: PricingRule[] = [
  {
    id: '1',
    productName: 'Apple iPhone 15 Pro Kılıf',
    strategy: 'Agresif (Buybox)',
    minMargin: 12,
    limitAction: 'Satışı Durdur',
    isActive: true,
  },
  {
    id: '2',
    productName: 'Samsung Galaxy S24 Ultra Ekran Koruyucu',
    strategy: 'Dengeli (Eşitle)',
    minMargin: 15,
    limitAction: 'Uyarı Gönder',
    isActive: true,
  },
  {
    id: '3',
    productName: 'MacBook Air M3 Şarj Adaptörü',
    strategy: 'Defansif (Kâr Koru)',
    minMargin: 25,
    limitAction: 'Maliyete Sabitle',
    isActive: false,
  },
];

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>(MOCK_RULES);

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getStrategyIcon = (strategy: PricingRule['strategy']) => {
    switch (strategy) {
      case 'Agresif (Buybox)':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Dengeli (Eşitle)':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'Defansif (Kâr Koru)':
        return <Shield className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Otonom Fiyatlandırma Motoru</h1>
        <p className="text-slate-500 mt-2 text-lg">Rakiplerinizin fiyat değişimlerine anında ve kârlı bir şekilde yanıt verin.</p>
      </div>

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column (Rule Creator Form) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-slate-900">Yeni Kural Oluştur</h2>

          <form className="flex flex-col gap-5">
            {/* Minimum Margin */}
            <div className="flex flex-col gap-2">
              <label htmlFor="minMargin" className="text-sm font-medium text-slate-700">
                Minimum Kâr Marjı (%)
              </label>
              <input
                type="number"
                id="minMargin"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                placeholder="Örn: 15"
                defaultValue={15}
              />
            </div>

            {/* Pricing Strategy */}
            <div className="flex flex-col gap-2">
              <label htmlFor="strategy" className="text-sm font-medium text-slate-700">
                Fiyatlandırma Stratejisi
              </label>
              <select
                id="strategy"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                defaultValue="Agresif (Buybox)"
              >
                <option value="Agresif (Buybox)">Agresif (Buybox&apos;ı al)</option>
                <option value="Dengeli (Eşitle)">Dengeli (Rakibe Eşitle)</option>
                <option value="Defansif (Kâr Koru)">Defansif (Kârı Koru)</option>
              </select>
            </div>

            {/* Below Limit Action */}
            <div className="flex flex-col gap-2">
              <label htmlFor="limitAction" className="text-sm font-medium text-slate-700">
                Alt Limit Altına Düşüldüğünde
              </label>
              <select
                id="limitAction"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                defaultValue="Satışı Durdur"
              >
                <option value="Satışı Durdur">Satışı durdur</option>
                <option value="Uyarı Gönder">Uyarı gönder</option>
                <option value="Maliyete Sabitle">Maliyete sabitle</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="mt-2">
              <button
                type="button"
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              >
                Kuralı Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (Active Rules Summary) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Aktif Kurallar Özeti</h2>

          <div className="flex flex-col gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-xl shadow-sm border p-5 transition-all duration-200 ${
                  rule.isActive ? 'border-slate-200' : 'border-slate-100 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{rule.productName}</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {getStrategyIcon(rule.strategy)}
                        {rule.strategy}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        Min. Kâr: <span className="font-semibold text-slate-900">%{rule.minMargin}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Aksiyon: <span className="text-slate-700 font-medium">{rule.limitAction}</span>
                    </div>
                  </div>

                  {/* Custom Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => toggleRuleStatus(rule.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      rule.isActive ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={rule.isActive}
                  >
                    <span className="sr-only">Kuralı {rule.isActive ? 'Kapat' : 'Aç'}</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
