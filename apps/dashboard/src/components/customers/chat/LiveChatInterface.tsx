/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';
import { Input } from '@omnicore/ui/components/ui/input';
import { Textarea } from '@omnicore/ui/components/ui/textarea';
import { ScrollArea } from '@omnicore/ui/components/ui/scroll-area';
import { Search, Send, CheckCircle, Clock, PauseCircle, Phone, Mail, Sparkles, Bot, Tag, Plus, MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'active' | 'waiting' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

const mockConversations: Conversation[] = [
  { id: '1', customerName: 'Ali Yılmaz', customerEmail: 'ali@example.com', lastMessage: 'Kargom nerede kaldı?', lastMessageTime: '10:42', status: 'active', priority: 'high', unreadCount: 2 },
  { id: '2', customerName: 'Ayşe Demir', customerEmail: 'ayse@example.com', lastMessage: 'Ürün rengi resimdeki gibi mi?', lastMessageTime: '09:15', status: 'waiting', priority: 'normal', unreadCount: 0 },
  { id: '3', customerName: 'Can Özkan', customerEmail: 'can@example.com', lastMessage: 'Teşekkürler, çok yardımcı oldunuz.', lastMessageTime: 'Dün', status: 'closed', priority: 'low', unreadCount: 0 },
];

const mockMessages: ChatMessage[] = [
  { id: 'm1', sender: 'customer', content: 'Merhaba, siparişim hala kargoya verilmedi görünüyor.', timestamp: '10:30' },
  { id: 'm2', sender: 'agent', content: 'Merhaba Ali Bey, hemen kontrol ediyorum.', timestamp: '10:32' },
  { id: 'm3', sender: 'system', content: 'Sipariş durumu: Hazırlanıyor.', timestamp: '10:33' },
  { id: 'm4', sender: 'agent', content: 'Siparişiniz depoda paketleme aşamasındadır. Bugün kargoya teslim edilecektir.', timestamp: '10:35' },
  { id: 'm5', sender: 'customer', content: 'Kargom nerede kaldı?', timestamp: '10:42' },
];

const priorityConfig = {
  urgent: { label: 'Acil', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { label: 'Yüksek', cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  normal: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  low: { label: 'Düşük', cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
};

const statusConfig = {
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-700' },
  waiting: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Kapalı', cls: 'bg-slate-100 text-slate-600' },
};

export function LiveChatInterface() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'closed'>('all');

  const filteredConvs = mockConversations.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Sidebar (Conversations List) */}
      <Card className="w-80 flex flex-col shadow-none border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 rounded-t-md">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <Input placeholder="Sohbet ara..." className="pl-8 h-8 text-[13px] bg-white border-slate-200" />
          </div>
          <div className="flex gap-1">
            {['all', 'active', 'waiting', 'closed'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f as any)}
                className={`h-7 text-[11px] px-2 flex-1 ${filter === f ? 'bg-slate-800' : 'text-slate-600 border-slate-200'}`}
              >
                {f === 'all' ? 'Tümü' : statusConfig[f as keyof typeof statusConfig].label}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConvs.map(conv => (
            <div
              key={conv.id}
              className={`p-3 border-b border-slate-100 cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-slate-50 border-l-2 border-l-slate-800' : 'hover:bg-slate-50/50 border-l-2 border-l-transparent'}`}
              onClick={() => setActiveConv(conv)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-[13px] text-slate-800">{conv.customerName}</span>
                <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
              </div>
              <p className="text-[12px] text-slate-500 line-clamp-1 mb-2">{conv.lastMessage}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${priorityConfig[conv.priority].dot}`} title={`Öncelik: ${priorityConfig[conv.priority].label}`} />
                  <Badge className={`${statusConfig[conv.status].cls} border-0 px-1.5 text-[10px] py-0 shadow-none font-medium h-4 leading-4`}>
                    {statusConfig[conv.status].label}
                  </Badge>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-slate-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-none border-slate-200">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                  {activeConv.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-slate-800">{activeConv.customerName}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {activeConv.customerEmail}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[12px] border-slate-200">
                  Siparişi Gör
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500">
                  <PauseCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-4 bg-white">
              <div className="space-y-4">
                {mockMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : msg.sender === 'system' ? 'justify-center' : 'justify-end'}`}>
                    {msg.sender === 'system' ? (
                      <div className="bg-slate-100 text-slate-500 text-[11px] px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> {msg.content}
                      </div>
                    ) : (
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'customer' ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-slate-800 text-white rounded-tr-sm'}`}>
                        <p className="text-[13px] leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'customer' ? 'text-slate-400' : 'text-slate-300'}`}>{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* AI Assistant Banner */}
            <div className="px-4 py-2 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700">
                <Bot className="h-4 w-4" />
                <span className="text-[12px] font-medium">Yapay Zeka Asistanı yanıt öneriyor:</span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 text-[11px] text-purple-700 hover:bg-purple-100 p-0 px-2" onClick={() => setMessage('Siparişiniz depoda paketleme aşamasındadır. Bugün kargoya teslim edilecektir.')}>
                Uygula
              </Button>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white rounded-b-md">
              <div className="flex gap-2 mb-2">
                {['Sipariş durumunuz', 'İade süreci', 'Biraz bekleteceğim'].map(q => (
                  <Badge key={q} variant="outline" className="text-[10px] font-medium text-slate-500 border-slate-200 cursor-pointer hover:bg-slate-50 shadow-none" onClick={() => setMessage(q)}>
                    {q}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-200 text-slate-500 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
                <Textarea
                  placeholder="Mesajınızı yazın..."
                  className="min-h-[36px] h-9 resize-none py-2 text-[13px] border-slate-200 shadow-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button size="sm" className="h-9 w-12 shrink-0 bg-slate-800 hover:bg-slate-700">
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-[14px]">Sohbeti görüntülemek için sol taraftan bir müşteri seçin.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
