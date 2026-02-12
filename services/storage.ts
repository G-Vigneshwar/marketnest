import { createClient } from '@supabase/supabase-js';

/**
 * Image Storage Service
 * Handles product image uploads with validation
 */

// Use the same credentials from db.ts
const SUPABASE_URL = 'https://ltjqfonyxswdkasotvmi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-Eqp9EYvBEGCnQn-nCzhFQ_ZM90683G';

const isConfigured = !(SUPABASE_URL as string).includes('your-project-id') && (SUPABASE_KEY as string) !== 'your-public-anon-key';
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Configuration
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const STORAGE_BUCKET = 'product-images';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  file: File;
  productId?: string;
}

/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Get file type validation error message
 */
export const getFileTypeError = (): string => {
  return `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`;
};

/**
 * Get file size validation error message
 */
export const getFileSizeError = (): string => {
  return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!isValidFileType(file)) {
    return { valid: false, error: getFileTypeError() };
  }
  if (!isValidFileSize(file)) {
    return { valid: false, error: getFileSizeError() };
  }
  return { valid: true };
};

/**
 * Generate unique file path for upload
 */
const generateFilePath = (productId: string, fileName: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${productId || 'general'}/${timestamp}-${randomSuffix}.${extension}`;
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (options: UploadOptions): Promise<UploadResult> => {
  const { file, productId } = options;

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check if Supabase is configured
  if (!isConfigured || !supabase) {
    return { success: false, error: 'Supabase storage not configured' };
  }

  try {
    const filePath = generateFilePath(productId || 'temp', file.name);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { success: false, error: err.message || 'Upload failed' };
  }
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
  if (!isConfigured || !supabase) {
    return { success: true }; // Mock success
  }

  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(STORAGE_BUCKET);
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid image URL' };
    }
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Get image info
 */
export const getImageInfo = (file: File): { type: string; size: string; sizeBytes: number } => {
  return {
    type: file.type,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    sizeBytes: file.size
  };
};

