import React from 'react';
import { LiveChatInterface } from '../../../../components/customers/chat/LiveChatInterface';

export default function LiveChatPage() {
  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Canlı Destek</h2>
          <p className="text-[13px] text-slate-500">Müşterilerinizle anlık iletişim kurun ve taleplerini hızlıca çözün.</p>
        </div>
      </div>
      <LiveChatInterface />
    </div>
  );
}
