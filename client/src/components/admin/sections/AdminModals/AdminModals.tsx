import { cn } from '@/lib/utils';
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
  type: 'info' | 'warn' | 'success' | 'danger';
  target: string;
}

interface AdminModalsProps {
  editOpen: boolean;
  editForm: EditUserForm;
  onEditChange: (patch: Partial<EditUserForm>) => void;
  onSaveEdit: () => void;
  onCloseEdit: () => void;
  announceOpen: boolean;
  announceForm: AnnouncementForm;
  onAnnounceChange: (patch: Partial<AnnouncementForm>) => void;
  onSaveAnnounce: () => void;
  onCloseAnnounce: () => void;
}

export default function AdminModals({
  editOpen,
  editForm,
  onEditChange,
  onSaveEdit,
  onCloseEdit,
  announceOpen,
  announceForm,
  onAnnounceChange,
  onSaveAnnounce,
  onCloseAnnounce,
}: AdminModalsProps) {
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

      <div className={cn(styles['modal-overlay'], announceOpen && styles.open)}>
        <div className={styles['modal-box']}>
          <button className={styles['modal-close']} onClick={onCloseAnnounce}>
            ✕
          </button>
          <div className={styles['modal-title']}>إرسال إشعار / إعلان</div>

          <div className={styles['modal-field']}>
            <label>العنوان</label>
            <input
              type="text"
              placeholder="عنوان الإشعار"
              value={announceForm.title}
              onChange={(e) => onAnnounceChange({ title: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>الرسالة</label>
            <textarea
              rows={3}
              placeholder="نص الرسالة..."
              value={announceForm.body}
              onChange={(e) => onAnnounceChange({ body: e.target.value })}
            />
          </div>

          <div className={styles['modal-field']}>
            <label>النوع</label>
            <select
              value={announceForm.type}
              onChange={(e) =>
                onAnnounceChange({ type: e.target.value as AnnouncementForm['type'] })
              }
            >
              <option value="info">معلوماتي</option>
              <option value="warn">تحذير</option>
              <option value="success">نجاح</option>
              <option value="danger">خطأ / تنبيه</option>
            </select>
          </div>

          <div className={styles['modal-field']}>
            <label>المستهدف</label>
            <select
              value={announceForm.target}
              onChange={(e) => onAnnounceChange({ target: e.target.value })}
            >
              <option>جميع المستخدمين</option>
              <option>المستخدمون النشطون فقط</option>
              <option>إدارة النظام</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button className={styles['btn-primary']} onClick={onSaveAnnounce}>
              إرسال الإشعار
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
