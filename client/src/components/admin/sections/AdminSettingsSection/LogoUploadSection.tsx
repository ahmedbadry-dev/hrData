import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { axiosClient } from '@/services/api';
import { Logo } from '@/components/ui/Logo/Logo';
import { logoKeys } from '@/hooks/useLogo';
import styles from './AdminSettingsSection.module.css';

export default function LogoUploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

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
    } catch (error) {
      console.error('Failed to upload logo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className={styles['logo-upload-container']}>
      <div className={styles['settings-input-label']}>شعار التطبيق</div>
      <div className={styles['logo-preview']}>
        <Logo fallback="HR Data" className={styles['logo-image']} />
      </div>
      <div className={styles['logo-upload-row']}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles['logo-file-input']}
          id="logo-upload"
        />
        <label htmlFor="logo-upload" className={styles['logo-file-label']}>
          اختيار ملف
        </label>
        {selectedFile && (
          <>
            <span className={styles['logo-filename']}>{selectedFile.name}</span>
            <Button onClick={handleLogoUpload} disabled={isUploading}>
              {isUploading ? 'جاري الرفع...' : 'رفع الشعار'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
