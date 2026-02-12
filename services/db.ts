import { createClient } from '@supabase/supabase-js';
import { Product, User } from '../types';
import { uploadImage, deleteImage, validateFile, getFileTypeError, getFileSizeError } from './storage';

const SUPABASE_URL = 'https://ltjqfonyxswdkasotvmi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-Eqp9EYvBEGCnQn-nCzhFQ_ZM90683G';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase credentials missing");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Re-export storage validation functions for use in components
export { validateFile, getFileTypeError, getFileSizeError };

// Image upload helper function
export const uploadProductImage = async (file: File, productId?: string): Promise<{ url?: string; error?: string }> => {
  const result = await uploadImage({ file, productId });
  if (result.success && result.url) {
    return { url: result.url };
  }
  return { error: result.error || 'Upload failed' };
};

// Image delete helper function
export const deleteProductImage = async (imageUrl: string): Promise<{ error?: string }> => {
  const result = await deleteImage(imageUrl);
  if (!result.success) {
    return { error: result.error || 'Delete failed' };
  }
  return {};
};

export const db = {
  users: {
    findByEmail: async (email: string): Promise<User | null> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },

    create: async (user: User): Promise<User> => {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    update: async (id: string, updates: Partial<User>): Promise<User> => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }
  },

  products: {
    findAll: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    findByBrand: async (brandId: string): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brandId', brandId)
        .order('createdAt', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    create: async (product: Product, actorId: string): Promise<Product> => {
      if (product.brandId !== actorId) {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    update: async (
      productId: string,
      updates: Partial<Product>,
      actorId: string
    ): Promise<Product> => {
      const { data: existing, error: fetchError } = await supabase
        .from('products')
        .select('brandId')
        .eq('id', productId)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!existing || existing.brandId !== actorId) {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    delete: async (productId: string, actorId: string): Promise<void> => {
      const { data: existing, error: fetchError } = await supabase
        .from('products')
        .select('brandId')
        .eq('id', productId)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!existing || existing.brandId !== actorId) {
        throw new Error("Unauthorized");
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw new Error(error.message);
    }
  }
};
