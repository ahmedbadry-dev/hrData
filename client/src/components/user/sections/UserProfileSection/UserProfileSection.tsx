import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Select } from '@/components/common';
import { Button, Input } from '@/components/ui';
import { mapError } from '@/lib/error-mapper';
import { cn } from '@/lib/utils';
import styles from './UserProfileSection.module.css';

type ProfileTab = 'personal' | 'experience' | 'education';

export interface UserProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  summary: string;
}

export interface UserExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

type LanguageLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';

export interface UserLanguageEntry {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface UserEducationValues {
  qualification: string;
  specialization: string;
  institution: string;
  graduationYear: string;
}

export interface UserEducationSkillsValues {
  education: UserEducationValues;
  skills: string[];
  languages: UserLanguageEntry[];
}

interface UserProfileSectionProps {
  initialProfile: UserProfileFormValues;
  initialExperience: UserExperienceEntry[];
  initialSkills: string[];
  initialLanguages: UserLanguageEntry[];
  initialEducation: UserEducationValues;
  onSavePersonal?: (profile: UserProfileFormValues) => Promise<void> | void;
  onSaveExperience?: (experience: UserExperienceEntry[]) => Promise<void> | void;
  onSaveEducationSkills?: (values: UserEducationSkillsValues) => Promise<void> | void;
}

interface SaveActionsProps {
  isSaved: boolean;
  isSaving: boolean;
  error?: string | null;
  onSave: () => void;
  onReset: () => void;
}

type ExperienceFieldName = keyof Omit<UserExperienceEntry, 'id'>;
type ExperienceFieldErrors = Record<string, Partial<Record<ExperienceFieldName, string>>>;
type LanguageFieldErrors = Record<string, string>;

const EXPERIENCE_END_DATE_ERROR = 'تاريخ النهاية يجب أن يكون بعد أو مساوي لتاريخ البداية';
const DUPLICATE_LANGUAGE_ERROR = 'هذه اللغة مضافة بالفعل';
const DUPLICATE_SKILL_ERROR = 'هذه المهارة مضافة بالفعل';

const PROFILE_TABS: Array<{
  id: ProfileTab;
  label: string;
  subLabel: string;
  icon: 'user' | 'briefcase' | 'education';
}> = [
  {
    id: 'personal',
    label: 'المعلومات الشخصية',
    subLabel: 'الاسم · التواصل · النبذة',
    icon: 'user',
  },
  {
    id: 'experience',
    label: 'الخبرة المهنية',
    subLabel: 'الوظائف · المشاريع',
    icon: 'briefcase',
  },
  {
    id: 'education',
    label: 'التعليم والمهارات',
    subLabel: 'المؤهلات · اللغات · المهارات',
    icon: 'education',
  },
];

const ARABIC_NUMBER_FORMATTER = new Intl.NumberFormat('ar-EG', {
  useGrouping: false,
});

const LANGUAGE_LEVELS: Array<{ value: LanguageLevel; label: string }> = [
  { value: 'NATIVE', label: 'اللغة الأم' },
  { value: 'BEGINNER', label: 'مبتدئ' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'متقدم' },
  { value: 'FLUENT', label: 'متمكن' },
];

const QUALIFICATION_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'HIGH_SCHOOL', label: 'ثانوية عامة' },
  { value: 'DIPLOMA', label: 'دبلوم' },
  { value: 'BACHELOR', label: 'بكالوريوس' },
  { value: 'MASTER', label: 'ماجستير' },
  { value: 'PHD', label: 'دكتوراه' },
  { value: 'OTHER', label: 'أخرى' },
];

const SPECIALIZATION_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'ENGINEERING', label: 'هندسة' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'تقنية المعلومات' },
  { value: 'BUSINESS_ADMINISTRATION', label: 'إدارة أعمال' },
  { value: 'ACCOUNTING_FINANCE', label: 'محاسبة ومالية' },
  { value: 'MARKETING_SALES', label: 'تسويق ومبيعات' },
  { value: 'HEALTHCARE', label: 'رعاية صحية' },
  { value: 'EDUCATION', label: 'تعليم' },
  { value: 'HUMAN_RESOURCES', label: 'موارد بشرية' },
  { value: 'OTHER', label: 'أخرى' },
];

