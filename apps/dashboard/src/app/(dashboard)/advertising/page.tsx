import { AdvertisingClient } from "../../../components/advertising/advertising-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reklam Yönetimi | Omnicore",
  description: "Tüm pazaryeri reklam kampanyalarınızı tek panelden yönetin, performansı izleyin.",
};

export default function AdvertisingPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reklam Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Tüm pazaryeri reklam kampanyalarınızı tek panelden yönetin, performansı izleyin
          </p>
        </div>
      </div>

      <AdvertisingClient />
    </div>
  );
}
