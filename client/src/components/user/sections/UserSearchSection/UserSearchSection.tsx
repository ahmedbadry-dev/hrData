import type { SavedJob } from '@/components/user/sections/userData';
import type { UserJob } from '@/modules/jobs/types';
import { EmptyState, SearchBox, Select, SearchableSelect } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import { qualificationOptions, specializationOptions } from '@/modules/jobs/types/filterOptions';
import { formatCity, formatCompany } from '@/lib/cityMapper';
import styles from './UserSearchSection.module.css';

interface UserSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  jobs: UserJob[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  isLoading?: boolean;
  hasSearched: boolean;
  errorMessage?: string;
  selectedCard: string | null;
  onSelectCard: (key: string) => void;
  onPageChange: (page: number) => void;
  savedJobs: SavedJob[];
  onToggleSave: (job: UserJob) => void;
  onSaveAllVisible: () => void;
  saveAllLabel?: string;
  saveAllDisabled?: boolean;
  country: string;
  onCountryChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  qualification: string;
  onQualificationChange: (value: string) => void;
  specialization: string;
  onSpecializationChange: (value: string) => void;
  showSaveButtons?: boolean;
}

const cityOptions = [
  { value: '', label: 'الكل' },
  // الرياض
  { value: 'RIYADH', label: 'الرياض' },
  { value: 'AL_KHARJ', label: 'الخرج' },
  { value: 'AL_DAWADIMI', label: 'الدوادمي' },
  { value: 'AL_MAJMAAH', label: 'المجمعة' },
  { value: 'AL_QUWAYIYAH', label: 'القويعية' },
  { value: 'WADI_AD_DAWASIR', label: 'وادي الدواسر' },
  { value: 'AL_AFLAJ', label: 'الأفلاج' },
  { value: 'AL_ZULFI', label: 'الزلفي' },
  { value: 'SHAQRA', label: 'شقراء' },
  { value: 'AFIF', label: 'عفيف' },
  { value: 'AS_SULAYYIL', label: 'السليل' },

  // مكة المكرمة
  { value: 'MECCA', label: 'مكة المكرمة' },
  { value: 'JEDDAH', label: 'جدة' },
  { value: 'TAIF', label: 'الطائف' },
  { value: 'AL_QUNFUDHAH', label: 'القنفذة' },
  { value: 'RABIGH', label: 'رابغ' },
  { value: 'AL_LAYTH', label: 'الليث' },
  { value: 'KHULAIS', label: 'خليص' },

  // المدينة المنورة
  { value: 'MEDINA', label: 'المدينة المنورة' },
  { value: 'YANBU', label: 'ينبع' },
  { value: 'AL_ULA', label: 'العلا' },
  { value: 'MAHAD_AD_DAHAB', label: 'المهد' },
  { value: 'BADR', label: 'بدر' },
  { value: 'KHAYBAR', label: 'خيبر' },

  // القصيم
  { value: 'BURAYDAH', label: 'بريدة' },
  { value: 'UNAIZAH', label: 'عنيزة' },
  { value: 'AL_RASS', label: 'الرس' },
  { value: 'AL_MITHNAB', label: 'المذنب' },
  { value: 'ASH_SHAMASIYAH', label: 'الشماسية' },

  // الشرقية
  { value: 'DAMMAM', label: 'الدمام' },
  { value: 'KHOBAR', label: 'الخبر' },
  { value: 'AL_AHSA', label: 'الأحساء' },
  { value: 'JUBAIL', label: 'الجبيل' },
  { value: 'QATIF', label: 'القطيف' },
  { value: 'HAFR_AL_BATIN', label: 'حفر الباطن' },
  { value: 'AL_KHAFJI', label: 'الخفجي' },

  // عسير
  { value: 'ABHA', label: 'أبها' },
  { value: 'KHAMIS_MUSHAIT', label: 'خميس مشيط' },
  { value: 'BISHA', label: 'بيشة' },
  { value: 'AL_NAMAS', label: 'النماص' },
  { value: 'MAHAYIL_ASIR', label: 'محايل عسير' },

  // تبوك
  { value: 'TABUK', label: 'تبوك' },
  { value: 'DUBA', label: 'ضباء' },
  { value: 'TAYMA', label: 'تيماء' },
  { value: 'AL_WAJH', label: 'الوجه' },
  { value: 'UMLUJ', label: 'أملج' },

  // حائل
  { value: 'HAIL', label: 'حائل' },
  { value: 'BAQAA', label: 'بقعاء' },
  { value: 'AL_GHAZALAH', label: 'الغزالة' },
  { value: 'SAMIRA', label: 'سميراء' },

  // الحدود الشمالية
  { value: 'ARAR', label: 'عرعر' },
  { value: 'RAFHA', label: 'رفحاء' },
  { value: 'TURAIF', label: 'طريف' },

  // جازان
  { value: 'JIZAN', label: 'جازان' },
  { value: 'SABYA', label: 'صبيا' },
  { value: 'ABU_ARISH', label: 'أبو عريش' },
  { value: 'SAMTAH', label: 'صامطة' },
  { value: 'BAISH', label: 'بيش' },

  // نجران
  { value: 'NAJRAN', label: 'نجران' },
  { value: 'SHARURAH', label: 'شرورة' },

  // الباحة
  { value: 'BAHA', label: 'الباحة' },
  { value: 'BALJURASHI', label: 'بلجرشي' },
  { value: 'AL_MAKHWAH', label: 'المخواة' },

  // الجوف
  { value: 'SAKAKA', label: 'سكاكا' },
  { value: 'DUMAT_AL_JANDAL', label: 'دومة الجندل' },
  { value: 'QURAYYAT', label: 'القريات' },
];

