import React from 'react';
import { CustomerQuestionsList } from '../../../../components/customers/questions/CustomerQuestionsList';

export default function CustomerQuestionsPage() {
  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Müşteri Soruları</h2>
          <p className="text-[13px] text-slate-500">Pazar yerlerinden gelen tüm müşteri sorularını tek ekrandan yanıtlayın.</p>
        </div>
      </div>
      <CustomerQuestionsList />
    </div>
  );
}
