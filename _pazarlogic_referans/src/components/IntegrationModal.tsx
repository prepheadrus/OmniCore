import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  platform: string;
  status: string;
}

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onSuccess: () => void;
}

export function IntegrationModal({ isOpen, onClose, integration, onSuccess }: IntegrationModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    shopUrl: '',
  });

  if (!integration) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.apiKey || !formData.apiSecret) {
      toast({ title: 'Hata', description: 'API Key ve Secret zorunludur.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/integrations/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: integration.platform,
          name: integration.name,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error('Baglanti basarisiz');

      toast({ title: 'Basarili', description: `${integration.name} entegrasyonu tamamlandi.` });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: 'Hata', description: 'Entegrasyon sirasinda bir hata olustu.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{integration.name} Entegrasyonu</DialogTitle>
          <DialogDescription>
            {integration.name} API bilgilerinizi girerek entegrasyonu tamamlayin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key / Client ID</Label>
            <Input id="apiKey" name="apiKey" value={formData.apiKey} onChange={handleChange} placeholder="Orn: xxxxxxxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret / Client Secret</Label>
            <Input id="apiSecret" name="apiSecret" type="password" value={formData.apiSecret} onChange={handleChange} placeholder="Orn: yyyyyyyyyyyyyy" />
          </div>
          {(integration.platform === 'Shopify' || integration.platform === 'WooCommerce') && (
            <div className="space-y-2">
              <Label htmlFor="shopUrl">Magaza URL</Label>
              <Input id="shopUrl" name="shopUrl" value={formData.shopUrl} onChange={handleChange} placeholder="Orn: https://magazam.com" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Iptal</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Baglaniliyor...' : 'Baglan'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
