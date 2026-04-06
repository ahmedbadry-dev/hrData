import { useState } from 'react';
import styles from './UserSettingsSection.module.css';

interface UserSettingsSectionProps {
  gmailConnected: boolean;
  savedCount: number;
  returnToAutoApply: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onGoAutoApply: () => void;
}

export default function UserSettingsSection({
  gmailConnected,
  savedCount,
  returnToAutoApply,
  onConnect,
  onDisconnect,
  onGoAutoApply,
}: UserSettingsSectionProps) {
  const [loading, setLoading] = useState(false);

  return (
    <section>
      <div className={styles['section-headline']}>الإعدادات</div>

      {returnToAutoApply && !gmailConnected ? (
        <div className={styles['return-hint']}>← اربط حسابك ثم سنعيدك تلقائياً للتقديم الآلي</div>
      ) : null}

      <div className={styles['chart-container']}>
        <div className={styles['chart-title']}>ربط حساب Gmail</div>
        <div className={styles['chart-desc']}>
          ربط حساب Gmail يتيح لك إرسال رسائل التقديم مباشرة من المنصة
        </div>

        <div className={styles['control-row']}>
          <div>
            <div className={styles['row-title']}>حالة الاتصال</div>
            <div className={styles['row-sub']}>{gmailConnected ? '✓ متصل' : 'غير متصل'}</div>
          </div>

          {gmailConnected ? (
            <button className={`${styles['btn-primary']} ${styles.disconnect}`} onClick={onDisconnect}>
              فصل الاتصال
            </button>
          ) : (
            <button
              className={styles['btn-primary']}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await onConnect();
                setLoading(false);
              }}
            >
              {loading ? 'جاري الربط...' : 'ربط الحساب'}
            </button>
          )}
        </div>

        {gmailConnected ? (
          <div className={styles['control-row']}>
            <div>
              <div className={styles['row-title']}>البريد المرتبط</div>
              <div className={styles['row-sub']}>user@gmail.com</div>
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
            <div className={styles['row-sub']}>كُفُـؤ 2026</div>
          </div>
        </div>
      </div>

      {returnToAutoApply ? (
        <div className={styles['back-wrap']}>
          <button className={styles['btn-ghost']} onClick={onGoAutoApply}>
            ← العودة للتقديم الآلي
          </button>
        </div>
      ) : null}
    </section>
  );
}
