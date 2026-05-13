import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import type { SavedJob } from '@/components/user/sections/userData';
import type { ApplicationsQuota, ScheduleApplicationsResponse } from '@/modules/applications/types';
import { EmptyState, PageHeader } from '@/components/common';
import { Button, Input } from '@/components/ui';
import styles from './UserAutoApplySection.module.css';

const MAX_SELECTED_JOBS = 20;
const LOW_REMAINING_WARNING_THRESHOLD = 5;
const DAILY_LIMIT_BLOCK_MESSAGE = 'لا يمكن إرسال مزيد من الإيميلات اليومية، لقد تجاوزت الحد اليومي';

interface UserAutoApplySectionProps {
  savedJobs: SavedJob[];
  gmailConnected: boolean;
  gmailEmail: string | null;
  quota: ApplicationsQuota | null;
  isQuotaLoading?: boolean;
  onGoToSettings: () => void;
  onGoSavedJobs: () => void;
  onStartSending: (
    payload: {
      selected: SavedJob[];
      scheduleTime: string;
      delay: string;
      cv: File | null;
      body: string;
    },
    onSuccess: (result: ScheduleApplicationsResponse) => void,
    onError: () => void
  ) => void;
  onGoAnalytics: () => void;
  onGoHome: () => void;
}

const professionalEmailBody = `السلام عليكم ورحمة الله وبركاته،

أتقدم بهذه الرسالة مُعبِّراً عن اهتمامي الصادق بالانضمام إلى فريقكم الكريم، وذلك في ضوء ما تُقدِّمه مؤسستكم من بيئة عمل محفِّزة وفرص واعدة للنمو المهني.

أحمل مؤهلاً أكاديمياً ملائماً، وخبرةً عملية أسهمت في تطوير مهاراتي التحليلية وقدراتي على العمل ضمن فريق متكامل. وأُرفق بهذه الرسالة سيرتي الذاتية المُفصَّلة للاطلاع على مسيرتي المهنية وإنجازاتي.

يسعدني التواصل معكم في الوقت المناسب لمناقشة كيفية إسهامي في تحقيق أهداف مؤسستكم.

وتفضلوا بقبول فائق الاحترام والتقدير،`;

const getSavedJobSelectionKey = (job: SavedJob, index: number): string =>
  job.jobId ?? `${job.company}-${job.role}-${index}`;

