import React from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Button } from '@omnicore/ui/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function AiInsights() {
  return (
    <Card className="shadow-sm border-none bg-indigo-50/50 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

      <CardContent className="p-5 flex flex-col gap-3 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-[13px] font-semibold text-slate-800">Yapay Zeka İçgörüsü</h3>
        </div>

        <p className="text-[13px] text-slate-600 leading-relaxed">
          &quot;Kozmetik&quot; kategorisindeki ürünlerde haftasonu stok tükenme riski yüksek. Trendyol kanalında fiyatları %2 artırmak marjı koruyabilir.
        </p>

        <Button variant="link" className="mt-2 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors self-start flex items-center gap-1 group p-0 h-auto">
          Aksiyon Al <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
