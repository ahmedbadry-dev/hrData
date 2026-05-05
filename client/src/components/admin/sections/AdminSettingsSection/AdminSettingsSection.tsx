import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common';
import { Button, Input, Toggle, Logo } from '@/components/ui';
import { cn } from '@/lib/utils';
import { axiosClient } from '@/services/api';
import { logoKeys } from '@/hooks/useLogo';
import styles from './AdminSettingsSection.module.css';

interface AdminSettingsSectionProps {
  onToggleSetting: (name: string, enabled: boolean) => void;
  onSaveEmailSettings: () => void;
  onSaveScraperSettings: () => void;
  onDangerAction: (type: 'clear-logs' | 'reset-settings') => void;
}

interface ToggleRowProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ title, description, defaultChecked = false, onChange }: ToggleRowProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className={styles['settings-row']}>
      <div className={styles['settings-row-info']}>
        <div className={styles['settings-row-label']}>{title}</div>
        <div className={styles['settings-row-desc']}>{description}</div>
      </div>

      <Toggle
        className={styles['toggle-switch']}
        sliderClassName={styles['toggle-slider']}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onChange(e.target.checked);
        }}
      />
    </div>
  );
}

export default function AdminSettingsSection({
  onToggleSetting,
  onSaveEmailSettings,
  onSaveScraperSettings,
  onDangerAction,
}: AdminSettingsSectionProps) {
  const [smtpEmail, setSmtpEmail] = useState('');
  const [scraperInterval, setScraperInterval] = useState(30);
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
    <section>
      <PageHeader
        eyebrow="النظام"
        title="إعدادات النظام"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div className={styles['settings-section']}>
        <div className={styles['settings-section-title']}>الإعدادات العامة</div>

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

        <ToggleRow
          title="التسجيل التلقائي للمستخدمين"
          description="السماح بتسجيل حسابات جديدة"
          defaultChecked
          onChange={(checked) => onToggleSetting('تسجيل المستخدمين', checked)}
        />

        <ToggleRow
          title="وضع الصيانة"
          description="تعطيل الوصول العام مؤقتاً"
          onChange={(checked) => onToggleSetting('وضع الصيانة', checked)}
        />

        <ToggleRow
          title="السجلات التفصيلية"
          description="تسجيل كل العمليات (Debug mode)"
          onChange={(checked) => onToggleSetting('السجلات التفصيلية', checked)}
        />
      </div>

      <div className={styles['settings-section']}>
        <div className={styles['settings-section-title']}>إعدادات البريد الإلكتروني</div>

        <ToggleRow
          title="إرسال تأكيد التسجيل"
          description="بريد ترحيب للمستخدمين الجدد"
          defaultChecked
          onChange={(checked) => onToggleSetting('تأكيد التسجيل', checked)}
        />

        <ToggleRow
          title="إشعارات التقديم الآلي"
          description="إخطار المستخدم عند كل تقديم ناجح"
          defaultChecked
          onChange={(checked) => onToggleSetting('إشعارات التقديم', checked)}
        />

        <div className={styles['settings-input-wrap']}>
          <div className={styles['settings-input-label']}>بريد SMTP المُرسِل</div>
          <div className={styles['token-input-row']}>
            <Input
              type="email"
              placeholder="noreply@hrdata.sa"
              dir="ltr"
              value={smtpEmail}
              onChange={(e) => setSmtpEmail(e.target.value)}
            />
            <Button onClick={onSaveEmailSettings}>حفظ</Button>
          </div>
        </div>
      </div>

      <div className={styles['settings-section']}>
        <div className={styles['settings-section-title']}>إعدادات السكراب</div>

        <ToggleRow
          title="الجدولة التلقائية"
          description="تشغيل السكراب تلقائياً كل ٣٠ دقيقة"
          defaultChecked
          onChange={(checked) => onToggleSetting('الجدولة التلقائية', checked)}
        />

        <ToggleRow
          title="تصفية المكررات"
          description="عدم إضافة وظائف موجودة مسبقاً"
          defaultChecked
          onChange={(checked) => onToggleSetting('تصفية المكررات', checked)}
        />

        <div className={styles['settings-input-wrap']}>
          <div className={styles['settings-input-label']}>
            الفترة الزمنية بين الجولات (بالدقائق)
          </div>
          <div className={styles['token-input-row']}>
            <Input
              type="number"
              value={scraperInterval}
              min={5}
              max={120}
              dir="ltr"
              onChange={(e) => setScraperInterval(Number(e.target.value))}
            />
            <Button onClick={onSaveScraperSettings}>حفظ</Button>
          </div>
        </div>
      </div>

      <div className={cn(styles['settings-section'], styles.danger)}>
        <div className={cn(styles['settings-section-title'], styles.danger)}>منطقة الخطر</div>

        <div className={styles['settings-row']}>
          <div className={styles['settings-row-info']}>
            <div className={cn(styles['settings-row-label'], styles.danger)}>مسح جميع السجلات</div>
            <div className={styles['settings-row-desc']}>حذف كافة سجلات النظام نهائياً</div>
          </div>
          <Button
            className={cn(styles['action-btn'], styles.danger)}
            onClick={() => onDangerAction('clear-logs')}
          >
            مسح الكل
          </Button>
        </div>

        <div className={styles['settings-row']}>
          <div className={styles['settings-row-info']}>
            <div className={cn(styles['settings-row-label'], styles.danger)}>
              إعادة ضبط الإعدادات
            </div>
            <div className={styles['settings-row-desc']}>استعادة الإعدادات الافتراضية للنظام</div>
          </div>
          <Button
            className={cn(styles['action-btn'], styles.danger)}
            onClick={() => onDangerAction('reset-settings')}
          >
            إعادة ضبط
          </Button>
        </div>
      </div>
    </section>
  );
}
