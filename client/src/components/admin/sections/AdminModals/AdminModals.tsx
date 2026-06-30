import { cn } from '@/lib/utils';
import { NotificationType } from '@/constants/enums';
import type { AdminUser } from '@/components/admin/sections/adminData';
import styles from './AdminModals.module.css';

export interface EditUserForm {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
}

export interface AnnouncementForm {
  title: string;
  body: string;
  type: NotificationType;
}

interface AdminModalsProps {
  editOpen: boolean;
  editForm: EditUserForm;
  onEditChange: (patch: Partial<EditUserForm>) => void;
  onSaveEdit: () => void;
  onCloseEdit: () => void;
  quotaRestoreOpen?: boolean;
  quotaRestoreUser?: AdminUser | null;
  quotaRestoreReason?: string;
  onQuotaRestoreReasonChange?: (reason: string) => void;
  onConfirmQuotaRestore?: () => void;
  onCloseQuotaRestore?: () => void;
  quotaRestoreSubmitting?: boolean;
  announceOpen: boolean;
  announceForm: AnnouncementForm;
  onAnnounceChange: (patch: Partial<AnnouncementForm>) => void;
  onSaveAnnounce: () => void;
  onCloseAnnounce: () => void;
  announceSubmitting?: boolean;
}

export default function AdminModals({
  editOpen,
  editForm,
  onEditChange,
  onSaveEdit,
  onCloseEdit,
  quotaRestoreOpen = false,
  quotaRestoreUser = null,
  quotaRestoreReason = '',
  onQuotaRestoreReasonChange,
  onConfirmQuotaRestore,
  onCloseQuotaRestore,
  quotaRestoreSubmitting = false,
  announceOpen,
  announceForm,
  onAnnounceChange,
  onSaveAnnounce,
  onCloseAnnounce,
  announceSubmitting,
}: AdminModalsProps) {
  const quota = quotaRestoreUser?.quota;
  const lastQuotaResetLabel = quota?.lastQuotaResetAt
    ? new Date(quota.lastQuotaResetAt).toLocaleString('ar-SA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'لا يوجد';

  return (
    <>
      <div className={cn(styles['modal-overlay'], editOpen && styles.open)} onClick={onCloseEdit}>
        <div className={styles['modal-box']} onClick={(e) => e.stopPropagation()}>
          <button className={styles['modal-close']} onClick={onCloseEdit}>
            ✕
          </button>
          <div className={styles['modal-title']}>تعديل بيانات المستخدم</div>

          <div className={styles['modal-field']}>
            <label>الاسم الكامل</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onEditChange({ name: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              dir="ltr"
              value={editForm.email}
              readOnly
              className={styles['readonly-field']}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>رقم الجوال</label>
            <input
              type="tel"
              dir="ltr"
              value={editForm.phone}
              onChange={(e) => onEditChange({ phone: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>الحالة</label>
            <select
              value={editForm.status}
              onChange={(e) => onEditChange({ status: e.target.value as EditUserForm['status'] })}
            >
              <option value="active">نشط</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button className={styles['btn-primary']} onClick={onSaveEdit}>
              حفظ التغييرات
            </button>
            <button className={styles['btn-ghost']} onClick={onCloseEdit}>
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(styles['modal-overlay'], quotaRestoreOpen && styles.open)}
        onClick={onCloseQuotaRestore}
      >
        <div className={styles['modal-box']} onClick={(e) => e.stopPropagation()}>
          <button className={styles['modal-close']} onClick={onCloseQuotaRestore}>
            ×
          </button>
          <div className={styles['modal-title']}>تجديد كوتة الإيميلات</div>

          {quotaRestoreUser ? (
            <div className={styles['quota-summary']}>
              <div className={styles['quota-user-name']}>{quotaRestoreUser.name}</div>
              <div className={styles['quota-user-email']}>{quotaRestoreUser.email}</div>
              <div className={styles['quota-grid']}>
                <div>
                  <span>الاستخدام</span>
                  <strong>
                    {quota?.emailsUsedToday ?? 0}/{quota?.dailyEmailLimit ?? 50}
                  </strong>
                </div>
                <div>
                  <span>المتبقي</span>
                  <strong>{quota?.remaining ?? 0}</strong>
                </div>
                <div>
                  <span>آخر تجديد</span>
                  <strong>{lastQuotaResetLabel}</strong>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles['modal-field']}>
            <label>سبب التجديد</label>
            <textarea
              rows={3}
              placeholder="اكتب سبب تجديد الكوتة"
              value={quotaRestoreReason}
              onChange={(e) => onQuotaRestoreReasonChange?.(e.target.value)}
            />
          </div>

          <div className={styles['modal-actions']}>
            <button
              className={styles['btn-primary']}
              onClick={onConfirmQuotaRestore}
              disabled={quotaRestoreSubmitting}
            >
              {quotaRestoreSubmitting ? 'جاري التجديد...' : 'تأكيد التجديد'}
            </button>
            <button className={styles['btn-ghost']} onClick={onCloseQuotaRestore}>
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(styles['modal-overlay'], announceOpen && styles.open)}
        onClick={onCloseAnnounce}
      >
        <div className={styles['modal-box']} onClick={(e) => e.stopPropagation()}>
          <button className={styles['modal-close']} onClick={onCloseAnnounce}>
            ✕
          </button>
          <div className={styles['modal-title']}>إرسال إشعار جديد</div>

          <div className={styles['modal-field']}>
            <label>عنوان الإشعار</label>
            <input
              type="text"
              placeholder="اكتب عنوان الإشعار"
              value={announceForm.title}
              onChange={(e) => onAnnounceChange({ title: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>نص الإشعار</label>
            <textarea
              rows={3}
              placeholder="اكتب نص الإشعار"
              value={announceForm.body}
              onChange={(e) => onAnnounceChange({ body: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>نوع الإشعار</label>
            <select
              value={announceForm.type}
              onChange={(e) =>
                onAnnounceChange({ type: e.target.value as AnnouncementForm['type'] })
              }
            >
              <option value={NotificationType.INFO}>معلومة</option>
              <option value={NotificationType.SUCCESS}>نجاح</option>
              <option value={NotificationType.WARNING}>تحذير</option>
              <option value={NotificationType.ALERT}>تنبيه</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button
              className={styles['btn-primary']}
              onClick={onSaveAnnounce}
              disabled={announceSubmitting}
            >
              {announceSubmitting ? 'جارٍ الإرسال...' : 'إرسال'}
            </button>
            <button className={styles['btn-ghost']} onClick={onCloseAnnounce}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
