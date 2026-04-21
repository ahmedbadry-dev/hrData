import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import type { SavedJob } from '@/components/user/sections/userData';
import { EmptyState, PageHeader } from '@/components/common';
import { Button, Input } from '@/components/ui';
import styles from './UserAutoApplySection.module.css';

const MAX_SELECTED_JOBS = 20;

interface UserAutoApplySectionProps {
  savedJobs: SavedJob[];
  gmailConnected: boolean;
  gmailEmail: string | null;
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
    onSuccess: () => void,
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

export default function UserAutoApplySection({
  savedJobs,
  gmailConnected,
  gmailEmail,
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

  const savedJobKeys = useMemo(
    () => savedJobs.map((job, index) => getSavedJobSelectionKey(job, index)),
    [savedJobs]
  );

  useEffect(() => {
    setSelectedMap((previous) => {
      const validKeys = new Set(savedJobKeys);
      let hasChanges = false;
      const nextSelection: Record<string, boolean> = {};

      for (const [key, selected] of Object.entries(previous)) {
        if (selected && validKeys.has(key)) {
          nextSelection[key] = true;
          continue;
        }

        if (selected) {
          hasChanges = true;
        }
      }

      return hasChanges ? nextSelection : previous;
    });
  }, [savedJobKeys]);

  const selectedJobs = useMemo(
    () => savedJobs.filter((_, index) => Boolean(selectedMap[savedJobKeys[index]])),
    [savedJobKeys, savedJobs, selectedMap]
  );

  const handleSelectionChange = (jobKey: string, checked: boolean) => {
    const selectedCount = Object.values(selectedMap).filter(Boolean).length;
    const isCurrentlySelected = Boolean(selectedMap[jobKey]);

    if (checked && !isCurrentlySelected && selectedCount >= MAX_SELECTED_JOBS) {
      setSelectionError(`يمكن اختيار ${MAX_SELECTED_JOBS} وظيفة كحد أقصى في كل دفعة.`);
      return;
    }

    setSelectionError(null);
    setSelectedMap((previous) => ({
      ...previous,
      [jobKey]: checked,
    }));
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
        <EmptyState
          symbol="✓"
          title={`تم جدولة إرسال ${selectedJobs.length} رسائل بنجاح!`}
          description={
            <>
              الوقت: {scheduleTime === 'immediately' ? 'فوراً' : scheduleTime}
              <br />
              التأخير: {delay} ثانية بين كل رسالة
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
            <option value="0">بدون تأخير</option>
            <option value="10">10 ثواني</option>
            <option value="30">30 ثانية (موصى به)</option>
            <option value="60">1 دقيقة</option>
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
            disabled={!selectedCv || selectedJobs.length === 0}
            onClick={() => {
              onStartSending(
                { selected: selectedJobs, scheduleTime, delay, cv: selectedCv, body },
                () => setStep(3),
                () => {}
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
          <span className={styles['search-label']}>الوظائف المختارة</span>
          <div className={styles['results-list']}>
            {savedJobs.map((job, index) => (
              <label className={styles['recipient-row']} key={savedJobKeys[index]}>
                <input
                  type="checkbox"
                  checked={Boolean(selectedMap[savedJobKeys[index]])}
                  onChange={(e) => handleSelectionChange(savedJobKeys[index], e.target.checked)}
                />
                <div>
                  <div className={styles['job-header']}>
                    <div className={styles['company-tag']}>{job.company}</div>
                    {job.previousFailedStatus === 'FAILED' ? (
                      <span className={styles['retry-badge']}>إعادة محاولة</span>
                    ) : null}
                  </div>
                  <div className={styles['job-title']}>{job.role}</div>
                  <div className={styles['connected-email']}>{job.hrEmail || job.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectionError ? <div className={styles['selection-error']}>{selectionError}</div> : null}

      <div className={styles['control-bar']}>
        <Button className={styles['btn-ghost']} onClick={onGoSavedJobs}>
          ← المحفوظات
        </Button>
        <div>
          <Button
            className={styles['btn-primary']}
            disabled={!selectedCv || selectedJobs.length === 0}
            onClick={() => setStep(2)}
          >
            التالي: جدولة الإرسال ←
          </Button>
          {(!selectedCv || selectedJobs.length === 0) && (
            <div className={styles['hint-text']}>
              {!selectedCv && !selectedJobs.length
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
