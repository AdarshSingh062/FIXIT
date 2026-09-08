import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const MultiImageUploader = ({
  files = [],
  setFiles,
  maxFiles = 5,
  label = 'Upload Photos (Up to 5 images)',
  description = 'Supports JPEG, PNG, WebP up to 5MB per file'
}) => {
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      toast.warning(`You can only upload up to ${maxFiles} images in total`);
      return;
    }

    const validFiles = [];
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed 5MB limit`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not a valid image format`);
        continue;
      }
      validFiles.push(file);
    }

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--gray-300)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--gray-50)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-500)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--gray-300)')}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Upload size={22} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)' }}>
            Click or drag & drop images here
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{description}</span>
        </div>
      </div>

      {/* Image Preview Grid */}
      {files.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '12px',
            marginTop: '1rem'
          }}
        >
          {files.map((file, idx) => {
            const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '90px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--gray-200)'
                }}
              >
                <img
                  src={previewUrl}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
