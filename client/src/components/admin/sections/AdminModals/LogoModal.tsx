import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { axiosClient, type ApiResponse } from '@/services/api';
import styles from './AdminModals.module.css';

interface LogoData {
  logoPath: string | null;
}

interface LogoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogoModal({ open, onClose }: LogoModalProps) {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchLogo = useCallback(async () => {
    try {
      const response = await axiosClient.get<ApiResponse<LogoData>>('/admin/settings/logo');
      setLogoPath(response.data.data?.logoPath || null);
    } catch (error) {
      console.error('Failed to fetch logo:', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreview(null);
      fetchLogo();
    }
  }, [open, fetchLogo]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleLogoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('logo', selectedFile);

    try {
      const response = await axiosClient.post<ApiResponse<LogoData>>(
        '/admin/settings/logo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setLogoPath(response.data.data?.logoPath || null);
      setSelectedFile(null);
      setPreview(null);
      onClose();
    } catch (error) {
      console.error('Failed to upload logo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className={cn(styles['modal-overlay'], open && styles.open)} onClick={onClose}>
      <div className={styles['modal-box']} onClick={(e) => e.stopPropagation()}>
        <button className={styles['modal-close']} onClick={onClose}>
          ✕
        </button>
        <div className={styles['modal-title']}>تغيير شعار التطبيق</div>

        <div className={styles['modal-field']}>
          <label>شعار التطبيق</label>
          <div className={styles['logo-preview']}>
            {preview || logoPath ? (
              <img src={preview || logoPath || ''} alt="Logo" className={styles['logo-image']} />
            ) : (
              <div className={styles['logo-placeholder']}>لا يوجد شعار</div>
            )}
          </div>
        </div>

        <div className={styles['modal-field']}>
          <label>اسحب الشعار هنا أو انقر للاختيار</label>
          <div
            {...getRootProps()}
            className={cn(styles['dropzone'], isDragActive && styles['dropzone-active'])}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className={styles['dropzone-file']}>
                <span>📁 {selectedFile.name}</span>
                <button type="button" className={styles['dropzone-remove']} onClick={handleReset}>
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles['dropzone-content']}>
                <span className={styles['dropzone-icon']}>🖼️</span>
                <span>{isDragActive ? 'أفلت الملف هنا' : 'اسحب ملف أو انقر للاختيار'}</span>
                <span className={styles['dropzone-hint']}>PNG, JPG, GIF - الحد الأقصى 5MB</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles['modal-actions']}>
          <Button onClick={handleLogoUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? 'جاري الرفع...' : 'رفع الشعار'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
