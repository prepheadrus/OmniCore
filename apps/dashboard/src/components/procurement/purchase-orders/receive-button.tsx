"use client"

import { useState } from "react"
import { Button } from "@omnicore/ui/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useChannel } from "../../../contexts/ChannelContext"

export function ReceiveButton({ purchaseOrderId }: { purchaseOrderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { selectedChannelId } = useChannel()

  const handleReceive = async (e: React.MouseEvent) => {
    e.stopPropagation() // prevent row expand
    if (!confirm("Bu fatura kalemlerini stoğa işlemek (Mal Kabul) istediğinize emin misiniz?")) {
      return
    }

    if (!selectedChannelId) {
      toast.error("Lütfen önce bir satış kanalı seçin.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/purchase-orders/${purchaseOrderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-channel-id": selectedChannelId,
        },
        body: JSON.stringify({ status: "RECEIVED" }),
      })

      if (!res.ok) {
        throw new Error("Mal kabul işlemi başarısız")
      }

      toast.success("Mal kabul işlemi başarıyla tamamlandı. Stoklar güncellendi.")
      router.refresh()
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={handleReceive}
      disabled={isLoading}
    >
      {isLoading ? "İşleniyor..." : "Mal Kabul Yap"}
    </Button>
  )
}