const MONTH_OPTIONS = [
  { value: '01', label: 'يناير' },
  { value: '02', label: 'فبراير' },
  { value: '03', label: 'مارس' },
  { value: '04', label: 'أبريل' },
  { value: '05', label: 'مايو' },
  { value: '06', label: 'يونيو' },
  { value: '07', label: 'يوليو' },
  { value: '08', label: 'أغسطس' },
  { value: '09', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

const YEAR_OPTIONS = Array.from({ length: 61 }, (_, index) => String(2030 - index));
const DEFAULT_MONTH_PICKER_YEAR = '2026';
const DEFAULT_MONTH_PICKER_MONTH = '01';

let newExperienceCounter = 0;
let newLanguageCounter = 0;

function createEmptyExperienceEntry(): UserExperienceEntry {
  newExperienceCounter += 1;

  return {
    id: `new-experience-${newExperienceCounter}`,
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

function createTemporaryLanguageEntry(): UserLanguageEntry {
  newLanguageCounter += 1;

  return {
    id: `new-language-${newLanguageCounter}`,
    name: '',
    level: 'BEGINNER',
  };
}

function TabIcon({ icon }: { icon: 'user' | 'briefcase' | 'education' }) {
  if (icon === 'briefcase') {
    return (
      <svg
        className={styles['tab-icon']}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="0" ry="0" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    );
  }

  if (icon === 'education') {
    return (
      <svg
        className={styles['tab-icon']}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 10v6" />
        <path d="M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }

  return (
    <svg
      className={styles['tab-icon']}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function parseMonthValue(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, year, month] = match;
  const monthExists = MONTH_OPTIONS.some((option) => option.value === month);
  const yearExists = YEAR_OPTIONS.includes(year);

  if (!monthExists || !yearExists) {
    return null;
  }

  return { year, month };
}

function getMonthPickerLabel(value: string, placeholder: string) {
  const parsedValue = parseMonthValue(value);
  if (!parsedValue) {
    return placeholder;
  }

  const monthLabel = MONTH_OPTIONS.find((month) => month.value === parsedValue.month)?.label;
  return `${monthLabel ?? parsedValue.month} ${parsedValue.year}`;
}

interface MonthPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  allowClear?: boolean;
  hasError?: boolean;
}

function MonthPicker({
  value,
  onValueChange,
  placeholder,
  allowClear = false,
  hasError = false,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const parsedValue = parseMonthValue(value);
  const selectedYear = parsedValue?.year ?? DEFAULT_MONTH_PICKER_YEAR;
  const selectedMonth = parsedValue?.month ?? DEFAULT_MONTH_PICKER_MONTH;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthSelect = (month: string) => {
    onValueChange(`${selectedYear}-${month}`);
  };

  const handleYearSelect = (year: string) => {
    onValueChange(`${year}-${selectedMonth}`);
  };

  return (
    <div className={styles['month-picker']} ref={containerRef}>
      <button
        type="button"
        className={cn(
          styles['month-picker-btn'],
          isOpen && styles['month-picker-open'],
          hasError && styles['field-control-error']
        )}
        aria-expanded={isOpen}
        aria-invalid={hasError || undefined}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{getMonthPickerLabel(value, placeholder)}</span>
        <svg
          className={cn(styles['month-picker-icon'], isOpen && styles['month-picker-icon-open'])}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className={styles['month-picker-dropdown']}>
          <div className={styles['month-picker-grid']}>
            <div>
              <div className={styles['month-picker-title']}>الشهر</div>
              <div className={styles['month-picker-months']}>
                {MONTH_OPTIONS.map((month) => (
                  <button
                    type="button"
                    key={month.value}
                    className={cn(
                      styles['month-picker-option'],
                      selectedMonth === month.value && styles['month-picker-selected']
                    )}
                    onClick={() => handleMonthSelect(month.value)}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={styles['month-picker-title']}>السنة</div>
              <div className={styles['month-picker-years']}>
                {YEAR_OPTIONS.map((year) => (
                  <button
                    type="button"
                    key={year}
                    className={cn(
                      styles['month-picker-option'],
                      selectedYear === year && styles['month-picker-selected']
                    )}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {allowClear ? (
            <button
              type="button"
              className={styles['month-picker-clear']}
              onClick={() => {
                onValueChange('');
                setIsOpen(false);
              }}
            >
              مسح التاريخ
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SaveActions({ isSaved, isSaving, error, onSave, onReset }: SaveActionsProps) {
  return (
    <div className={styles['save-bar']}>
      <div className={styles['save-actions-main']}>
        <Button
          type="button"
          className={cn(styles['btn-primary'], isSaved && styles.saved)}
          onClick={onSave}
          isLoading={isSaving}
        >
          {isSaving ? 'جاري الحفظ' : isSaved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
        </Button>
        {error ? <div className={styles['save-error']}>{error}</div> : null}
      </div>
      <Button type="button" variant="ghost" className={styles['btn-ghost']} onClick={onReset}>
        إلغاء
      </Button>
    </div>
  );
}

export default function UserProfileSection({
  initialProfile,
  initialExperience,
  initialSkills,
  initialLanguages,
  initialEducation,
  onSavePersonal,
  onSaveExperience,
  onSaveEducationSkills,
}: UserProfileSectionProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [profile, setProfile] = useState<UserProfileFormValues>(() => initialProfile);
  const [experienceEntries, setExperienceEntries] = useState<UserExperienceEntry[]>(
    () => initialExperience
  );
  const [skills, setSkills] = useState<string[]>(() => initialSkills);
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [languages, setLanguages] = useState<UserLanguageEntry[]>(() => initialLanguages);
  const [education, setEducation] = useState<UserEducationValues>(() => initialEducation);
  const [savedTab, setSavedTab] = useState<ProfileTab | null>(null);
  const [savingTab, setSavingTab] = useState<ProfileTab | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [experienceErrors, setExperienceErrors] = useState<ExperienceFieldErrors>({});
  const [languageErrors, setLanguageErrors] = useState<LanguageFieldErrors>({});

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setExperienceEntries(initialExperience);
    setExperienceErrors({});
  }, [initialExperience]);

  useEffect(() => {
    setSkills(initialSkills);
    setSkillInput('');
    setSkillError('');
  }, [initialSkills]);

  useEffect(() => {
    setLanguages(initialLanguages);
    setLanguageErrors({});
  }, [initialLanguages]);

  useEffect(() => {
    setEducation(initialEducation);
  }, [initialEducation]);

  const clearExperienceError = (id: string, field?: ExperienceFieldName) => {
    setExperienceErrors((currentErrors) => {
      const entryErrors = currentErrors[id];
      if (!entryErrors) {
        return currentErrors;
      }

      if (!field) {
        const { [id]: _removed, ...remainingErrors } = currentErrors;
        return remainingErrors;
      }

      if (!entryErrors[field]) {
        return currentErrors;
      }

      const { [field]: _removedField, ...remainingEntryErrors } = entryErrors;
      if (Object.keys(remainingEntryErrors).length === 0) {
        const { [id]: _removed, ...remainingErrors } = currentErrors;
        return remainingErrors;
      }

      return {
        ...currentErrors,
        [id]: remainingEntryErrors,
      };
    });
  };

  const clearLanguageError = (id: string) => {
    setLanguageErrors((currentErrors) => {
      if (!currentErrors[id]) {
        return currentErrors;
      }

      const { [id]: _removed, ...remainingErrors } = currentErrors;
      return remainingErrors;
    });
  };

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSaveError(null);
    setExperienceErrors({});
    setLanguageErrors({});
    setSkillError('');
  };

  const updateProfile = (field: keyof UserProfileFormValues, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
    setSavedTab(null);
    setSaveError(null);
  };

  const updateExperienceEntry = (
    id: string,
    field: keyof Omit<UserExperienceEntry, 'id'>,
    value: string
  ) => {
    setExperienceEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );
    setSavedTab(null);
    setSaveError(null);
    clearExperienceError(id, field);
  };

  const updateEducation = (field: keyof UserEducationValues, value: string) => {
    setEducation((currentEducation) => ({
      ...currentEducation,
      [field]: value,
    }));
    setSavedTab(null);
    setSaveError(null);
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (skillError) {
      setSkillError('');
    }
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();

    if (!nextSkill) {
      setSkillError('اكتب اسم المهارة أولًا');
      return;
    }

    const normalizedNextSkill = nextSkill.toLocaleLowerCase();
    const skillAlreadyExists = skills.some(
      (skill) => skill.trim().toLocaleLowerCase() === normalizedNextSkill
    );

    if (skillAlreadyExists) {
      setSkillError('هذه المهارة مضافة بالفعل');
      return;
    }

    setSkills((currentSkills) => [...currentSkills, nextSkill]);
    setSkillInput('');
    setSkillError('');
    setSavedTab(null);
    setSaveError(null);
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleAddSkill();
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((currentSkills) => currentSkills.filter((skill) => skill !== skillToRemove));
    setSkillError('');
    setSavedTab(null);
    setSaveError(null);
  };

  const handleSetLanguageLevel = (id: string, level: LanguageLevel) => {
    setLanguages((currentLanguages) =>
      currentLanguages.map((language) =>
        language.id === id
          ? {
              ...language,
              level,
            }
          : language
      )
    );
    setSavedTab(null);
    setSaveError(null);
    clearLanguageError(id);
  };

  const handleLanguageNameChange = (id: string, name: string) => {
    setLanguages((currentLanguages) =>
      currentLanguages.map((language) =>
        language.id === id
          ? {
              ...language,
              name,
            }
          : language
      )
    );
    setSavedTab(null);
    setSaveError(null);
    clearLanguageError(id);
  };

  const handleRemoveLanguage = (id: string) => {
    setLanguages((currentLanguages) => currentLanguages.filter((language) => language.id !== id));
    setSavedTab(null);
    setSaveError(null);
    clearLanguageError(id);
  };

  const handleAddLanguage = () => {
    setLanguages((currentLanguages) => [...currentLanguages, createTemporaryLanguageEntry()]);
    setSavedTab(null);
    setSaveError(null);
  };

  const handleResetPersonal = () => {
    setProfile(initialProfile);
    setSavedTab(null);
    setSaveError(null);
  };

  const handleResetExperience = () => {
    setExperienceEntries(initialExperience);
    setExperienceErrors({});
    setSavedTab(null);
    setSaveError(null);
  };

  const handleResetEducation = () => {
    setSkills(initialSkills);
    setSkillInput('');
    setSkillError('');
    setLanguages(initialLanguages);
    setLanguageErrors({});
    setEducation(initialEducation);
    setSavedTab(null);
    setSaveError(null);
  };

  const handleAddExperience = () => {
    setExperienceEntries((currentEntries) => [...currentEntries, createEmptyExperienceEntry()]);
    setSavedTab(null);
    setSaveError(null);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
    setSavedTab(null);
    setSaveError(null);
    clearExperienceError(id);
  };

  const validateExperienceBeforeSave = () => {
    const nextErrors: ExperienceFieldErrors = {};

    for (const entry of experienceEntries) {
      if (entry.startDate && entry.endDate && entry.endDate < entry.startDate) {
        nextErrors[entry.id] = {
          ...nextErrors[entry.id],
          endDate: EXPERIENCE_END_DATE_ERROR,
        };
      }
    }

    setExperienceErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEducationSkillsBeforeSave = () => {
    const nextLanguageErrors: LanguageFieldErrors = {};
    const seenLanguages = new Map<string, string>();

    for (const language of languages) {
      const normalizedName = language.name.trim().toLocaleLowerCase();
      if (!normalizedName) {
        continue;
      }

      if (seenLanguages.has(normalizedName)) {
        nextLanguageErrors[language.id] = DUPLICATE_LANGUAGE_ERROR;
        continue;
      }

      seenLanguages.set(normalizedName, language.id);
    }

    const seenSkills = new Set<string>();
    const hasDuplicateSkill = skills.some((skill) => {
      const normalizedSkill = skill.trim().toLocaleLowerCase();
      if (!normalizedSkill) {
        return false;
      }

      if (seenSkills.has(normalizedSkill)) {
        return true;
      }

      seenSkills.add(normalizedSkill);
      return false;
    });

    setLanguageErrors(nextLanguageErrors);
    if (hasDuplicateSkill) {
      setSkillError(DUPLICATE_SKILL_ERROR);
    }

    return Object.keys(nextLanguageErrors).length === 0 && !hasDuplicateSkill;
  };

  const handleSave = async (tab: ProfileTab) => {
    setSaveError(null);

    if (tab === 'experience' && !validateExperienceBeforeSave()) {
      return;
    }

    if (tab === 'education' && !validateEducationSkillsBeforeSave()) {
      return;
    }

    setSavingTab(tab);

    try {
      if (tab === 'personal') {
        await onSavePersonal?.(profile);
      } else if (tab === 'experience') {
        await onSaveExperience?.(experienceEntries);
      } else {
        await onSaveEducationSkills?.({
          education,
          skills,
          languages,
        });
      }

      setSavedTab(tab);
      window.setTimeout(() => setSavedTab(null), 2500);
    } catch (error) {
      setSaveError(mapError(error));
    } finally {
      setSavingTab(null);
    }
  };

  return (
    <section className={styles['profile-section']}>
      <h1 className={styles['section-headline']}>الملف الشخصي</h1>

      <div className={styles['tab-nav']} role="tablist" aria-label="أقسام الملف الشخصي">
        {PROFILE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`profile-panel-${tab.id}`}
              className={cn(styles['tab-btn'], isActive && styles.active)}
              onClick={() => handleTabChange(tab.id)}
            >
              <TabIcon icon={tab.icon} />
              <span className={styles['tab-label']}>{tab.label}</span>
              <span className={styles['tab-sub']}>{tab.subLabel}</span>
            </button>
          );
        })}
      </div>

      <div
        id="profile-panel-personal"
        role="tabpanel"
        hidden={activeTab !== 'personal'}
        aria-labelledby="profile-tab-personal"
      >
        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>الاسم الكامل</div>
          <div className={styles['chart-desc']}>الاسم الذي سيظهر في طلبات التوظيف</div>

          <div className={cn(styles['control-row'], styles['first-row'])}>
            <div className={styles['two-col']}>
              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>الاسم الأول</span>
                <Input
                  className={styles.input}
                  value={profile.firstName}
                  placeholder="الاسم الأول"
                  onChange={(event) => updateProfile('firstName', event.target.value)}
                />
              </label>

              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>الاسم الثاني</span>
                <Input
                  className={styles.input}
                  value={profile.lastName}
                  placeholder="الاسم الثاني"
                  onChange={(event) => updateProfile('lastName', event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>معلومات الاتصال</div>
          <div className={styles['chart-desc']}>يُستخدم للتواصل معك من قِبَل أصحاب العمل</div>

          <div className={cn(styles['control-row'], styles['first-row'])}>
            <div className={styles['two-col']}>
              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>البريد الإلكتروني</span>
                <Input
                  type="email"
                  className={cn(styles.input, styles['ltr-input'])}
                  value={profile.email}
                  placeholder="example@email.com"
                  readOnly
                  aria-readonly="true"
                />
              </label>

              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>رقم الجوال</span>
                <Input
                  type="tel"
                  className={cn(styles.input, styles['ltr-input'])}
                  value={profile.phone}
                  placeholder="05XXXXXXXX"
                  onChange={(event) => updateProfile('phone', event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>النبذة الشخصية</div>
          <div className={styles['chart-desc']}>لمحة مختصرة عن تجربتك وأهدافك المهنية</div>

          <div className={cn(styles['control-row'], styles['first-row'])}>
            <label className={styles['field-wrap']}>
              <textarea
                className={cn(styles.input, styles.textarea)}
                rows={4}
                value={profile.summary}
                placeholder="اكتب نبذة تعبّر عن تجربتك وطموحاتك..."
                onChange={(event) => updateProfile('summary', event.target.value)}
              />
            </label>
          </div>
        </div>

        <SaveActions
          isSaved={savedTab === 'personal'}
          isSaving={savingTab === 'personal'}
          error={activeTab === 'personal' ? saveError : null}
          onSave={() => handleSave('personal')}
          onReset={handleResetPersonal}
        />
      </div>

      <div
        id="profile-panel-experience"
        role="tabpanel"
        hidden={activeTab !== 'experience'}
        aria-labelledby="profile-tab-experience"
      >
        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>الخبرة المهنية</div>
          <div className={styles['chart-desc']}>
            أضف وظائفك السابقة والحالية مرتبة من الأحدث للأقدم
          </div>

          <div className={styles['exp-list']}>
            {experienceEntries.length > 0 ? (
              experienceEntries.map((entry, index) => (
                <div className={styles['exp-entry']} key={entry.id}>
                  <div className={styles['exp-entry-header']}>
                    <span className={styles['exp-entry-title']}>
                      الوظيفة {ARABIC_NUMBER_FORMATTER.format(index + 1)}
                    </span>
                    <button
                      type="button"
                      className={styles['btn-remove-exp']}
                      onClick={() => handleRemoveExperience(entry.id)}
                    >
                      حذف
                    </button>
                  </div>

                  <div className={cn(styles['two-col'], styles['entry-row'])}>
                    <label className={styles['field-wrap']}>
                      <span className={styles['field-label']}>المسمى الوظيفي</span>
                      <Input
                        className={styles.input}
                        value={entry.jobTitle}
                        placeholder="مثال: مطور واجهات أمامية"
                        onChange={(event) =>
                          updateExperienceEntry(entry.id, 'jobTitle', event.target.value)
                        }
                      />
                    </label>

                    <label className={styles['field-wrap']}>
                      <span className={styles['field-label']}>اسم الشركة</span>
                      <Input
                        className={styles.input}
                        value={entry.company}
                        placeholder="اسم الشركة أو المؤسسة"
                        onChange={(event) =>
                          updateExperienceEntry(entry.id, 'company', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className={cn(styles['two-col'], styles['entry-row'])}>
                    <label className={styles['field-wrap']}>
                      <span className={styles['field-label']}>تاريخ البداية</span>
                      <MonthPicker
                        value={entry.startDate}
                        placeholder="اختر تاريخ البداية"
                        onValueChange={(value) =>
                          updateExperienceEntry(entry.id, 'startDate', value)
                        }
                      />
                    </label>

                    <label className={styles['field-wrap']}>
                      <span className={styles['field-label']}>تاريخ النهاية</span>
                      <MonthPicker
                        value={entry.endDate}
                        placeholder="حتى الآن / اختر تاريخ النهاية"
                        allowClear
                        hasError={Boolean(experienceErrors[entry.id]?.endDate)}
                        onValueChange={(value) => updateExperienceEntry(entry.id, 'endDate', value)}
                      />
                      {experienceErrors[entry.id]?.endDate ? (
                        <span className={styles['field-error']}>
                          {experienceErrors[entry.id]?.endDate}
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <label className={styles['field-wrap']}>
                    <span className={styles['field-label']}>وصف المهام والإنجازات</span>
                    <textarea
                      className={cn(styles.input, styles.textarea, styles['experience-textarea'])}
                      rows={3}
                      value={entry.description}
                      placeholder="اكتب أبرز مهامك وإنجازاتك في هذه الوظيفة..."
                      onChange={(event) =>
                        updateExperienceEntry(entry.id, 'description', event.target.value)
                      }
                    />
                  </label>
                </div>
              ))
            ) : (
              <div className={styles['empty-experience']}>
                لا توجد خبرات مضافة حالياً. ابدأ بإضافة وظيفة جديدة.
              </div>
            )}
          </div>

          <button type="button" className={styles['add-entry-btn']} onClick={handleAddExperience}>
            + إضافة وظيفة جديدة
          </button>
        </div>

        <SaveActions
          isSaved={savedTab === 'experience'}
          isSaving={savingTab === 'experience'}
          error={activeTab === 'experience' ? saveError : null}
          onSave={() => handleSave('experience')}
          onReset={handleResetExperience}
        />
      </div>

      <div
        id="profile-panel-education"
        role="tabpanel"
        hidden={activeTab !== 'education'}
        aria-labelledby="profile-tab-education"
      >
        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>المهارات</div>
          <div className={styles['chart-desc']}>أضف مهاراتك وخبراتك في أبرز مجالاتك</div>

          <div className={cn(styles['control-row'], styles['first-row'])}>
            <div className={styles['skills-field']}>
              <div className={styles['tags-area']}>
                <button
                  type="button"
                  className={styles['skill-add-btn']}
                  onClick={handleAddSkill}
                  aria-label="إضافة مهارة"
                >
                  +
                </button>

                <input
                  className={styles['tag-input']}
                  value={skillInput}
                  placeholder="أضف مهارة..."
                  onChange={(event) => handleSkillInputChange(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />

                <div className={styles['tags-list']} aria-live="polite">
                  {skills.length === 0 ? (
                    <span className={styles['tag-placeholder']}>مهارة</span>
                  ) : (
                    skills.map((skill) => (
                      <span className={styles.tag} key={skill}>
                        <span>{skill}</span>
                        <button
                          type="button"
                          className={styles['tag-remove']}
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`حذف مهارة ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className={cn(styles['skill-helper'], skillError && styles['skill-error'])}>
                {skillError || 'اكتب اسم المهارة ثم اضغط Enter أو إضافة'}
              </div>
            </div>
          </div>
        </div>

        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>اللغات</div>
          <div className={styles['chart-desc']}>حدد اللغات التي تتقنها ومستوى إتقانك لكل منها</div>

          <div className={styles['language-list']}>
            {languages.map((language) => (
              <div className={styles['language-row']} key={language.id}>
                <button
                  type="button"
                  className={styles['language-delete']}
                  onClick={() => handleRemoveLanguage(language.id)}
                >
                  حذف
                </button>

                <div className={styles.pills}>
                  {LANGUAGE_LEVELS.map((level) => (
                    <button
                      type="button"
                      key={level.value}
                      className={cn(
                        styles.pill,
                        language.level === level.value && styles['pill-active']
                      )}
                      onClick={() => handleSetLanguageLevel(language.id, level.value)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>

                <label className={styles['language-name-wrap']}>
                  <span className={styles['sr-only']}>اسم اللغة</span>
                  <Input
                    className={cn(
                      styles.input,
                      styles['language-name-input'],
                      languageErrors[language.id] && styles['field-control-error']
                    )}
                    value={language.name}
                    placeholder="اسم اللغة"
                    aria-invalid={Boolean(languageErrors[language.id]) || undefined}
                    onChange={(event) => handleLanguageNameChange(language.id, event.target.value)}
                  />
                  {languageErrors[language.id] ? (
                    <span className={styles['field-error']}>{languageErrors[language.id]}</span>
                  ) : null}
                </label>
              </div>
            ))}
          </div>

          <button type="button" className={styles['add-language-btn']} onClick={handleAddLanguage}>
            + إضافة لغة
          </button>
        </div>

        <div className={styles['profile-card']}>
          <div className={styles['chart-title']}>التعليم</div>
          <div className={styles['chart-desc']}>المؤهل الدراسي والتخصص الأكاديمي</div>

          <div className={cn(styles['control-row'], styles['first-row'])}>
            <div className={styles['two-col']}>
              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>المؤهل الدراسي</span>
                <Select
                  containerClassName={styles['profile-select-wrap']}
                  className={styles['profile-select']}
                  options={QUALIFICATION_OPTIONS}
                  value={education.qualification}
                  onValueChange={(value) => updateEducation('qualification', value)}
                  placeholder="اختر المؤهل"
                  scrollable
                />
              </label>

              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>التخصص</span>
                <Select
                  containerClassName={styles['profile-select-wrap']}
                  className={styles['profile-select']}
                  options={SPECIALIZATION_OPTIONS}
                  value={education.specialization}
                  onValueChange={(value) => updateEducation('specialization', value)}
                  placeholder="اختر التخصص"
                  scrollable
                />
              </label>
            </div>
          </div>

          <div className={styles['control-row']}>
            <div className={styles['two-col']}>
              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>الجامعة / المعهد</span>
                <Input
                  className={styles.input}
                  value={education.institution}
                  placeholder="اسم الجامعة أو المعهد"
                  onChange={(event) => updateEducation('institution', event.target.value)}
                />
              </label>

              <label className={styles['field-wrap']}>
                <span className={styles['field-label']}>سنة التخرج</span>
                <Input
                  type="number"
                  className={styles.input}
                  value={education.graduationYear}
                  placeholder="2024"
                  min="1970"
                  max="2030"
                  onChange={(event) => updateEducation('graduationYear', event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <SaveActions
          isSaved={savedTab === 'education'}
          isSaving={savingTab === 'education'}
          error={activeTab === 'education' ? saveError : null}
          onSave={() => handleSave('education')}
          onReset={handleResetEducation}
        />
      </div>
    </section>
  );
}
