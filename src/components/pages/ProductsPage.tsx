import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles, Search, ShieldCheck, ArrowRight, X, Minus, SlidersHorizontal } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { trackSearchQuery } from '../../lib/analytics';
import { getAdminToken } from '../../lib/auth';

interface ProductsPageProps {
  onNavigateToCheckout?: () => void;
  selectedProductInitial?: Product | null;
  editorMode?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
  onExitEditorMode?: () => void;
  onUpdateSiteSettings?: (settings: any) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onNavigateToCheckout,
  selectedProductInitial = null,
  editorMode = false,
  isMinimized = false,
  onToggleMinimize,
  onExitEditorMode,
  onUpdateSiteSettings,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(selectedProductInitial);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [draftProduct, setDraftProduct] = useState<Product | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const { addItem } = useCart();

  const loadProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Failed to load products', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeout = setTimeout(() => {
        trackSearchQuery(searchQuery, 'products');
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProductInitial) {
      setActiveModalProduct(selectedProductInitial);
      setSelectedVariant(selectedProductInitial.variants?.[0]);
    }
  }, [selectedProductInitial]);

  const handleOpenProduct = (product: Product) => {
    setActiveModalProduct(product);
    setSelectedVariant(product.variants?.[0]);
    setSelectedQuantity(1);
  };

  const handleBuyNow = (product: Product) => {
    addItem(product, selectedQuantity, selectedVariant);
    setActiveModalProduct(null);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    } else {
      window.location.hash = '/checkout';
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedNumber !== null) {
      const matchesNum = Array.isArray(p.suitableNumbers) && p.suitableNumbers.length > 0
        ? p.suitableNumbers.includes(selectedNumber)
        : p.numerologyNumber === selectedNumber;
      if (!matchesNum) return false;
    }
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchPlanet = (p.rulingPlanet || '').toLowerCase().includes(q);
      const matchWho = Array.isArray(p.whoCanWear) && p.whoCanWear.some(w => w.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchPlanet && !matchWho) return false;
    }
    return true;
  });

  const saveProduct = async () => {
    if (!draftProduct) return;

    setSaveState('saving');
    setSaveMessage('Saving...');
    const token = getAdminToken();
    const isNew = !products.some(item => item.id === draftProduct.id);

    const priceVal = draftProduct.isFree
      ? 0
      : (draftProduct.price !== null && draftProduct.price !== undefined && draftProduct.price !== ('' as any)
          ? Number(draftProduct.price)
          : null);

    const sanitizedProduct = {
      ...draftProduct,
      name: draftProduct.name?.trim() || 'Sacred Gemstone Offering',
      price: priceVal,
      isFree: Boolean(draftProduct.isFree),
      description: draftProduct.description?.trim() || 'Handcrafted, natural semi-precious gemstones energized for personal alignment.',
      shortDescription: draftProduct.shortDescription?.trim() || 'Sacred energetic creation.',
      category: draftProduct.category || 'bracelets',
      active: true,
      stock: draftProduct.stock ?? 10,
      images: draftProduct.images && draftProduct.images.length > 0 && draftProduct.images[0]
        ? draftProduct.images
        : ['https://images.unsplash.com/photo-1611591475102-4fa0120286eb?auto=format&fit=crop&w=800&q=80'],
    };

    try {
      const url = isNew ? '/api/editor/products' : `/api/editor/products/${draftProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(sanitizedProduct),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Save failed (${response.status})`);
      }

      await loadProducts();
      setDraftProduct(null);
      setSaveState('saved');
      setSaveMessage('Saved successfully');
    } catch (error) {
      console.error('Product save failed', error);
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Save failed. Restart the server and try again.');
    }
  };

  const deleteProduct = async (productId: string) => {
    const token = getAdminToken();
    try {
      const response = await fetch(`/api/editor/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });

      if (response.ok) {
        setDraftProduct(null);
        loadProducts();
      }
    } catch (error) {
      console.error('Product delete failed', error);
    }
  };

  const handleProductImageUpload = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      console.error('Please choose an image file');
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.65);
      setDraftProduct((previous) => previous ? { ...previous, images: [imageData] } : previous);
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => URL.revokeObjectURL(objectUrl);
    image.src = objectUrl;
  };

  return (
    <div id="page-products" className="min-h-screen bg-[#F7F3EA] text-[#101827] pt-28 sm:pt-32 pb-20">
      {/* Expanded Editor Panel — minimize/expand pill is global in App.tsx */}
      {editorMode && !isMinimized && (
        <div className="editor-panel-scroll fixed left-3 right-3 top-20 z-40 flex max-h-[calc(100vh-6rem)] w-auto flex-col overflow-y-scroll overscroll-contain rounded-2xl border border-[#D9D2C3] bg-[#FFFDF9]/95 p-4 shadow-2xl backdrop-blur-md pointer-events-auto sm:left-auto sm:right-4 sm:top-24 sm:max-h-[calc(100vh-7rem)] sm:w-[340px]">
          <div className="mb-3 flex items-center justify-between border-b border-[#D9D2C3]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A6833D]">Products Editor</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDraftProduct({
                  id: `prod-${Date.now()}`,
                  name: 'New Sacred Product',
                  slug: 'new-sacred-product',
                  description: 'Describe your product story and energetic use.',
                  shortDescription: 'A new sacred offer.',
                  price: 4999,
                  sku: `SKU-${Date.now()}`,
                  stock: 10,
                  category: 'bracelets',
                  featured: false,
                  active: true,
                  material: 'Natural stone',
                  careInstructions: 'Keep away from water and sunlight.',
                  traditionalAssociation: 'Sacred ritual',
                  images: ['https://images.unsplash.com/photo-1611591475102-4fa0120286eb?auto=format&fit=crop&w=800&q=80'],
                  variants: [],
                })}
                className="rounded-full bg-[#101827] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#F7F3EA] hover:bg-[#182236] cursor-pointer"
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => onToggleMinimize?.(true)}
                title="Minimize Editor"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/70 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Minimize Editor"
              >
                <Minus className="w-4 h-4" />
              </button>
              {onExitEditorMode && (
                <button
                  type="button"
                  onClick={onExitEditorMode}
                  title="Close & Exit Editor Mode"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="Close & Exit Editor"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {draftProduct ? (
            <div className="space-y-3 text-xs text-[#101827]">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Name</span>
                  <input
                    value={draftProduct.name}
                    onChange={(e) => setDraftProduct((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                {/* Pricing Structure */}
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Pricing Structure</span>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setDraftProduct(prev => prev ? { ...prev, isFree: false, price: prev.price && prev.price > 0 ? prev.price : 2999 } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        !draftProduct.isFree && draftProduct.price !== null && draftProduct.price !== undefined && draftProduct.price > 0
                          ? 'bg-[#101827] text-[#F7F3EA] border-[#101827] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#A6833D]'
                      }`}
                    >
                      Paid (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftProduct(prev => prev ? { ...prev, isFree: true, price: 0 } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        draftProduct.isFree
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-emerald-700'
                      }`}
                    >
                      Free Offering
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftProduct(prev => prev ? { ...prev, isFree: false, price: null } : prev)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        !draftProduct.isFree && (draftProduct.price === null || draftProduct.price === undefined || draftProduct.price === 0)
                          ? 'bg-[#8F4829] text-white border-[#8F4829] shadow-xs'
                          : 'bg-white border-[#D9D2C3] text-[#101827]/70 hover:border-[#8F4829]'
                      }`}
                    >
                      Hide (No Price)
                    </button>
                  </div>
                  {!draftProduct.isFree && draftProduct.price !== null && draftProduct.price !== undefined && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount in ₹ (e.g. 2999)"
                        value={draftProduct.price ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          setDraftProduct((prev) => prev ? { ...prev, price: val } : prev);
                        }}
                        className="w-full rounded-lg border border-[#D9D2C3] bg-white pl-7 pr-3 py-2 text-xs focus:border-[#C8A45D] focus:outline-none"
                      />
                    </div>
                  )}
                  {draftProduct.isFree && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 rounded-lg p-2 font-medium">
                      ✓ Displays as a sacred <b>Free Offering</b> to seekers.
                    </p>
                  )}
                  {!draftProduct.isFree && (draftProduct.price === null || draftProduct.price === undefined || draftProduct.price === 0) && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-2 font-medium">
                      ✓ No amount or 'Free' badge will be shown. Renders cleanly without price.
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Category</span>
                  <select
                    value={draftProduct.category}
                    onChange={(e) => setDraftProduct((prev) => prev ? { ...prev, category: e.target.value as Product['category'] } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  >
                    <option value="bracelets">Bracelets</option>
                    <option value="malas">Malas</option>
                    <option value="yantras">Yantras</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Image URL</span>
                  <input
                    value={draftProduct.images?.[0] || ''}
                    onChange={(e) => setDraftProduct((prev) => prev ? { ...prev, images: [e.target.value] } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Or choose from computer</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                    className="block w-full rounded-lg border border-[#D9D2C3] bg-white px-2 py-2 text-[10px] text-[#101827] file:mr-2 file:rounded-md file:border-0 file:bg-[#101827] file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-[#F7F3EA]"
                  />
                  {draftProduct.images?.[0] && (
                    <img
                      src={draftProduct.images[0]}
                      alt="Product preview"
                      className="mt-2 h-20 w-full rounded-lg border border-[#D9D2C3] bg-[#EDE8DE] object-contain"
                    />
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#101827]/60">Description</span>
                  <textarea
                    rows={4}
                    value={draftProduct.description}
                    onChange={(e) => setDraftProduct((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full rounded-lg border border-[#D9D2C3] bg-white px-3 py-2 focus:border-[#C8A45D] focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveProduct}
                  disabled={saveState === 'saving'}
                  className="flex-1 rounded-xl bg-[#101827] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F7F3EA] disabled:cursor-wait disabled:opacity-60"
                >
                  {saveState === 'saving' ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraftProduct(null)}
                  className="rounded-xl border border-[#D9D2C3] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#101827]"
                >
                  Cancel
                </button>
              </div>

              {saveMessage && (
                <p className={`max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-[10px] leading-relaxed ${saveState === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {saveMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => deleteProduct(draftProduct.id)}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-700"
              >
                Delete product
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setDraftProduct(product)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#D9D2C3] bg-white px-3 py-2 text-left text-xs"
                >
                  <span className="font-medium text-[#101827]">{product.name}</span>
                  <span className="text-[#A6833D]">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-[#101827] text-[#F7F3EA] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,164,93,0.15)_0%,_rgba(16,24,39,1)_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182236] border border-[#C8A45D]/40 text-[#DFC38A] text-xs font-bold uppercase tracking-widest">
            <ShoppingBag className="w-3.5 h-3.5 text-[#C8A45D]" />
            <span>Sacred Gemstone Collection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#F7F3EA] font-light">
            Numerology Bracelets & Malas
          </h1>
          <p className="text-sm sm:text-base text-[#D9D2C3]/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Hand-strung with natural certified gemstones, Nepali rudraksha seeds, and calibrated to planetary frequencies. Energized in traditional ritual ceremonies.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 space-y-6">
        {/* Numerology Number Filter Bar (1 - 9) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9D2C3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#A6833D] shrink-0">
              Filter by Number (1-9):
            </span>
            <button
              onClick={() => setSelectedNumber(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedNumber === null
                  ? 'bg-[#101827] text-[#F7F3EA]'
                  : 'bg-[#FAF7F0] text-[#101827] hover:bg-[#EDE8DE]'
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11].map(num => (
              <button
                key={num}
                onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer ${
                  selectedNumber === num
                    ? 'bg-[#101827] text-[#F7F3EA] shadow-md ring-2 ring-[#C8A45D]'
                    : 'bg-[#FAF7F0] border border-[#D9D2C3] text-[#101827] hover:border-[#C8A45D]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['ALL', 'bracelets'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#101827] text-[#F7F3EA]'
                    : 'bg-white border border-[#D9D2C3] text-[#101827] hover:border-[#C8A45D]'
                }`}
              >
                {cat === 'ALL' ? 'All Items' : 'Numerology Bracelets'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search gemstone, planet..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#D9D2C3] text-xs text-[#101827] focus:outline-none focus:border-[#C8A45D]"
            />
          </div>
        </div>
      </section>

      {/* Customize Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#182236] via-[#101827] to-[#251A18] border border-[#C8A45D]/40 p-6 sm:p-8 shadow-xl text-[#F7F3EA]">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C8A45D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A45D]/20 border border-[#C8A45D]/50 text-[#DFC38A] text-xs font-bold uppercase tracking-widest shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
                <span>Recommended</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F3EA] tracking-wide">
                Customize
              </h2>
              <p className="text-xs sm:text-sm text-[#D9D2C3]/90 leading-relaxed font-sans">
                Every birth chart carries unique elemental vibrations. Request a 1-on-1 personalized consultation with Falgun Thakkar to calculate your core numbers and receive a tailor-made, traditionally energized crystal bracelet calibrated specifically for your life path.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#DFC38A]">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">✓ Personalized DOB Analysis</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">✓ Vedic Energetic Consecration</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">✓ Authentic Certified Gemstones</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <a
                href="https://wa.me/916359666315?text=Hello%20Falgun%20ji,%20I%20would%20like%20to%20customize%20a%20personalized%20crystal%20bracelet%20(%E2%82%B92,300)%20based%20on%20my%20numerology%20and%20date%20of%20birth."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C8A45D] text-[#101827] text-xs font-bold uppercase tracking-wider hover:bg-[#d6b46f] transition-all shadow-md font-sans text-center"
              >
                <span>Customize on WhatsApp • ₹2,300</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#/consultations"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#F7F3EA] border border-white/20 text-xs font-semibold tracking-wider uppercase transition-colors text-center"
              >
                Book Numerology Consult
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-80 rounded-2xl bg-[#EDE8DE] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#D9D2C3] p-8 max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-[#C8A45D] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-serif font-bold text-[#101827]">
              No items match your filter
            </h3>
            <p className="text-xs text-[#101827]/70 mt-1 mb-6">
              Try resetting your search query or selecting "All Numbers".
            </p>
            <button
              onClick={() => {
                setSelectedNumber(null);
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#101827] text-[#F7F3EA] text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="rounded-2xl bg-white border border-[#D9D2C3] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div
                  className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#FAF7F0] cursor-pointer flex items-center justify-center p-2.5"
                  onClick={() => handleOpenProduct(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="block h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {(product.suitableNumbers && product.suitableNumbers.length > 0) ? (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#101827]/90 text-[#DFC38A] border border-[#C8A45D]/40 backdrop-blur-sm">
                        {product.suitableNumbers.length === 9 ? 'Numbers 1–9 (All)' : `Numbers ${product.suitableNumbers.join(', ')}`}
                      </span>
                    </div>
                  ) : product.numerologyNumber ? (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#101827]/90 text-[#DFC38A] border border-[#C8A45D]/40 backdrop-blur-sm">
                        Number {product.numerologyNumber}
                      </span>
                    </div>
                  ) : null}

                  {product.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Energized</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#A6833D] font-bold mb-1">
                      {product.rulingPlanet || product.category}
                    </div>
                    <h3
                      onClick={() => handleOpenProduct(product)}
                      className="text-base font-serif font-bold text-[#101827] group-hover:text-[#A6833D] transition-colors leading-snug line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#101827]/60 font-sans line-clamp-2 mt-1.5 leading-relaxed">
                      {product.description}
                    </p>
                    {product.whoCanWear && product.whoCanWear.length > 0 && (
                      <div className="mt-2 text-[11px] text-[#A6833D] font-medium flex items-center gap-1 line-clamp-1">
                        <span className="shrink-0 font-bold">For:</span>
                        <span className="truncate text-[#101827]/70">{product.whoCanWear[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#D9D2C3]/60 flex items-center justify-between min-h-[38px]">
                    <div>
                      {product.isFree ? (
                        <span className="text-sm font-serif font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Free Offering
                        </span>
                      ) : (product.price !== null && product.price !== undefined && product.price > 0) ? (
                        <>
                          <span className="text-xs text-[#101827]/50 line-through mr-1.5">
                            ₹{(product.price * 1.25).toFixed(0)}
                          </span>
                          <span className="text-base font-serif font-bold text-[#101827]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-gray-500 italic">
                          By Sacred Request
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {editorMode && (
                        <button
                          type="button"
                          onClick={() => setDraftProduct(product)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#D9D2C3] text-[10px] font-bold text-[#101827]"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenProduct(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#D9D2C3] text-[11px] font-bold text-[#101827] hover:bg-[#EDE8DE] transition-colors"
                      >
                        Quick View
                      </button>
                      <button
                        onClick={() => addItem(product, 1)}
                        className="p-2 rounded-lg bg-[#101827] text-[#F7F3EA] hover:bg-[#182236] hover:text-[#C8A45D] transition-colors cursor-pointer"
                        title="Add to Sacred Bag"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#D9D2C3] bg-white px-6 py-10 sm:px-10 sm:py-14 text-center">
          {/* Decorative orbs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#C8A45D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#A6833D]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101827] border border-[#C8A45D]/30 text-[#DFC38A] text-[11px] font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
              <span>Expanding Soon</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#101827] mt-2">
              Many More Sacred Products{' '}
              <span className="font-bold italic text-[#A6833D]">Coming Soon</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#101827]/65 max-w-xl mx-auto leading-relaxed font-sans">
              We are carefully curating and energizing new additions — including rare gemstone malas, Rudraksha collections, Vastu healing crystals, and personalized sacred sets. Stay tuned.
            </p>

          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        <div className="rounded-2xl border border-[#D9D2C3] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#A6833D] shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6833D]">
                Important Note
              </h3>
              <p className="text-xs sm:text-sm text-[#101827]/80 leading-relaxed font-sans">
                Crystal properties and numerology associations are based on traditional spiritual beliefs. They are not scientifically established or guaranteed outcomes. For personalized bracelet recommendations, consult a numerology practitioner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeModalProduct && (
          <div id="product-detail-modal" className="fixed inset-0 z-50 bg-[#101827]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F7F3EA] text-[#101827] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#D9D2C3] overflow-hidden my-8"
            >
              <div className="relative">
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image Gallery */}
                  <div className="relative flex min-h-[320px] max-h-[500px] w-full items-center justify-center overflow-hidden bg-[#FAF7F0] p-4">
                    <img
                      src={activeModalProduct.images[0]}
                      alt={activeModalProduct.name}
                      className="block h-full max-h-[460px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    {activeModalProduct.suitableNumbers && activeModalProduct.suitableNumbers.length > 0 ? (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#101827]/90 text-[#DFC38A] border border-[#C8A45D]/40">
                          {activeModalProduct.suitableNumbers.length === 9 ? 'Suitable for All Numbers (1–9)' : `Suitable Numbers: ${activeModalProduct.suitableNumbers.join(', ')}`}
                        </span>
                      </div>
                    ) : activeModalProduct.numerologyNumber ? (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#101827]/90 text-[#DFC38A] border border-[#C8A45D]/40">
                          Number {activeModalProduct.numerologyNumber} • {activeModalProduct.rulingPlanet}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-[#A6833D] block">
                        {activeModalProduct.category}
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-[#101827] mt-1">
                        {activeModalProduct.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        {activeModalProduct.isFree ? (
                          <span className="text-xl font-serif font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                            Free Offering
                          </span>
                        ) : ((selectedVariant?.price ?? activeModalProduct.price) !== null && (selectedVariant?.price ?? activeModalProduct.price) !== undefined && (selectedVariant?.price ?? activeModalProduct.price)! > 0) ? (
                          <>
                            <span className="text-xl font-serif font-bold text-[#101827]">
                              ₹{(selectedVariant?.price ?? activeModalProduct.price)!.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              ₹{((selectedVariant?.price ?? activeModalProduct.price)! * 1.25).toFixed(0)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Free Pan-India Delivery
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-gray-600 italic">
                            By Sacred Request • Contact for Allocation
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#101827]/80 leading-relaxed font-sans">
                      {activeModalProduct.description}
                    </p>

                    {/* Gemstones & Synergy */}
                    {activeModalProduct.material && (
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-[#101827] block">Natural Certified Materials:</span>
                        <p className="text-[#101827]/70">
                          {activeModalProduct.material}
                        </p>
                      </div>
                    )}

                    {/* Suitable Numerology Numbers */}
                    {activeModalProduct.suitableNumbers && activeModalProduct.suitableNumbers.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#101827] block">
                          Suitable Numerology Numbers:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {activeModalProduct.suitableNumbers.map(n => (
                            <span
                              key={n}
                              className="w-7 h-7 rounded-lg bg-white border border-[#D9D2C3] text-xs font-serif font-bold text-[#101827] flex items-center justify-center shadow-xs"
                            >
                              {n}
                            </span>
                          ))}
                          {activeModalProduct.suitableNumbers.length === 9 && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                              All Numbers (1–9) • Suitable for Everyone
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Who Can Wear It? */}
                    {activeModalProduct.whoCanWear && activeModalProduct.whoCanWear.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-[#D9D2C3] space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#101827] block">
                          Who Can Wear It?
                        </span>
                        <ul className="space-y-1 text-xs text-[#101827]/80">
                          {activeModalProduct.whoCanWear.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#A6833D] font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer inside modal */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#101827]/80 leading-relaxed space-y-1">
                      <span className="font-bold text-[#A6833D] block uppercase tracking-wider text-[10px]">
                        Spiritual Belief Disclaimer
                      </span>
                      <p>
                        Crystal properties and numerology associations are based on traditional spiritual beliefs. They are not scientifically established or guaranteed outcomes. For personalized bracelet recommendations, consult a numerology practitioner.
                      </p>
                    </div>

                    {/* Variants if any */}
                    {activeModalProduct.variants && activeModalProduct.variants.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#101827] block">
                          Wrist Size:
                        </span>
                        <div className="flex gap-2">
                          {activeModalProduct.variants.map(v => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariant(v)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                selectedVariant?.id === v.id
                                  ? 'bg-[#101827] text-[#F7F3EA] border-[#101827]'
                                  : 'bg-white border-[#D9D2C3] text-[#101827] hover:border-[#C8A45D]'
                              }`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Stepper (No limit!) */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#D9D2C3]">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#101827] block">
                          Quantity
                        </span>
                        {((selectedVariant?.price ?? activeModalProduct.price) !== null && (selectedVariant?.price ?? activeModalProduct.price) !== undefined && (selectedVariant?.price ?? activeModalProduct.price)! > 0) && (
                          <span className="text-xs font-serif font-bold text-[#C56A45]">
                            Total: ₹{((selectedVariant?.price ?? activeModalProduct.price)! * selectedQuantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center rounded-lg border border-[#D9D2C3] bg-[#FAF7F0] p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                          disabled={selectedQuantity <= 1}
                          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-base hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-[#101827]"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-[#101827]">
                          {selectedQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity(prev => prev + 1)}
                          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-base hover:bg-white transition-colors cursor-pointer text-[#101827]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#EDE8DE] border border-[#D9D2C3] flex items-center gap-2 text-[11px] text-[#101827]/70">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Certified 100% natural authentic gemstones energized in sacred ritual.</span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          addItem(activeModalProduct, selectedQuantity, selectedVariant);
                          setActiveModalProduct(null);
                        }}
                        className="flex-1 py-3.5 rounded-xl bg-white border border-[#101827] text-[#101827] text-xs font-bold tracking-wider uppercase hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => handleBuyNow(activeModalProduct)}
                        className="flex-1 py-3.5 rounded-xl bg-[#101827] text-[#F7F3EA] text-xs font-bold tracking-wider uppercase hover:bg-[#182236] transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C8A45D]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
