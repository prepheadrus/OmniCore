import { AdvertisingClient } from "../../../components/advertising/advertising-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reklam Yönetimi | Omnicore",
  description: "Pazar yeri reklam kampanyalarınızı tek bir merkezden yönetin.",
};

export default function AdvertisingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reklam Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Pazar yeri kampanyalarınızı, bütçelerinizi ve ROAS performansınızı yönetin.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-md border border-slate-200 flex flex-col shadow-none overflow-hidden">
         <AdvertisingClient />
      </div>
    </div>
  );
}
