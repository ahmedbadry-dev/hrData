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
    forbidden: 'مسموح',
    'token expired': 'انتهت صلاحية الجلسة',
    'token invalid': 'جلسة غير صالحة',
    'refresh token expired': 'انتهت صلاحية الجلسة',
    'refresh token invalid': 'جلسة غير صالحة',
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
    'passwords do not match': 'كلمات المرور غير متطابقة',
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
  };

  for (const [key, arabic] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return arabic;
    }
  }

  return 'حدث خطأ';
};