const formatResetDate = (resetsAt: string | null): string | null => {
  if (!resetsAt) {
    return null;
  }

  const resetDate = new Date(resetsAt);
  if (Number.isNaN(resetDate.getTime())) {
    return null;
  }

  return resetDate.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatResetCountdown = (resetsAt: string | null, nowMs: number): string | null => {
  if (!resetsAt) {
    return null;
  }

  const resetMs = new Date(resetsAt).getTime();
  if (Number.isNaN(resetMs)) {
    return null;
  }

  const diffMs = resetMs - nowMs;
  if (diffMs <= 60 * 1000) {
    return 'أقل من دقيقة';
  }

  const totalMinutes = Math.ceil(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }

  if (hours > 0) {
    return `${hours} ساعة`;
  }

  return `${minutes} دقيقة`;
};

export default function UserAutoApplySection({
  savedJobs,
  gmailConnected,
  gmailEmail,
  quota,
  isQuotaLoading = false,
  onGoToSettings,
  onGoSavedJobs,
  onStartSending,
  onGoAnalytics,
  onGoHome,
}: UserAutoApplySectionProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [subject] = useState('طلب انضمام — [المسمى الوظيفي]');
  const [body, setBody] = useState(professionalEmailBody);
  const [selectedCv, setSelectedCv] = useState<File | null>(null);
  const [scheduleTime, setScheduleTime] = useState('immediately');
  const [delay, setDelay] = useState('30');
  const [lastScheduledCount, setLastScheduledCount] = useState<number>(0);
  const [lastSkippedCount, setLastSkippedCount] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [isSending, setIsSending] = useState(false);

  const previousRemainingRef = useRef<number | null>(null);
  const shownBlockingToastRef = useRef<string | null>(null);

  const savedJobKeys = useMemo(
    () => savedJobs.map((job, index) => getSavedJobSelectionKey(job, index)),
    [savedJobs]
  );

  const remainingQuota = Math.max(quota?.remaining ?? MAX_SELECTED_JOBS, 0);
  const effectiveSelectionLimit = Math.min(MAX_SELECTED_JOBS, remainingQuota);
  const resetDateLabel = useMemo(() => formatResetDate(quota?.resetsAt ?? null), [quota?.resetsAt]);
  const resetCountdownLabel = useMemo(
    () => formatResetCountdown(quota?.resetsAt ?? null, nowMs),
    [nowMs, quota?.resetsAt]
  );
  const isQuotaBlocked = Boolean(quota && remainingQuota <= 0);

  useEffect(() => {
    setNowMs(Date.now());
    if (!quota?.resetsAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [quota?.resetsAt]);

  useEffect(() => {
    setSelectedMap((previous) => {
      const nextSelection: Record<string, boolean> = {};
      const selectedInOrder = savedJobKeys
        .filter((key) => Boolean(previous[key]))
        .slice(0, effectiveSelectionLimit);

      for (const key of selectedInOrder) {
        nextSelection[key] = true;
      }

      const previousSelectedKeys = Object.keys(previous).filter((key) => Boolean(previous[key]));
      if (
        previousSelectedKeys.length === selectedInOrder.length &&
        selectedInOrder.every((key) => Boolean(previous[key]))
      ) {
        return previous;
      }

      if (previousSelectedKeys.length > selectedInOrder.length && effectiveSelectionLimit >= 0) {
        if (isQuotaBlocked) {
          setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
        } else if (remainingQuota > 0) {
          setSelectionError(
            `يمكنك اختيار ${remainingQuota} وظيفة كحد أقصى حسب الحد المتبقي اليوم.`
          );
        }
      }

      return nextSelection;
    });
  }, [effectiveSelectionLimit, isQuotaBlocked, remainingQuota, savedJobKeys]);

  const selectedJobs = useMemo(
    () => savedJobs.filter((_, index) => Boolean(selectedMap[savedJobKeys[index]])),
    [savedJobKeys, savedJobs, selectedMap]
  );

  const selectedCount = selectedJobs.length;

  useEffect(() => {
    if (!quota) {
      return;
    }

    if (
      quota.remaining > 0 &&
      quota.remaining <= LOW_REMAINING_WARNING_THRESHOLD &&
      (previousRemainingRef.current === null ||
        previousRemainingRef.current > LOW_REMAINING_WARNING_THRESHOLD)
    ) {
      showToast({
        message: `تنبيه: متبقي لديك ${quota.remaining} طلبات فقط قبل الوصول للحد اليومي.`,
        type: 'warning',
      });
    }

    if (quota.remaining <= 0) {
      const lockKey = quota.resetsAt ?? 'no-reset';
      if (shownBlockingToastRef.current !== lockKey) {
        showToast({
          message: resetDateLabel
            ? `لقد وصلت إلى الحد اليومي. يمكنك الإرسال مجدداً في ${resetDateLabel}.`
            : 'لقد وصلت إلى الحد اليومي لإرسال الإيميلات.',
          type: 'error',
        });
        shownBlockingToastRef.current = lockKey;
      }
    } else {
      shownBlockingToastRef.current = null;
    }

    previousRemainingRef.current = quota.remaining;
  }, [quota, resetDateLabel, showToast]);

  const handleSelectionChange = (jobKey: string, checked: boolean, locked: boolean) => {
    const isCurrentlySelected = Boolean(selectedMap[jobKey]);

    if (checked && locked) {
      setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
      return;
    }

    if (checked && isQuotaBlocked) {
      setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
      return;
    }

    if (checked && !isCurrentlySelected && selectedCount >= effectiveSelectionLimit) {
      if (effectiveSelectionLimit <= 0) {
        setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
      } else {
        setSelectionError(
          `يمكن اختيار ${effectiveSelectionLimit} وظيفة كحد أقصى حسب الحد المتبقي اليوم.`
        );
      }
      return;
    }

    setSelectionError(null);
    setSelectedMap((previous) => ({
      ...previous,
      [jobKey]: checked,
    }));
  };

  const handleSelectFirstJobs = () => {
    if (effectiveSelectionLimit <= 0) {
      setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
      return;
    }

    // Select only the first 10 jobs (or less if limit/available jobs are less)
    const selectCount = Math.min(10, effectiveSelectionLimit, savedJobs.length);
    const nextSelection: Record<string, boolean> = {};

    for (let index = 0; index < selectCount; index++) {
      nextSelection[savedJobKeys[index]] = true;
    }

    setSelectionError(null);
    setSelectedMap(nextSelection);
  };

  const handleDeselectAll = () => {
    setSelectedMap({});
    setSelectionError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast({ message: 'يرجى رفع ملف PDF فقط', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت', type: 'error' });
      return;
    }

    setSelectedCv(file);
  };

  const renderQuotaPanel = () => {
    if (isQuotaLoading && !quota) {
      return <div className={styles['quota-card']}>جاري تحميل حالة الحد اليومي...</div>;
    }

    if (!quota) {
      return (
        <div className={styles['quota-card']}>
          تعذر جلب حالة الحد اليومي حالياً. يمكنك المتابعة، وسيتم تحديث البيانات تلقائياً.
        </div>
      );
    }

    if (quota.remaining <= 0) {
      return (
        <div className={`${styles['quota-card']} ${styles['quota-card-blocked']}`} role="alert">
          <strong className={styles['quota-title']}>
            لقد وصلت إلى الحد اليومي. يمكنك الإرسال مجدداً في{' '}
            {resetDateLabel ?? 'موعد التحديث القادم'}.
          </strong>
          {resetCountdownLabel ? (
            <div className={styles['quota-subtext']}>
              يتبقى لإعادة التفعيل: {resetCountdownLabel}
            </div>
          ) : null}
          <div className={styles['quota-subtext']}>
            الاستخدام اليومي: {quota.emailsUsedToday} من {quota.dailyEmailLimit}
          </div>
        </div>
      );
    }

    return (
      <div className={styles['quota-card']}>
        <strong className={styles['quota-title']}>
          لديك {quota.remaining} طلبات متبقية اليوم من أصل {quota.dailyEmailLimit}.
        </strong>
        <div className={styles['quota-subtext']}>
          تم استخدام {quota.emailsUsedToday} طلباً حتى الآن.
        </div>
        {quota.resetsAt && resetCountdownLabel ? (
          <div className={styles['quota-subtext']}>
            سيتم إعادة الضبط بعد: {resetCountdownLabel} ({resetDateLabel})
          </div>
        ) : null}
      </div>
    );
  };

  if (!gmailConnected) {
    return (
      <section>
        <PageHeader title="التقديم الآلي" titleClassName={styles['section-headline']} />
        <div className={styles['warning-card']}>
          <div className={styles['warning-icon']}>⚠</div>
          <div className={styles['warning-title']}>يرجى ربط حساب Gmail أولاً</div>
          <div className={styles['warning-desc']}>
            لاستخدام التقديم الآلي وإرسال طلباتك مباشرة من المنصة، يجب ربط حساب Gmail الخاص بك من
            صفحة الإعدادات.
            <div className={styles['gmail-note-box']}>
              ⚠️ <strong>هام جداً:</strong> عند الربط، تأكد من تفعيل خيار
              <span style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                {' '}
                (Send email on your behalf){' '}
              </span>
              لكي يعمل الإرسال بنجاح.
            </div>
          </div>
          <Button className={styles['btn-primary']} onClick={onGoToSettings}>
            الذهاب إلى الإعدادات
          </Button>
        </div>
      </section>
    );
  }

  if (step === 3) {
    return (
      <section>
        {renderQuotaPanel()}
        <EmptyState
          symbol="✓"
          title={`تم جدولة إرسال ${lastScheduledCount} رسائل بنجاح!`}
          description={
            <>
              الوقت: {scheduleTime === 'immediately' ? 'فوراً' : scheduleTime}
              <br />
              التأخير: {delay} ثانية بين كل رسالة
              {lastSkippedCount > 0 ? (
                <>
                  <br />
                  تم تجاوز {lastSkippedCount} وظيفة بسبب الحد اليومي.
                </>
              ) : null}
            </>
          }
          className={styles['welcome-state']}
          symbolClassName={styles['big-number-success']}
          titleClassName={styles['success-title']}
          descriptionClassName={styles['success-meta']}
          action={
            <div className={styles.actions}>
              <Button className={styles['btn-primary']} onClick={onGoAnalytics}>
                الذهاب للتحليلات والتتبع →
              </Button>
              <Button className={styles['btn-ghost']} onClick={onGoHome}>
                العودة للرئيسية
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  if (step === 2) {
    return (
      <section>
        {renderQuotaPanel()}
        <PageHeader
          title={
            <>
              جدولة الإرسال <span className={styles['step-label']}>— خطوة 2 من 2</span>
            </>
          }
          titleClassName={styles['section-headline']}
        />

        <div className={styles['chart-container']}>
          <div className={styles['chart-title']}>💡 نصائح لوقت الإرسال المثالي</div>
          <ul>
            <li>أفضل وقت للإرسال: من 8:00 صباحاً حتى 3:00 مساءً</li>
            <li>تجنب الإرسال في عطلة نهاية الأسبوع</li>
            <li>الإرسال صباحاً يزيد من فرصة الاطلاع على رسالتك</li>
            <li>استخدم التأخير البشري لتجنب تصنيف الرسائل كـ Spam</li>
          </ul>
        </div>

        <div className={styles['field-wrap']}>
          <span className={styles['search-label']}>وقت بدء الإرسال</span>
          <select value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}>
            <option value="immediately">فوراً</option>
            {import.meta.env.VITE_APP_ENV === 'development' && (
              <>
                <option value="test10s">10 ثواني (اختبار)</option>
                <option value="test1m">1 دقيقة (اختبار)</option>
                <option value="test5m">5 دقائق (اختبار)</option>
              </>
            )}
            <option value="8am">8:00 صباحاً (موصى به)</option>
            <option value="9am">9:00 صباحاً</option>
            <option value="10am">10:00 صباحاً</option>
            <option value="2pm">2:00 مساءً</option>
            <option value="3pm">3:00 مساءً</option>
            <option value="tomorrow8am">غداً 8:00 صباحاً</option>
          </select>
        </div>

        <div className={styles['field-wrap']}>
          <span className={styles['search-label']}>التأخير بين كل إيميل</span>
          <select value={delay} onChange={(e) => setDelay(e.target.value)}>
            <option value="60">1 دقيقة (موصى به)</option>
            <option value="120">2 دقيقة</option>
            <option value="300">5 دقائق</option>
          </select>
        </div>

        <div className={styles['summary-card']}>
          <div className={styles['company-tag']}>عدد الرسائل: {selectedJobs.length}</div>
          <div className={styles['meta-chip']}>الملف المرفق: {selectedCv?.name ?? 'لا يوجد'}</div>
        </div>

        <div className={styles['control-bar']}>
          <Button className={styles['btn-ghost']} onClick={() => setStep(1)}>
            ← السابق
          </Button>
          <Button
            className={styles['btn-primary']}
            disabled={!selectedCv || selectedJobs.length === 0 || isQuotaBlocked || isSending}
            isLoading={isSending}
            onClick={() => {
              if (isSending) return;
              setIsSending(true);
              onStartSending(
                { selected: selectedJobs, scheduleTime, delay, cv: selectedCv, body },
                (result) => {
                  setIsSending(false);
                  setLastScheduledCount(result.scheduledCount);
                  setLastSkippedCount(result.skippedCount);
                  setStep(3);
                },
                () => {
                  setIsSending(false);
                }
              );
            }}
          >
            بدء الإرسال 🚀
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section>
      {renderQuotaPanel()}
      <PageHeader
        title={
          <>
            التقديم الآلي <span className={styles['step-label']}>— خطوة 1 من 2</span>
          </>
        }
        titleClassName={styles['section-headline']}
      />

      <div className={styles['connected-box']}>
        <div>
          <div className={styles['connected-title']}>حساب Gmail مربوط بنجاح</div>
          <div className={styles['connected-email']}>{gmailEmail || 'gmail@connected-account'}</div>
        </div>
        <Button className={styles['btn-ghost']} onClick={onGoToSettings}>
          تغيير
        </Button>
      </div>

      <div className={styles['field-wrap']}>
        <span className={styles['search-label']}>عنوان البريد الإلكتروني</span>
        <Input type="text" value={subject} readOnly />
      </div>

      <div className={styles['field-wrap']}>
        <span className={styles['search-label']}>نص الرسالة</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className={styles['field-wrap']}>
        <span className={styles['search-label']}>السيرة الذاتية</span>

        <label className={`${styles['upload-box']} ${selectedCv ? styles.selected : ''}`}>
          <input type="file" accept=".pdf" onChange={handleFileSelect} />
          {selectedCv ? (
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ {selectedCv.name}</span>
          ) : (
            <span>اختر ملف PDF</span>
          )}
        </label>
      </div>

      {savedJobs.length === 0 ? (
        <div className={styles['empty-card']}>
          <div>لا توجد وظائف محفوظة للتقديم</div>
          <small>احفظ وظائف من قسم «اكتشف الوظائف» أولاً</small>
        </div>
      ) : (
        <div className={styles['results-list']}>
          <div className={styles['selection-tools']}>
            <span className={styles['search-label']}>الوظائف المختارة ({selectedCount})</span>
            <div className={styles['tool-buttons']}>
              <Button
                className={styles['btn-ghost']}
                disabled={isQuotaBlocked || savedJobs.length === 0 || effectiveSelectionLimit <= 0}
                onClick={handleSelectFirstJobs}
              >
                اختر أول 10 وظائف
              </Button>
              <Button
                className={styles['btn-ghost']}
                disabled={selectedCount === 0}
                onClick={handleDeselectAll}
                style={{ color: 'var(--red)' }}
              >
                إلغاء تحديد الكل
              </Button>
            </div>
          </div>
          <div className={styles['results-list']}>
            {savedJobs.map((job, index) => {
              const jobKey = savedJobKeys[index];
              const checked = Boolean(selectedMap[jobKey]);
              const locked =
                !checked && (isQuotaBlocked || selectedCount >= effectiveSelectionLimit);

              return (
                <label
                  className={`${styles['recipient-row']} ${locked ? styles.locked : ''}`}
                  key={jobKey}
                  title={locked ? DAILY_LIMIT_BLOCK_MESSAGE : ''}
                  onClick={(event) => {
                    if (locked) {
                      event.preventDefault();
                      setSelectionError(DAILY_LIMIT_BLOCK_MESSAGE);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={(e) => handleSelectionChange(jobKey, e.target.checked, locked)}
                  />
                  <div>
                    <div className={styles['job-header']}>
                      <div className={styles['company-tag']}>اسم الشركة: {job.company}</div>
                      {locked ? <span className={styles['lock-badge']}>🔒</span> : null}
                      {job.previousFailedStatus === 'FAILED' ? (
                        <span className={styles['retry-badge']}>إعادة محاولة</span>
                      ) : null}
                    </div>
                    <div className={styles['job-title']}>{job.role}</div>
                    <div className={styles['connected-email']}>{job.hrEmail || job.email}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selectionError ? <div className={styles['selection-error']}>{selectionError}</div> : null}

      <div className={styles['control-bar']}>
        <Button className={styles['btn-ghost']} onClick={onGoSavedJobs}>
          ← المحفوظات
        </Button>
        <div className={styles['next-group']}>
          <Button
            className={styles['btn-primary']}
            disabled={!selectedCv || selectedJobs.length === 0 || isQuotaBlocked}
            onClick={() => setStep(2)}
          >
            التالي: جدولة الإرسال ←
          </Button>
          {(!selectedCv || selectedJobs.length === 0 || isQuotaBlocked) && (
            <div className={styles['hint-text']}>
              {isQuotaBlocked
                ? DAILY_LIMIT_BLOCK_MESSAGE
                : !selectedCv && !selectedJobs.length
                  ? 'يرجى رفع السيرة الذاتية واختيار وظيفة واحدة على الأقل'
                  : !selectedCv
                    ? 'يرجى رفع السيرة الذاتية للمتابعة'
                    : 'يرجى اختيار وظيفة واحدة على الأقل'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
