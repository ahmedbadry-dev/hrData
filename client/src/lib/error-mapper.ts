export const mapErrorToArabic = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  const errorMap: Record<string, string> = {
    'invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'user not found': 'المستخدم غير موجود',
    'email already exists': 'البريد الإلكتروني مسجل بالفعل',
    'email already in use': 'البريد الإلكتروني مسجل بالفعل',
    'phone already exists': 'رقم الجوال مسجل بالفعل',
    'phone already in use': 'رقم الجوال مسجل بالفعل',
    'validation failed': 'فشل في التحقق من البيانات',
    'refresh token expired': 'انتهت صلاحية الجلسة',
    'refresh token invalid': 'جلسة غير صالحة',
    'jwt token expired': 'انتهت صلاحية الجلسة',
    'invalid jwt token': 'جلسة غير صالحة',
    'password must be at least 8 characters long': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'password must be at least 8 characters': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'password is too short': 'كلمة المرور قصيرة جداً',
    'invalid email': 'البريد الإلكتروني غير صالح',
    'email is required': 'البريد الإلكتروني مطلوب',
    'password is required': 'كلمة المرور مطلوبة',
    'first name is required': 'الاسم الأول مطلوب',
    'last name is required': 'الاسم الأخير مطلوب',
    'phone is required': 'رقم الجوال مطلوب',
    'phone must start with 0': 'رقم الجوال يجب أن يبدأ بـ 0',
    'invalid phone number': 'رقم الجوال غير صالح',
    'passwords do not match': 'كلمتا المرور غير متطابقتين',
    'account is disabled': 'الحساب معطل',
    'account is not verified': 'الحساب غير مفعل',
    'account is suspended': 'الحساب معلق حالياً، يرجى التواصل مع الدعم',
    'please verify your email first': 'يرجى التحقق من بريدك الإلكتروني أولاً لتفعيل الحساب',
    'too many requests': 'عدد كبير من المحاولات، حاول لاحقاً',
    'rate limit exceeded': 'عدد كبير من المحاولات، حاول لاحقاً',
    'لقد وصلت إلى الحد اليومي': 'لقد وصلت إلى الحد اليومي لإرسال الإيميلات',
    'daily email limit': 'لقد وصلت إلى الحد اليومي لإرسال الإيميلات',
    'internal server error': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
    'server error': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
    'service unavailable': 'الخدمة غير متاحة حالياً',
    'user already exists': 'المستخدم موجود بالفعل',
    'invalid verification token': 'رابط التحقق غير صالح أو منتهي الصلاحية',
    'password reset token sent successfully': 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك',
    'password reset successfully': 'تم تغيير كلمة المرور بنجاح',
    'current password is not correct': 'كلمة المرور الحالية غير صحيحة',
    'password is same as current password': 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
    'new password is same as current password': 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
    'refresh token is required': 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
    'reset token has expired': 'انتهت صلاحية رابط إعادة تعيين كلمة المرور',
    'invalid or expired reset token': 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية',
    'jwt malformed': 'جلسة غير صالحة',
    'token expired': 'انتهت صلاحية الجلسة',
    'token invalid': 'جلسة غير صالحة',
    required: 'هذا الحقل مطلوب',
    'bad request': 'طلب غير صالح',
    'not found': 'المورد المطلوب غير موجود',
    'access denied': 'الدخول مرفوض',
    unauthorized: 'غير مصرح',
    forbidden: 'غير مسموح',
  };

  if (lowerMessage.includes('account is temporarily locked')) {
    const minutes = message.match(/\d+/)?.[0] || '';
    return `الحساب مغلق مؤقتاً بكثرة المحاولات. حاول مرة أخرى بعد ${minutes} دقيقة`;
  }

  for (const [key, arabic] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return arabic;
    }
  }

  // If no common error found, and it's not a global message, return it if it's already Arabic
  // otherwise return a slightly better default
  if (/[\u0600-\u06FF]/.test(message)) {
    return message;
  }

  return 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
};

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Array<{ field?: string; message?: string }>;
    };
  };
}

export const getErrorStatus = (error: unknown): number | undefined => {
  return (error as AxiosLikeError).response?.status;
};

export const mapError = (error: unknown): string => {
  const axiosError = error as AxiosLikeError;

  const fieldErrors = axiosError.response?.data?.errors ?? [];
  if (fieldErrors.length > 0) {
    const firstError = fieldErrors[0]?.message ?? '';
    return mapErrorToArabic(firstError || 'يرجى التحقق من البيانات المدخلة');
  }

  return mapErrorToArabic(axiosError.response?.data?.message || 'حدث خطأ');
};
