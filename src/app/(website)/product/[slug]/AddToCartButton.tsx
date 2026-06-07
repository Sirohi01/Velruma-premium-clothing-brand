'use client';

import React, { useState } from 'react';
import { ShoppingBag, Tag, Copy, Ruler, Package, Truck, RefreshCcw, ShieldCheck, Check, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function finalProductPrice(product: any) {
  const sellingBeforeDiscount = Number(product.salePrice || product.basePrice || 0);
  const discountType = product.discountType || 'none';
  const discountValue = Number(product.discountValue || 0);
  const extraDiscount = discountType === 'percentage'
    ? Math.round((sellingBeforeDiscount * discountValue) / 100)
    : discountType === 'fixed'
      ? discountValue
      : 0;
  return Math.max(0, sellingBeforeDiscount - extraDiscount);
}

export default function AddToCartButton({
  product,
  sizes,
  colors,
}: {
  product: any;
  sizes: string[];
  colors: string[];
}) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentVariant = product.variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const price = finalProductPrice(product) + (currentVariant?.extraPrice || 0);
  const mrp = Number(product.basePrice || 0) + (currentVariant?.extraPrice || 0);
  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('VELRUMA15');
    setCopiedCode(true);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product._id,
      name: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url || '',
      price,
      mrp,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      maxQuantity: currentVariant.stock,
      sku: currentVariant.sku || '',
    });

    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toast.success('Proceeding to checkout...');
  };

  return (
    <div className="space-y-6">
      {/* Discount Card Hidden Until Coupon Implementation */}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-bold text-zinc-900">Color:</h4>
            <span className="text-sm text-zinc-600">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((color) => {
              // Very basic color mapping for UI visualization. You could improve this based on exact color hexes.
              const colorMap: Record<string, string> = {
                White: 'bg-white',
                Black: 'bg-zinc-900',
                Red: 'bg-red-500',
                Blue: 'bg-blue-500',
                Navy: 'bg-slate-800',
                Grey: 'bg-zinc-400',
                Green: 'bg-green-600',
              };
              const bgClass = colorMap[color] || 'bg-zinc-200';

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${selectedColor === color
                      ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-2'
                      : 'border-zinc-200 hover:border-zinc-400'
                    } ${bgClass}`}
                  aria-label={`Select ${color}`}
                  title={color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900">Size:</h4>
              <span className="text-sm text-zinc-600">{selectedSize || 'Select Size'}</span>
            </div>

            {/* Size Chart Dialog */}
            <Dialog>
              <DialogTrigger render={<button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 hover:underline" />}>
                Size Chart <Ruler className="h-3 w-3" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Size Guide</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="aspect-[4/3] w-full rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 border border-zinc-200">
                    {/* Placeholder for size chart image */}
                    Size Chart Graphic (Placeholder)
                  </div>
                  <p className="mt-4 text-xs text-zinc-500 text-center">Measurements are in inches. Allow 0.5" tolerance.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`flex h-10 min-w-[3rem] items-center justify-center rounded border px-3 text-sm font-medium transition-all ${selectedSize === size
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Summary Box */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Package className="h-5 w-5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-900">
            {isOutOfStock ? 'Out of Stock' : `${currentVariant?.stock || 0} in stock`}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center border-l border-zinc-200">
          <Truck className="h-5 w-5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-900">Ready to ship</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center border-l border-zinc-200">
          <RefreshCcw className="h-5 w-5 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-900">7 Days Returns</span>
        </div>
      </div>

      {isOutOfStock ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="mb-2 text-sm font-medium text-zinc-900">Notify me when available</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={() => toast.success("We'll email you when this is back in stock")}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Notify
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex h-12 items-center rounded-lg border border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-full w-10 items-center justify-center text-xl text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                &minus;
              </button>
              <span className="flex h-full w-8 items-center justify-center text-sm font-semibold text-zinc-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(currentVariant?.stock || 1, quantity + 1))}
                className="flex h-full w-10 items-center justify-center text-xl text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                &#43;
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-8 text-sm font-bold tracking-wide text-white transition-all hover:bg-zinc-800"
            >
              <ShoppingBag className="h-4 w-4" />
              ADD TO CART
            </button>
          </div>

          {/* Buy it Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-zinc-900 bg-white px-8 text-sm font-bold tracking-wide text-zinc-900 transition-all hover:bg-zinc-50"
          >
            BUY IT NOW
          </button>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 border-t border-zinc-200 pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-zinc-700" />
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-900">Free Shipping</p>
              <p className="text-[9px] text-zinc-500">On all orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-6 w-6 text-zinc-700" />
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-900">COD Available</p>
              <p className="text-[9px] text-zinc-500">Pay on delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-zinc-700" />
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-900">Secure Payment</p>
              <p className="text-[9px] text-zinc-500">100% protected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 text-zinc-700" />
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-900">Easy Returns</p>
              <p className="text-[9px] text-zinc-500">7 days return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