const timeOptions = [
  { value: '', label: 'الكل' },
  { value: 'DAY', label: 'اليوم' },
  { value: 'WEEK', label: 'هذا الأسبوع' },
  { value: 'MONTH', label: 'هذا الشهر' },
];

const SKELETON_CARDS_COUNT = 4;
const EMPTY_FIELD_LABEL = 'غير محدد';

const getQualificationLabel = (qualification?: string | null) =>
  qualificationOptions.find((option) => option.value === qualification)?.label || EMPTY_FIELD_LABEL;

const formatJobDate = (date?: string | null) => {
  if (!date) {
    return EMPTY_FIELD_LABEL;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getExperienceIcon = (experience: string) =>
  ['بدون خبرة', 'لا يشترط', 'غير مطلوبة', 'غير مطلوب'].some((phrase) => experience.includes(phrase))
    ? '✨'
    : '💼';

export default function UserSearchSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  jobs,
  currentPage = 1,
  totalPages = 1,
  totalCount,
  isLoading,
  hasSearched,
  errorMessage,
  selectedCard,
  onSelectCard,
  onPageChange,
  savedJobs,
  onToggleSave,
  onSaveAllVisible,
  saveAllLabel = 'حفظ الكل',
  saveAllDisabled = false,
  country,
  onCountryChange,
  timeFilter,
  onTimeFilterChange,
  qualification,
  onQualificationChange,
  specialization,
  onSpecializationChange,
  showSaveButtons = true,
}: UserSearchSectionProps) {
  const isSaved = (job: UserJob) =>
    savedJobs.some(
      (s: SavedJob) =>
        (job.jobId && s.jobId === job.jobId) || (s.company === job.company && s.role === job.role)
    );

  return (
    <section>
      <div className={styles['search-wrapper']}>
        <div className={styles['search-flex']}>
          <div className={styles['search-main-field']}>
            <span className={styles['search-label']}>البحث عن وظيفة</span>
            <SearchBox
              value={searchQuery}
              placeholder="محاسب، مهندس، مسوق"
              onChange={onSearchQueryChange}
              onSubmit={onSearch}
              buttonLabel="بحث"
              className={styles['search-box']}
            />
          </div>
          <div className={styles['filter-field']}>
            <span className={styles['search-label']}>المدينة</span>
            <SearchableSelect
              options={cityOptions}
              value={country}
              onValueChange={onCountryChange}
              containerClassName={styles['city-select']}
              placeholder="ابحث عن مدينة..."
            />
          </div>
          <div className={styles['filter-field']}>
            <span className={styles['search-label']}>منذ</span>
            <Select
              options={timeOptions}
              value={timeFilter}
              onValueChange={onTimeFilterChange}
              containerClassName={styles['time-select']}
            />
          </div>
          <div className={styles['filter-field']}>
            <span className={styles['search-label']}>المؤهل</span>
            <Select
              options={qualificationOptions}
              value={qualification}
              onValueChange={onQualificationChange}
              containerClassName={styles['qualification-select']}
              scrollable={true}
            />
          </div>
          <div className={styles['filter-field']}>
            <span className={styles['search-label']}>التخصص</span>
            <Select
              options={specializationOptions}
              value={specialization}
              onValueChange={onSpecializationChange}
              containerClassName={styles['specialization-select']}
              scrollable={true}
            />
          </div>
        </div>
      </div>

      {!hasSearched ? (
        <EmptyState
          symbol="◎"
          title="لا توجد نتائج بحث بعد. استخدم مربع البحث أعلاه للعثور على وظيفتك المثالية."
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
        />
      ) : errorMessage ? (
        <EmptyState
          symbol="!"
          title={errorMessage}
          description="تحقق من الاتصال ثم أعد المحاولة"
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
        />
      ) : isLoading ? (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>جاري التحميل...</span>
          </div>

          <div className={styles['results-list']}>
            {Array.from({ length: SKELETON_CARDS_COUNT }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className={styles['skeleton-card']}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles['sk-line']} style={{ width: '22%' }} />
                <div className={styles['sk-line']} style={{ width: '65%', height: '18px' }} />
                <div className={styles['sk-line']} style={{ width: '45%' }} />
                <div className={styles['sk-line']} style={{ marginTop: '18px', height: '36px' }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>
              عُثر على {totalCount ?? jobs.length} وظيفة
            </span>
            {showSaveButtons && (
              <Button
                className={styles['save-all-btn']}
                onClick={onSaveAllVisible}
                disabled={saveAllDisabled}
              >
                {saveAllLabel}
              </Button>
            )}
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              symbol="◌"
              title="لا توجد نتائج مطابقة للفلاتر الحالية"
              description="جرّب تعديل الكلمات المفتاحية أو المدينة أو الفترة الزمنية"
              className={styles['welcome-state']}
              symbolClassName={styles['big-number']}
            />
          ) : (
            <div className={styles['results-list']}>
              {jobs.map((job) => {
                const key = `${job.company}-${job.role}`;
                const saved = isSaved(job);
                const selected = selectedCard === key;
                const experienceText = job.experience?.trim() || EMPTY_FIELD_LABEL;
                const languageRequirementText =
                  job.languageRequirement?.trim() || EMPTY_FIELD_LABEL;
                const descriptionText = job.description?.trim() || 'لا يوجد وصف متاح';
                const categoryText = job.major?.trim() || EMPTY_FIELD_LABEL;

                return (
                  <div
                    className={cn(styles['job-card'], selected && styles.selected)}
                    key={key}
                    onClick={() => onSelectCard(key)}
                  >
                    <div className={styles['card-top']}>
                      <div className={styles['card-main']}>
                        <div className={styles['company-tag']}>
                          اسم الجهة: {formatCompany(job.company)}
                        </div>
                        <h2 className={styles['job-title']}>{job.role}</h2>
                        <div className={styles['meta-row']}>
                          <span className={styles['meta-chip']}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              📍
                            </span>
                            <span className={styles['meta-text']}>{formatCity(job.city)}</span>
                          </span>
                          <span className={styles['meta-chip']}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              🎓
                            </span>
                            <span className={styles['meta-text']}>
                              {getQualificationLabel(job.qualification)}
                            </span>
                          </span>
                          <span className={styles['meta-chip']}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              📘
                            </span>
                            <span className={styles['meta-text']}>{categoryText}</span>
                          </span>
                          <span className={styles['meta-chip']}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              📅
                            </span>
                            <span className={styles['meta-text']}>{formatJobDate(job.date)}</span>
                          </span>
                          <span className={cn(styles['meta-chip'], styles['experience-chip'])}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              {getExperienceIcon(experienceText)}
                            </span>
                            <span className={styles['meta-text']}>{experienceText}</span>
                          </span>
                          <span className={cn(styles['meta-chip'], styles['language-chip'])}>
                            <span className={styles['meta-icon']} aria-hidden="true">
                              🌐
                            </span>
                            <span className={styles['meta-text']}>{languageRequirementText}</span>
                          </span>
                        </div>
                        <div className={styles['job-description']}>
                          <div className={styles['description-label']}>الوصف الوظيفي</div>
                          <p className={styles['description-text']}>{descriptionText}</p>
                        </div>
                      </div>

                      {showSaveButtons && (
                        <Button
                          type="button"
                          variant="icon"
                          className={cn(styles['save-btn'], saved && styles.saved)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(job);
                          }}
                          title={saved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
                          </svg>
                        </Button>
                      )}
                    </div>

                    <div className={styles['card-email']}>
                      <a
                        className={styles['email-link']}
                        href={`mailto:${job.hrEmail || job.email}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        📧 {job.hrEmail || job.email}
                      </a>
                      <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
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
        </>
      )}
    </section>
  );
}
