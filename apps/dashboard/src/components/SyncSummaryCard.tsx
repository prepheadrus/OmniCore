"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

export default function SyncSummaryCard() {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800 text-lg">Veri Senkronizasyonu</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Ürün stok, fiyat ve sipariş verilerinizi pazar yerleriyle eşitlemek için senkronizasyon yöneticisini kullanın.
        </p>
      </div>
      <Link
        href="/sync"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        Yöneticiye Git <ArrowRight size={16} />
      </Link>
    </div>
  );
}
