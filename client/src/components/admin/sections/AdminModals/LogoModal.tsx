import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { axiosClient } from '@/services/api';
import { Logo } from '@/components/ui/Logo/Logo';
import { logoKeys } from '@/hooks/useLogo';
import styles from './AdminModals.module.css';

interface LogoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogoModal({ open, onClose }: LogoModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

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
      await axiosClient.post('/admin/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      queryClient.invalidateQueries({ queryKey: logoKeys.all });
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
            <Logo className={styles['logo-image']} />
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
                <p className={styles['upload-note']}>
                  * ملحوظة: يفضل رفع الشعار بصيغة <strong>PNG</strong> وبدون خلفية (شفاف) للحصول على
                  أفضل مظهر.
                </p>
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
