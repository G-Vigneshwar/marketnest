import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Product } from '../types';
import { ArrowLeft, User } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
        if (!id) return;
        try {
          const all = await db.products.findAll();
          const found = all.find(p => p.id === id);
          setProduct(found || null);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!product) return <div className="p-10 text-center">Product not found. <Link to="/" className="text-indigo-600">Go Back</Link></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-96 md:h-auto bg-gray-200">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col justify-center">
                <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
                </Link>
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{product.category}</div>
                <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    {product.name}
                </h1>
                <div className="mt-4 flex items-center">
                    <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                     <h3 className="text-sm font-medium text-gray-900">Description</h3>
                     <p className="mt-2 text-base text-gray-500">{product.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500"/>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Sold by</p>
                        <p className="text-sm text-gray-500">{product.brandName}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <button className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add to Cart
                    </button>
                    <p className="mt-2 text-xs text-center text-gray-400">Transaction simulation only.</p>
                </div>
            </div>
        </div>
    </div>
  );
};