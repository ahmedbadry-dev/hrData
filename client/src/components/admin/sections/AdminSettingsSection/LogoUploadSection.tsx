import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { axiosClient } from '@/services/api';
import styles from './AdminSettingsSection.module.css';

interface LogoResponse {
  logoPath: string | null;
}

export default function LogoUploadSection() {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await axiosClient.get<LogoResponse>('/admin/settings/logo');
      setLogoPath(response.data.logoPath);
    } catch (error) {
      console.error('Failed to fetch logo:', error);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('logo', selectedFile);

    try {
      const response = await axiosClient.post<LogoResponse>('/admin/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLogoPath(response.data.logoPath);
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
        {logoPath ? (
          <img src={logoPath} alt="Logo" className={styles['logo-image']} />
        ) : (
          <div className={styles['logo-placeholder']}>لا يوجد شعار</div>
        )}
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
