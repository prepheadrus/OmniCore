'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Rss, Plus, Settings } from 'lucide-react';
import FeedStats from './FeedStats';
import FeedList from './FeedList';
import FeedForm from './FeedForm';
import CategoryMappingForm from './CategoryMappingForm';
import type { Feed, CategoryMapping } from './types';

export default function ProductFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feeds' | 'add' | 'categories'>('feeds');

  const fetchFeeds = useCallback(async () => {
    try {
      // API call to backend, respecting channelId context implicitly configured in client
      const res = await fetch('/api/feeds');
      if (res.ok) setFeeds(await res.json());
    } catch {
      // Silently handle for now
    }
  }, []);

  const fetchCategoryMappings = useCallback(async () => {
    try {
      const res = await fetch('/api/category-mappings');
      if (res.ok) setCategoryMappings(await res.json());
    } catch {
      // Silently handle
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchFeeds(), fetchCategoryMappings()]).finally(() => setLoading(false));
  }, [fetchFeeds, fetchCategoryMappings]);

  const handleSaveFeed = async (data: { name: string; source: string; sourceUrl: string; format: string; schedule: string }) => {
    try {
      await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await fetchFeeds();
      setActiveTab('feeds');
    } catch (error) {
      console.error('Failed to save feed', error);
    }
  };

  const handleToggleStatus = async (feed: Feed) => {
    const next = feed.status === 'active' ? 'paused' : 'active';
    try {
      await fetch('/api/feeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feed.id, status: next }),
      });
      await fetchFeeds();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleDelete = async (feed: Feed) => {
    // Optimistic removal
    setFeeds((prev) => prev.filter((f) => f.id !== feed.id));
    // In a real scenario, call DELETE /api/feeds/:id here
  };

  const handleSyncNow = async (feed: Feed) => {
    setSyncingId(feed.id);
    // Simulate sync delay
    await new Promise((r) => setTimeout(r, 1800));
    try {
      await fetch('/api/feeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feed.id,
          lastImport: new Date().toISOString(),
          totalProducts: Math.floor(Math.random() * 800) + 200,
          validProducts: Math.floor(Math.random() * 600) + 180,
          errorProducts: Math.floor(Math.random() * 40),
        }),
      });
      await fetchFeeds();
    } catch (error) {
      console.error('Failed to sync', error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleAddCategoryMapping = async (source: string, sourceCat: string, target: string, targetCat: string) => {
    try {
      await fetch('/api/category-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, sourceCat, target, targetCat }),
      });
      await fetchCategoryMappings();
    } catch (error) {
      console.error('Failed to add category mapping', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-[#f2f4f4] rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-[#f2f4f4] rounded-xl"></div>
          <div className="h-32 bg-[#f2f4f4] rounded-xl"></div>
          <div className="h-32 bg-[#f2f4f4] rounded-xl"></div>
        </div>
        <div className="h-96 bg-[#f2f4f4] rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d3435] shadow-sm">
          <Rss className="h-6 w-6 text-[#ffffff]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3435]">Ürün Feed Yönetimi</h1>
          <p className="text-sm text-[#5f5e61] mt-1">Tüm pazaryerlerine ürün veri akışlarınızı yönetin</p>
        </div>
      </div>

      <FeedStats feeds={feeds} />

      <div className="mb-8 border-b border-[#adb3b4]/30">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('feeds')}
            className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'feeds'
                ? 'border-[#2d3435] text-[#2d3435]'
                : 'border-transparent text-[#5f5e61] hover:text-[#2d3435] hover:border-[#adb3b4]'
            }`}
          >
            <Rss className="h-4 w-4" />
            Feed&apos;ler
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'add'
                ? 'border-[#2d3435] text-[#2d3435]'
                : 'border-transparent text-[#5f5e61] hover:text-[#2d3435] hover:border-[#adb3b4]'
            }`}
          >
            <Plus className="h-4 w-4" />
            Yeni Feed Ekle
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-[#2d3435] text-[#2d3435]'
                : 'border-transparent text-[#5f5e61] hover:text-[#2d3435] hover:border-[#adb3b4]'
            }`}
          >
            <Settings className="h-4 w-4" />
            Kategori Eşleştirme
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'feeds' && (
          <FeedList
            feeds={feeds}
            onToggleStatus={handleToggleStatus}
            onSync={handleSyncNow}
            onDelete={handleDelete}
            syncingId={syncingId}
          />
        )}
        {activeTab === 'add' && <FeedForm onSave={handleSaveFeed} />}
        {activeTab === 'categories' && (
          <CategoryMappingForm mappings={categoryMappings} onAddMapping={handleAddCategoryMapping} />
        )}
      </div>
    </div>
  );
}
