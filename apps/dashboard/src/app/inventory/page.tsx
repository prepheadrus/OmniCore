import React from 'react';

const mockData = [
  {
    id: 1,
    image: 'https://via.placeholder.com/40',
    sku: 'SKU-001',
    name: 'iPhone 15 Pro Max Şeffaf Kılıf',
    stock: 145,
    cost: '45.00 TL',
    price: '199.90 TL',
    status: 'Aktif',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/40',
    sku: 'SKU-002',
    name: '20W USB-C Hızlı Şarj Adaptörü',
    stock: 85,
    cost: '120.00 TL',
    price: '349.00 TL',
    status: 'Aktif',
  },
  {
    id: 3,
    image: 'https://via.placeholder.com/40',
    sku: 'SKU-003',
    name: 'Örgülü Type-C to Lightning Kablo (1m)',
    stock: 210,
    cost: '35.00 TL',
    price: '149.00 TL',
    status: 'Pasif',
  },
  {
    id: 4,
    image: 'https://via.placeholder.com/40',
    sku: 'SKU-004',
    name: 'Manyetik Araç İçi Telefon Tutucu',
    stock: 42,
    cost: '65.00 TL',
    price: '229.00 TL',
    status: 'Aktif',
  },
  {
    id: 5,
    image: 'https://via.placeholder.com/40',
    sku: 'SKU-005',
    name: 'AirPods Pro Uyumlu Silikon Kılıf',
    stock: 0,
    cost: '25.00 TL',
    price: '89.90 TL',
    status: 'Pasif',
  },
];

export default function InventoryPage() {
  return (
    <div className="p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-semibold text-slate-800">Ürün Envanteri</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Arama/Filtreleme..."
              className="px-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="px-6 py-4 font-medium">Ürün Görseli</th>
              <th className="px-6 py-4 font-medium">SKU/Barkod</th>
              <th className="px-6 py-4 font-medium">Ürün Adı</th>
              <th className="px-6 py-4 font-medium">Stok</th>
              <th className="px-6 py-4 font-medium">Maliyet</th>
              <th className="px-6 py-4 font-medium">Satış Fiyatı</th>
              <th className="px-6 py-4 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 divide-y divide-slate-200">
            {mockData.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-slate-200" />
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">{product.sku}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600'}`}>
                    {product.stock} Adet
                  </span>
                </td>
                <td className="px-6 py-4">{product.cost}</td>
                <td className="px-6 py-4 font-medium">{product.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-center sm:justify-end mt-6">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Önceki
          </button>

          <div className="flex space-x-1">
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">1</button>
            <button className="px-3 py-1 border border-slate-300 text-slate-600 rounded-md text-sm hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-300 text-slate-600 rounded-md text-sm hover:bg-slate-50">3</button>
          </div>

          <button className="px-3 py-1 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50">
            Sonraki
          </button>
        </nav>
      </div>
    </div>
  );
}
