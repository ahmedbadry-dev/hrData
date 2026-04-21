import { useState } from 'react';
import type { AdminAnnouncement } from '@/components/admin/sections/adminData';
import { EmptyState, PageHeader } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import styles from './AdminAnnouncementsSection.module.css';

interface AdminAnnouncementsSectionProps {
  announcements: AdminAnnouncement[];
  onDelete: (id: string | number) => void;
  onOpenCreate: () => void;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

const typeLabels: Record<AdminAnnouncement['type'], string> = {
  info: 'معلوماتي',
  warn: 'تحذير',
  success: 'نجاح',
  danger: 'تنبيه',
};

export default function AdminAnnouncementsSection({
  announcements,
  onDelete,
  onOpenCreate,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  onPageChange,
}: AdminAnnouncementsSectionProps) {
  const [pendingDelete, setPendingDelete] = useState<string | number | null>(null);

  const handleDeleteClick = (id: string | number) => {
    setPendingDelete(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDelete !== null) {
      onDelete(pendingDelete);
      setPendingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <>
      {pendingDelete !== null && (
        <div className={styles['confirm-overlay']} onClick={handleCancelDelete}>
          <div className={styles['confirm-dialog']} onClick={(e) => e.stopPropagation()}>
            <p className={styles['confirm-text']}>هل أنت متأكد من حذف هذا الإشعار؟</p>
            <div className={styles['confirm-actions']}>
              <Button className={styles['confirm-btn-cancel']} onClick={handleCancelDelete}>
                إلغاء
              </Button>
              <Button className={styles['confirm-btn-delete']} onClick={handleConfirmDelete}>
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
      <section>
        <PageHeader
          eyebrow="الإدارة"
          title="الإشعارات والإعلانات"
          eyebrowClassName={styles['section-eyebrow']}
          titleClassName={styles['section-headline']}
        />

        <div className={styles['announce-top']}>
          <span className={styles['announce-count']}>{announcements.length} إشعار / إعلان</span>
          <Button className={styles['btn-primary']} onClick={onOpenCreate}>
            + إرسال إشعار جديد
          </Button>
        </div>

        <div>
          {announcements.length === 0 && !isLoading ? (
            <EmptyState
              symbol={<NotificationIcon />}
              title="لا توجد إشعارات"
              description="لا توجد إشعارات حتى الآن"
            />
          ) : (
            announcements.map((a, i) => (
              <div
                className={cn(styles['announce-card'], styles[a.type])}
                style={{ animationDelay: `${i * 0.07}s` }}
                key={a.id}
              >
                <div className={styles['announce-head']}>
                  <div>
                    <div className={styles['announce-title']}>{a.title}</div>
                    <div className={styles['announce-meta']}>
                      {a.target} · {a.date}
                    </div>
                  </div>

                  <div className={styles['announce-actions']}>
                    <Badge className={styles['type-badge']}>{typeLabels[a.type]}</Badge>
                    <Button
                      className={cn(styles['action-btn'], styles.danger)}
                      onClick={() => handleDeleteClick(a.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>

                <div className={styles['announce-body']}>{a.body}</div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && onPageChange && (
          <div className={styles['pagination']}>
            <Button
              className={styles['page-btn']}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              السابق
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className={styles['ellipsis']}>
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  className={cn(styles['page-btn'], page === currentPage && styles['active'])}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              className={styles['page-btn']}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              التالي
            </Button>
          </div>
        )}
      </section>
    </>
  );
}

function NotificationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
