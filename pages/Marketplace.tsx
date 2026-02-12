import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { Link } from 'react-router-dom';

export const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Simulate network latency (only in mock mode ideally, but keeping for feel)
        await new Promise(r => setTimeout(r, 500));
        const data = await db.products.findAll();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
       <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 underline">Retry</button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
        <p className="mt-1 text-sm text-gray-500">Check back later for new fashion items.</p>
      </div>
    );
  }

  return (
    <div>
       <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">New Arrivals</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Discover the latest trends from independent brands and designers. Curated just for you.</p>
       </div>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {products.map((product) => (
          <div key={product.id} className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-t-lg overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-center object-cover lg:w-full lg:h-full"
              />
            </div>
            <div className="mt-4 px-4 pb-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link to={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.brandName}</p>
                </div>
                <p className="text-sm font-medium text-indigo-600">${product.price.toFixed(2)}</p>
              </div>
              <p className="mt-2 text-xs text-gray-400 capitalize">{product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};