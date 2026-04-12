export const mapErrorToArabic = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  const errorMap: Record<string, string> = {
    'invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'user not found': 'المستخدم غير موجود',
    'email already exists': 'البريد الإلكتروني مسجل بالفعل',
    'email already in use': 'البريد الإلكتروني مسجل بالفعل',
    'phone already exists': 'رقم الجوال مسجل بالفعل',
    'phone already in use': 'رقم الجوال مسجل بالفعل',
    'validation failed': 'فشل في التحقق من البيانات',
    unauthorized: 'غير مصرح',
    forbidden: 'غير مسموح',
    'token expired': 'انتهت صلاحية الجلسة',
    'token invalid': 'جلسة غير صالحة',
    'refresh token expired': 'انتهت صلاحية الجلسة',
    'refresh token invalid': 'جلسة غير صالحة',
    'unable to register with provided credentials': 'تعذر إنشاء الحساب بالبيانات المدخلة',
    'password is too short': 'كلمة المرور قصيرة جداً',
    'password must be at least 8 characters': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
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
    'please verify your email first': 'يرجى التحقق من بريدك الإلكتروني أولاً',
    'too many requests': 'عدد كبير من المحاولات، حاول لاحقاً',
    'rate limit exceeded': 'عدد كبير من المحاولات، حاول لاحقاً',
    'server error': 'حدث خطأ في الخادم',
    'internal server error': 'حدث خطأ في الخادم',
    'service unavailable': 'الخدمة غير متاحة',
    'bad request': 'طلب غير صالح',
    'not found': 'غير موجود',
    'access denied': 'الدخول مرفوض',
    'jwt malformed': 'جلسة غير صالحة',
    'jwt token expired': 'انتهت صلاحية الجلسة',
    'invalid jwt token': 'جلسة غير صالحة',
    'user already exists': 'المستخدم موجود بالفعل',
    'invalid verification token': 'رابط التحقق غير صالح أو منتهي الصلاحية',
    'password reset token sent successfully': 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك',
    'password reset successfully': 'تم تغيير كلمة المرور بنجاح',
    'password is same as current password': 'كلمة المرور الجديدة مطابقة للحالية',
    'password must be at least 8 characters long': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'refresh token is required': 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
  };

  for (const [key, arabic] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return arabic;
    }
  }

  return 'حدث خطأ';
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
