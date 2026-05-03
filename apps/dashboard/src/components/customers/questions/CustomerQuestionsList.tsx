/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { Card } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';
import { Input } from '@omnicore/ui/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@omnicore/ui/components/ui/dialog';
import { Label } from '@omnicore/ui/components/ui/label';
import { Textarea } from '@omnicore/ui/components/ui/textarea';
import { Search, MessageCircle, Send, Package, User, Clock, CheckCircle2 } from 'lucide-react';

type QuestionStatus = 'bekliyor' | 'cevaplandi' | 'kapali';

interface CustomerQuestion {
  id: string;
  platform: string;
  customerName: string;
  question: string;
  productName: string;
  status: QuestionStatus;
  createdAt: string;
}

const mockQuestions: CustomerQuestion[] = [
  { id: 'Q1', platform: 'Trendyol', customerName: 'Ayşe B.', question: 'Ürünün son kullanma tarihi nedir?', productName: 'Organik Bal 500g', status: 'bekliyor', createdAt: '2023-10-27 14:30' },
  { id: 'Q2', platform: 'Hepsiburada', customerName: 'Mehmet Y.', question: 'Kargo ne zaman çıkar?', productName: 'Kahve Makinesi', status: 'cevaplandi', createdAt: '2023-10-27 10:15' },
  { id: 'Q3', platform: 'Amazon TR', customerName: 'Ali K.', question: 'İade şartları nelerdir?', productName: 'Bluetooth Kulaklık', status: 'bekliyor', createdAt: '2023-10-26 16:45' },
  { id: 'Q4', platform: 'Trendyol', customerName: 'Fatma S.', question: 'Hangi kargo ile gönderiyorsunuz?', productName: 'Spor Ayakkabı', status: 'kapali', createdAt: '2023-10-25 09:00' },
];

const platformColors: Record<string, string> = {
  'Trendyol': 'bg-orange-100 text-orange-800',
  'Hepsiburada': 'bg-purple-100 text-purple-800',
  'Amazon TR': 'bg-blue-100 text-blue-800',
};

const statusConfig: Record<QuestionStatus, { label: string; cls: string; icon: React.ElementType }> = {
  bekliyor: { label: 'Bekliyor', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  cevaplandi: { label: 'Cevaplandı', cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  kapali: { label: 'Kapalı', cls: 'bg-slate-100 text-slate-800', icon: MessageCircle },
};

export function CustomerQuestionsList() {
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<CustomerQuestion | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = mockQuestions.filter(q =>
    search ? q.customerName.toLowerCase().includes(search.toLowerCase()) || q.productName.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleReply = () => {
    setSelectedQuestion(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-none border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 rounded-t-md gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Müşteri veya ürün ara..."
              className="pl-8 h-8 text-[13px] border-slate-200 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-8 text-[13px] border-slate-200">
              Tümünü Okundu İşaretle
            </Button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((q) => {
            const StatusIcon = statusConfig[q.status].icon;
            return (
              <div key={q.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${platformColors[q.platform] || 'bg-slate-100 text-slate-800'} border-0 shadow-none font-medium text-[11px] px-2 py-0.5`}>
                      {q.platform}
                    </Badge>
                    <Badge className={`${statusConfig[q.status].cls} border-0 shadow-none font-medium text-[11px] px-2 py-0.5 flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[q.status].label}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {q.createdAt}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-800 font-medium leading-relaxed">{q.question}</p>

                  <div className="flex items-center gap-4 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {q.customerName}</span>
                    <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {q.productName}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={q.status === 'bekliyor' ? 'default' : 'outline'}
                  className={`h-8 text-[12px] ${q.status === 'bekliyor' ? 'bg-slate-800 hover:bg-slate-700' : ''}`}
                  onClick={() => setSelectedQuestion(q)}
                >
                  {q.status === 'bekliyor' ? 'Yanıtla' : 'Detayı Gör'}
                </Button>
              </div>
            );
          })}
          {filtered.length === 0 && (
             <div className="p-8 text-center text-slate-500 text-[13px]">
               Soru bulunamadı.
             </div>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Soru Yanıtlama</DialogTitle>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-[13px]">
                <p className="text-slate-500 mb-1">Müşteri Sorusu:</p>
                <p className="font-medium text-slate-800">{selectedQuestion.question}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply" className="text-[13px] text-slate-600">Yanıtınız</Label>
                <Textarea
                  id="reply"
                  placeholder="Müşteriye yanıtınızı buraya yazın..."
                  className="min-h-[120px] text-[13px] resize-none"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedQuestion(null)} className="h-8 text-[13px]">
              İptal
            </Button>
            <Button size="sm" onClick={handleReply} className="h-8 text-[13px] bg-slate-800 hover:bg-slate-700" disabled={!replyText.trim() && selectedQuestion?.status === 'bekliyor'}>
              <Send className="h-4 w-4 mr-2" /> Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
