"use client";

import { CampaignData } from "./columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@omnicore/ui/components/ui/sheet";
import { Button } from "@omnicore/ui/components/ui/button";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Input } from "@omnicore/ui/components/ui/input";
import { Label } from "@omnicore/ui/components/ui/label";
import { Play, Pause, Save, BarChart3, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";

interface CampaignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CampaignData | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
};

export function CampaignSheet({ isOpen, onClose, initialData }: CampaignSheetProps) {
  const isEditing = !!initialData;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] p-0 flex flex-col border-l border-slate-200 shadow-xl gap-0">
        <SheetHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? initialData.name : "Yeni Kampanya"}
              </SheetTitle>
              <SheetDescription className="text-sm text-slate-500">
                {isEditing
                  ? "Kampanya performans detaylarını ve ayarlarını görüntüleyin."
                  : "Pazar yerinde yeni bir reklam kampanyası başlatın."}
              </SheetDescription>
            </div>
            {isEditing && (
              <Badge variant="outline" className="shadow-none font-medium capitalize border-transparent bg-slate-100 text-slate-700">
                {initialData.marketplace}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isEditing ? (
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 border-b border-slate-100 bg-slate-50/50">
                <TabsList className="h-10 bg-transparent p-0 gap-6">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-0 h-10 text-slate-500 data-[state=active]:text-slate-900"
                  >
                    Genel Bakış
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-0 h-10 text-slate-500 data-[state=active]:text-slate-900"
                  >
                    Ayarlar
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" /> ROAS
                    </div>
                    <div className="text-2xl font-semibold text-slate-900">
                      {initialData.roas.toFixed(2)}x
                    </div>
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Dönüşüm</div>
                    <div className="text-2xl font-semibold text-slate-900">
                      {initialData.conversions.toLocaleString("tr-TR")}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">Bütçe Tüketimi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Harcanan: {formatCurrency(initialData.spent)}</span>
                      <span className="text-slate-900 font-medium">{formatCurrency(initialData.budget)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min((initialData.spent / initialData.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-right">
                      Günlük Bütçe: {formatCurrency(initialData.dailyBudget)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">Performans Metrikleri</h4>
                  <div className="rounded-md border border-slate-200 divide-y divide-slate-100">
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">Gösterim</span>
                      <span className="font-medium">{initialData.impressions.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">Tıklama</span>
                      <span className="font-medium">{initialData.clicks.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">CTR (Tıklama Oranı)</span>
                      <span className="font-medium">{initialData.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">CPC (Tıklama Başı Maliyet)</span>
                      <span className="font-medium">{formatCurrency(initialData.cpc)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="p-6 space-y-4 m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-slate-500">Kampanya Adı</Label>
                  <Input id="name" defaultValue={initialData.name} className="h-9 shadow-none bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-xs text-slate-500">Toplam Bütçe</Label>
                    <Input id="budget" type="number" defaultValue={initialData.budget} className="h-9 shadow-none bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyBudget" className="text-xs text-slate-500">Günlük Bütçe</Label>
                    <Input id="dailyBudget" type="number" defaultValue={initialData.dailyBudget} className="h-9 shadow-none bg-slate-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs text-slate-500">Başlangıç Tarihi</Label>
                    <Input id="startDate" type="date" defaultValue={initialData.startDate} className="h-9 shadow-none bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs text-slate-500">Bitiş Tarihi</Label>
                    <Input id="endDate" type="date" defaultValue={initialData.endDate} className="h-9 shadow-none bg-slate-50" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-6 space-y-4">
               {/* Create Form */}
               <div className="space-y-2">
                  <Label htmlFor="new-name" className="text-xs text-slate-500">Kampanya Adı</Label>
                  <Input id="new-name" placeholder="Örn: İlkbahar İndirimi" className="h-9 shadow-none bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Pazar Yeri</Label>
                  <select className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="amazon">Amazon</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-budget" className="text-xs text-slate-500">Toplam Bütçe (₺)</Label>
                    <Input id="new-budget" type="number" placeholder="0" className="h-9 shadow-none bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-daily" className="text-xs text-slate-500">Günlük Bütçe (₺)</Label>
                    <Input id="new-daily" type="number" placeholder="0" className="h-9 shadow-none bg-slate-50" />
                  </div>
                </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4 mt-auto">
          {isEditing ? (
             <>
              <Button
                variant="outline"
                className="h-9 shadow-none border-slate-200 text-slate-700 bg-white"
              >
                {initialData.status === "Aktif" ? (
                  <><Pause className="w-4 h-4 mr-2" /> Duraklat</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Devam Et</>
                )}
              </Button>
              <Button className="h-9 shadow-none bg-slate-900 hover:bg-slate-800">
                <Save className="w-4 h-4 mr-2" /> Kaydet
              </Button>
             </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} className="h-9 text-slate-500 hover:text-slate-900">İptal</Button>
              <Button className="h-9 shadow-none bg-slate-900 hover:bg-slate-800">Oluştur</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
