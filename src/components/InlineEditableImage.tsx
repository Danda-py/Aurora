import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

interface InlineEditableImageProps {
  /** Current image URL (public URL from Supabase Storage or CDN) */
  value: string | null;
  /** Called when the image URL changes (while editing) */
  onChange: (url: string | null) => void;
  /** Called when editing is submitted (blurred or Enter). Can be async to save to DB. */
  onSubmit?: (url: string | null) => Promise<void> | void;
  /** Placeholder shown when no image and not editing */
  placeholder?: string;
  /** Debounce time in ms for onSubmit (default 500) */
  debounceMs?: number;
  /** Accepted file types (e.g. 'image/*', 'image/png,image/jpeg') */
  accept?: string;
}

/**
 * A reusable component for inline image editing.
 * Clicking on the image (or placeholder) opens a file picker.
 * After selecting a file, the image is uploaded to Supabase Storage
 * and the resulting public URL is passed to onChange and onSubmit.
 */
export const InlineEditableImage: React.FC<InlineEditableImageProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  debounceMs = 500,
  accept = 'image/*',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startEditing = () => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      fileInputRef.current?.click();
    });
  };

  const stopEditing = (submit: boolean = true) => {
    if (!isEditing) return;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setIsEditing(false);
    const finalUrl = previewUrl ?? value; // if previewUrl is null, keep original
    if (submit) {
      onChange(finalUrl);
      if (onSubmit) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onSubmit(finalUrl).catch(err => {
            console.error('Failed to submit inline image:', err);
          });
        }, debounceMs);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Generate a storage path: e.g., guide-images/${hostId}/${randomName}
    // For simplicity, we use a random name; in production you'd want to tie to hostId
    const fileExt = file.name.split('.').pop?.() ?? '';
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const path = `guide-images/${fileName}`; // adjust bucket/folder as needed

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('guide-images') // ensure this bucket exists and is public
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('guide-images')
        .getPublicPath(path);
      const publicUrl = publicData.publicPath;

      setPreviewUrl(publicUrl);
      onChange(publicUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      // Keep previous preview or null
    } finally {
      setUploading(false);
      fileInputRef.current?.value = ''; // reset input
    }
  };

  const handleBlur = () => {
    stopEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={startEditing}
        style={{
          cursor: 'pointer',
          textAlign: 'center',
          padding: '20px',
          border: value ? '2px dashed #ccc' : '2px dashed #999',
          borderRadius: '8px',
          backgroundColor: value ? 'transparent' : '#fafafa',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {value ? (
          <img
            src={value}
            alt="preview"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
          />
        ) : (
          <>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {placeholder || 'Aggiungi immagine'}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              (formati supportati: JPG, PNG, GIF, max 5 MB)
            </div>
          </>
        )}
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Editing mode: show preview, upload button, and cancel/submit actions
  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="preview"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '12px' }}
        />
      ) : (
        <div style={{ width: '120px', height: '120px', border: '2px dashed #ccc', borderRadius: '8px', margin: '0 auto 12px' }}>
          {/* placeholder while uploading */}
        </div>
      )}
      {uploading ? (
        <div style={{ fontSize: '14px', color: '#666' }}>Caricamento...</div>
      ) : (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Scegli immagine
          </button>
          <button
            onClick={() => stopEditing(false)}
            style={{
              marginLeft: '8px',
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Annulla
          </button>
        </div>
      )}
    </div>
  );
};