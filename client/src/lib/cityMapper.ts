const cityNamesAr: Record<string, string> = {
  'RIYADH': 'الرياض',
  'JEDDAH': 'جدة',
  'DAMMAM': 'الدمام',
  'KHOBAR': 'الخبر',
  'MECCA': 'مكة',
  'MAKKAH': 'مكة',
  'MEDINA': 'المدينة',
  'MADINAH': 'المدينة',
  'TABUK': 'تبوك',
  'ABHA': 'أبها',
  'BURAYDAH': 'بريدة',
  'KHAMIS MUSHAIT': 'خميس مشيط',
  'JUBAIL': 'الجبيل',
  'HAIL': 'حائل',
  'NAJRAN': 'نجران',
  'YANBU': 'ينبع',
  'JIZAN': 'جيزان',
  'ARAR': 'عرعر',
  'SAKAKA': 'سكاكا',
  'BAHA': 'الباحة',
  'QASSIM': 'القصيم',
  'DHAHRAN': 'الظهران',
  'HAFR AL-BATIN': 'حفر الباطن',
  'AL-AHSA': 'الأحساء',
  'TAIF': 'الطائف',
};

export const formatCity = (city: string | null | undefined): string => {
  if (!city || city.toUpperCase() === 'OTHER') return 'مدن أخرى';
  const upperCity = city.trim().toUpperCase();
  return cityNamesAr[upperCity] || city;
};

export const formatCompany = (company: string | null | undefined): string => {
  if (!company || company.toUpperCase() === 'OTHER') return 'جهة غير معلنة';
  return company;
};
