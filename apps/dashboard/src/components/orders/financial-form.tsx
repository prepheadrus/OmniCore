"use client";

import * as React from "react";
import { OrderData } from "./columns";
import { Input } from "@omnicore/ui/components/ui/input";
import { Button } from "@omnicore/ui/components/ui/button";
import { Label } from "@omnicore/ui/components/ui/label";
import { toast } from "sonner";
import { Loader2, Calculator } from "lucide-react";

interface FinancialFormProps {
  order: OrderData;
  onUpdate: (updatedOrder: any) => void;
}

export function FinancialForm({ order, onUpdate }: FinancialFormProps) {
  const [costPrice, setCostPrice] = React.useState(order.costPrice || "0");
  const [commissionAmount, setCommissionAmount] = React.useState(order.commissionAmount || "0");
  const [shippingCost, setShippingCost] = React.useState(order.shippingCost || "0");
  const [taxAmount, setTaxAmount] = React.useState(order.taxAmount || "0");
  const [discountAmount, setDiscountAmount] = React.useState(order.discountAmount || "0");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCalculate = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        costPrice: parseFloat(costPrice) || 0,
        commissionAmount: parseFloat(commissionAmount) || 0,
        shippingCost: parseFloat(shippingCost) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
      };

      const response = await fetch(`/api/orders/${order.id}/finance/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate finance');
      }

      const result = await response.json();
      toast.success("Kârlılık güncellendi");

      // Map the returned data back to the format the table expects
      onUpdate({
        ...order,
        netProfit: result.netProfit,
        costPrice: result.costPrice,
        commissionAmount: result.commissionAmount,
        shippingCost: result.shippingCost,
        taxAmount: result.taxAmount,
        discountAmount: result.discountAmount,
      });

    } catch (error) {
      console.error("Error calculating net profit:", error);
      toast.error("Hesaplama sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-slate-50 border rounded-md shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4 items-end animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-1">
        <Label htmlFor={`cost-${order.id}`} className="text-xs text-slate-500">Ürün Maliyeti (₺)</Label>
        <Input
          id={`cost-${order.id}`}
          type="number"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className="h-8 text-sm"
          step="0.01"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`comm-${order.id}`} className="text-xs text-slate-500">Komisyon (₺)</Label>
        <Input
          id={`comm-${order.id}`}
          type="number"
          value={commissionAmount}
          onChange={(e) => setCommissionAmount(e.target.value)}
          className="h-8 text-sm"
          step="0.01"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`ship-${order.id}`} className="text-xs text-slate-500">Kargo (₺)</Label>
        <Input
          id={`ship-${order.id}`}
          type="number"
          value={shippingCost}
          onChange={(e) => setShippingCost(e.target.value)}
          className="h-8 text-sm"
          step="0.01"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`tax-${order.id}`} className="text-xs text-slate-500">Vergi (₺)</Label>
        <Input
          id={`tax-${order.id}`}
          type="number"
          value={taxAmount}
          onChange={(e) => setTaxAmount(e.target.value)}
          className="h-8 text-sm"
          step="0.01"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`disc-${order.id}`} className="text-xs text-slate-500">İndirim (₺)</Label>
        <Input
          id={`disc-${order.id}`}
          type="number"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(e.target.value)}
          className="h-8 text-sm"
          step="0.01"
        />
      </div>

      <div className="flex justify-end h-8">
        <Button
          size="sm"
          onClick={handleCalculate}
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white hover:bg-slate-800"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Calculator className="h-4 w-4 mr-2" />
          )}
          Hesapla
        </Button>
      </div>
    </div>
  );
}
