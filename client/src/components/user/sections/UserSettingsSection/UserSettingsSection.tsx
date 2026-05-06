import { useState } from 'react';
import { PageHeader } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './UserSettingsSection.module.css';

interface UserSettingsSectionProps {
  gmailConnected: boolean;
  gmailEmail: string | null;
  savedCount: number;
  returnToAutoApply: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onGoAutoApply: () => void;
}

export default function UserSettingsSection({
  gmailConnected,
  gmailEmail,
  savedCount,
  returnToAutoApply,
  onConnect,
  onDisconnect,
  onGoAutoApply,
}: UserSettingsSectionProps) {
  const [loading, setLoading] = useState(false);

  return (
    <section>
      <PageHeader title="الإعدادات" titleClassName={styles['section-headline']} />

      {returnToAutoApply && !gmailConnected ? (
        <div className={styles['return-hint']}>← اربط حسابك ثم سنعيدك تلقائياً للتقديم الآلي</div>
      ) : null}

      <div className={styles['chart-container']}>
        <div className={styles['chart-title']}>ربط حساب Gmail</div>
        <div className={styles['chart-desc']}>
          ربط حساب Gmail يتيح لك إرسال رسائل التقديم مباشرة من المنصة
        </div>
        <div className={styles['gmail-warning-note']}>
          ⚠️ <strong>ملحوظة هامة جداً:</strong> عند تسجيل الدخول بجوجل، يجب عليك تفعيل خيار
          <strong> "Send email on your behalf"</strong> في شاشة الأذونات لكي يتمكن النظام من إرسال
          الإيميلات بنجاح.
        </div>

        <div className={styles['control-row']}>
          <div>
            <div className={styles['row-title']}>حالة الاتصال</div>
            <Badge className={styles['row-sub']} variant={gmailConnected ? 'success' : 'warning'}>
              {gmailConnected ? '✓ متصل' : 'غير متصل'}
            </Badge>
          </div>

          {gmailConnected ? (
            <Button className={cn(styles['btn-primary'], styles.disconnect)} onClick={onDisconnect}>
              فصل الاتصال
            </Button>
          ) : (
            <Button
              className={styles['btn-primary']}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await onConnect();
                setLoading(false);
              }}
            >
              {loading ? 'جاري الربط...' : 'ربط الحساب'}
            </Button>
          )}
        </div>

        {gmailConnected ? (
          <div className={styles['control-row']}>
            <div>
              <div className={styles['row-title']}>البريد المرتبط</div>
              <div className={styles['row-sub']}>{gmailEmail || '—'}</div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles['chart-container']}>
        <div className={styles['chart-title']}>معلومات</div>
        <div className={styles['chart-desc']}>إعدادات إضافية للتقديم الآلي</div>

        <div className={styles['control-row']}>
          <div>
            <div className={styles['row-title']}>الوظائف المحفوظة</div>
            <div className={styles['row-sub']}>{savedCount} وظيفة</div>
          </div>
        </div>

        <div className={styles['control-row']}>
          <div>
            <div className={styles['row-title']}>إصدار المنصة</div>
            <div className={styles['row-sub']}>HR Data 2026</div>
          </div>
        </div>
      </div>

      {returnToAutoApply ? (
        <div className={styles['back-wrap']}>
          <Button className={styles['btn-ghost']} onClick={onGoAutoApply}>
            ← العودة للتقديم الآلي
          </Button>
        </div>
      ) : null}
    </section>
  );
}
