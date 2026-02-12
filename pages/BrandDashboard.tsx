import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../services/authContext';
import { db, uploadProductImage, validateFile, getFileTypeError, getFileSizeError } from '../services/db';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Upload, X, Check } from 'lucide-react';

export const BrandDashboard = () => {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await db.products.findByBrand(session.user.id);
      setProducts(data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!session || !window.confirm('Are you sure you want to delete this product?')) return;
    try {
      // The db service ensures only the owner can delete
      await db.products.delete(id, session.user.id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setImagePreview(product.imageUrl);
      setSelectedFile(null);
    } else {
      setCurrentProduct({
        name: '',
        description: '',
        price: 0,
        category: 'General',
        imageUrl: ''
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
    setUploadError('');
    setIsEditing(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setError('');

    try {
      // Upload image if file selected
      let imageUrl = currentProduct.imageUrl || '';
      if (selectedFile) {
        setUploadProgress(true);
        setUploadError('');
        const uploadResult = await uploadProductImage(selectedFile, currentProduct.id);
        setUploadProgress(false);
        if (uploadResult.error) {
          setUploadError(uploadResult.error);
          return;
        }
        if (uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      // Validate image URL
      if (!imageUrl && !selectedFile) {
        setUploadError('Please upload an image for your product');
        return;
      }

      const productData = {
        ...currentProduct,
        imageUrl
      };

      if (currentProduct.id) {
        // Update: db service checks ownership via session.user.id
        await db.products.update(currentProduct.id, productData, session.user.id);
      } else {
        // Create
        const newProduct: Product = {
            id: `prod-${Date.now()}`,
            brandId: session.user.id,
            brandName: session.user.name,
            createdAt: new Date().toISOString(),
            name: productData.name!,
            description: productData.description!,
            price: Number(productData.price),
            category: productData.category!,
            imageUrl: imageUrl
        };
        await db.products.create(newProduct, session.user.id);
      }
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
           <p className="text-gray-500 text-sm mt-1">Manage your catalog and inventory</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Product
        </button>
      </div>
      
      {error && !isEditing && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      {products.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-full object-cover" src={product.imageUrl} alt="" />
                      <div className="ml-4 truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-indigo-600 truncate">{product.name}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">in {product.category}</p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                             ${product.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex gap-2">
                    <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900 p-2">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-2">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isEditing && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {currentProduct.id ? 'Edit Product' : 'Create New Product'}
              </h3>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" required value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea required value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" step="0.01" required value={currentProduct.price || 0} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={currentProduct.category || 'General'} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="Outerwear">Outerwear</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Tops">Tops</option>
                            <option value="Bottoms">Bottoms</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Image</label>
                    
                    {/* Image Preview */}
                    {imagePreview ? (
                      <div className="mt-2 relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-48 w-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      /* Upload Area */
                      <div 
                        className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                              <span>Upload a file</span>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                className="sr-only" 
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Progress */}
                    {uploadProgress && (
                      <div className="mt-2 flex items-center text-sm text-indigo-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        Uploading image...
                      </div>
                    )}
                    
                    {/* Upload Error */}
                    {uploadError && (
                      <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                    )}
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="mt-5 sm:mt-6 flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">Cancel</button>
                  <button type="submit" className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};