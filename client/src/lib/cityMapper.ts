const cityNamesAr: Record<string, string> = {
  // الرياض
  'RIYADH': 'الرياض',
  'AL_KHARJ': 'الخرج',
  'AL-KHARJ': 'الخرج',
  'KHARJ': 'الخرج',
  'AL_DAWADIMI': 'الدوادمي',
  'AL-DAWADIMI': 'الدوادمي',
  'DAWADIMI': 'الدوادمي',
  'AL_MAJMAAH': 'المجمعة',
  'AL-MAJMAAH': 'المجمعة',
  'MAJMAAH': 'المجمعة',
  'AL_QUWAYIYAH': 'القويعية',
  'AL-QUWAYIYAH': 'القويعية',
  'QUWAYIYAH': 'القويعية',
  'WADI_AD_DAWASIR': 'وادي الدواسر',
  'WADI-AD-DAWASIR': 'وادي الدواسر',
  'WADI AD DAWASIR': 'وادي الدواسر',
  'WADI DAWASIR': 'وادي الدواسر',
  'AL_AFLAJ': 'الأفلاج',
  'AL-AFLAJ': 'الأفلاج',
  'AFLAJ': 'الأفلاج',
  'AL_ZULFI': 'الزلفي',
  'AL-ZULFI': 'الزلفي',
  'ZULFI': 'الزلفي',
  'SHAQRA': 'شقراء',
  'AFIF': 'عفيف',
  'AS_SULAYYIL': 'السليل',
  'AS-SULAYYIL': 'السليل',
  'SULAYYIL': 'السليل',

  // مكة المكرمة
  'MECCA': 'مكة المكرمة',
  'MAKKAH': 'مكة المكرمة',
  'MECCA AL-MUKARRAMAH': 'مكة المكرمة',
  'MAKKAH AL-MUKARRAMAH': 'مكة المكرمة',
  'JEDDAH': 'جدة',
  'TAIF': 'الطائف',
  'AL_QUNFUDHAH': 'القنفذة',
  'AL-QUNFUDHAH': 'القنفذة',
  'QUNFUDHAH': 'القنفذة',
  'RABIGH': 'رابغ',
  'AL_LAYTH': 'الليث',
  'AL-LAYTH': 'الليث',
  'LAYTH': 'الليث',
  'KHULAIS': 'خليص',

  // المدينة المنورة
  'MEDINA': 'المدينة المنورة',
  'MADINAH': 'المدينة المنورة',
  'MEDINA AL-MUNAWWARAH': 'المدينة المنورة',
  'MADINAH AL-MUNAWWARAH': 'المدينة المنورة',
  'YANBU': 'ينبع',
  'AL_ULA': 'العلا',
  'AL-ULA': 'العلا',
  'ULA': 'العلا',
  'MAHAD_AD_DAHAB': 'المهد',
  'MAHAD-AD-DAHAB': 'المهد',
  'MAHAD AL DAHAB': 'المهد',
  'BADR': 'بدر',
  'KHAYBAR': 'خيبر',

  // القصيم
  'BURAYDAH': 'بريدة',
  'UNAIZAH': 'عنيزة',
  'AL_RASS': 'الرس',
  'AL-RASS': 'الرس',
  'RASS': 'الرس',
  'AL_MITHNAB': 'المذنب',
  'AL-MITHNAB': 'المذنب',
  'MITHNAB': 'المذنب',
  'ASH_SHAMASIYAH': 'الشماسية',
  'ASH-SHAMASIYAH': 'الشماسية',
  'SHAMASIYAH': 'الشماسية',

  // الشرقية
  'DAMMAM': 'الدمام',
  'KHOBAR': 'الخبر',
  'AL_KHOBAR': 'الخبر',
  'AL-KHOBAR': 'الخبر',
  'AL_AHSA': 'الأحساء',
  'AL-AHSA': 'الأحساء',
  'HASA': 'الأحساء',
  'AL-HASA': 'الأحساء',
  'JUBAIL': 'الجبيل',
  'AL_JUBAIL': 'الجبيل',
  'AL-JUBAIL': 'الجبيل',
  'QATIF': 'القطيف',
  'AL_QATIF': 'القطيف',
  'AL-QATIF': 'القطيف',
  'HAFR_AL_BATIN': 'حفر الباطن',
  'HAFR-AL-BATIN': 'حفر الباطن',
  'HAFR AL BATIN': 'حفر الباطن',
  'AL_KHAFJI': 'الخفجي',
  'AL-KHAFJI': 'الخفجي',
  'KHAFJI': 'الخفجي',

  // عسير
  'ABHA': 'أبها',
  'KHAMIS_MUSHAIT': 'خميس مشيط',
  'KHAMIS-MUSHAIT': 'خميس مشيط',
  'KHAMIS MUSHAIT': 'خميس مشيط',
  'BISHA': 'بيشة',
  'AL_NAMAS': 'النماص',
  'AL-NAMAS': 'النماص',
  'NAMAS': 'النماص',
  'MAHAYIL_ASIR': 'محايل عسير',
  'MAHAYIL-ASIR': 'محايل عسير',
  'MAHAYIL ASIR': 'محايل عسير',

  // تبوك
  'TABUK': 'تبوك',
  'DUBA': 'ضباء',
  'TAYMA': 'تيماء',
  'AL_WAJH': 'الوجه',
  'AL-WAJH': 'الوجه',
  'WAJH': 'الوجه',
  'UMLUJ': 'أملج',

  // حائل
  'HAIL': 'حائل',
  'BAQAA': 'بقعاء',
  'AL_GHAZALAH': 'الغزالة',
  'AL-GHAZALAH': 'الغزالة',
  'GHAZALAH': 'الغزالة',
  'SAMIRA': 'سميراء',

  // الحدود الشمالية
  'ARAR': 'عرعر',
  'RAFHA': 'رفحاء',
  'TURAIF': 'طريف',

  // جازان
  'JIZAN': 'جازان',
  'JISAN': 'جازان',
  'SABYA': 'صبيا',
  'ABU_ARISH': 'أبو عريش',
  'ABU-ARISH': 'أبو عريش',
  'ABU ARISH': 'أبو عريش',
  'SAMTAH': 'صامطة',
  'BAISH': 'بيش',

  // نجران
  'NAJRAN': 'نجران',
  'SHARURAH': 'شرورة',

  // الباحة
  'BAHA': 'الباحة',
  'AL_BAHA': 'الباحة',
  'AL-BAHA': 'الباحة',
  'BALJURASHI': 'بلجرشي',
  'AL_MAKHWAH': 'المخواة',
  'AL-MAKHWAH': 'المخواة',
  'MAKHWAH': 'المخواة',

  // الجوف
  'SAKAKA': 'سكاكا',
  'DUMAT_AL_JANDAL': 'دومة الجندل',
  'DUMAT-AL-JANDAL': 'دومة الجندل',
  'QURAYYAT': 'القريات',
  'AL_QURAYYAT': 'القريات',
  'AL-QURAYYAT': 'القريات',
};

export const formatCity = (city: string | null | undefined): string => {
  if (!city || city.toUpperCase() === 'OTHER') return 'غير محددة';
  const upperCity = city.trim().toUpperCase();
  return cityNamesAr[upperCity] || city;
};

export const formatCompany = (company: string | null | undefined): string => {
  if (!company || company.toUpperCase() === 'OTHER') return 'جهة غير معلنة';
  return company;
};
