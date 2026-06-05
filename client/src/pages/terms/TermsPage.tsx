import { Helmet } from 'react-helmet-async';
import HomeLayout from '@/components/home/layout/HomeLayout/HomeLayout';
import HomeFooterSection from '@/components/home/sections/HomeFooterSection/HomeFooterSection';

export default function TermsPage() {
  return (
    <HomeLayout>
      <Helmet>
        <title>Terms of Service - HR Data</title>
        <meta
          name="description"
          content="Terms of service for HR Data platform. Read our terms and conditions for using the job search and auto-apply service."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hrdatasa.com/terms" />
        <meta property="og:title" content="Terms of Service - HR Data" />
        <meta
          property="og:description"
          content="Read the terms and conditions for using HR Data job search and auto-apply services."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hrdatasa.com/terms" />
        <meta property="og:site_name" content="HR Data" />
        <meta property="og:locale" content="ar_SA" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service - HR Data" />
        <meta
          name="twitter:description"
          content="Terms and conditions for the HR Data job search and auto-apply platform."
        />
      </Helmet>

      <section style={{ padding: '32px 16px', maxWidth: 980, margin: '0 auto', lineHeight: 1.6 }}>
        <h1>الشروط والأحكام — منصة التوظيف المباشر HrDatasa</h1>
        <p><strong>آخر تحديث:</strong> 23 مايو 2026</p>

        <h2>مقدمة</h2>
        <p>
          تُحدد هذه الشروط والأحكام القواعد والالتزامات التي تنطبق على استخدامك لمنصة التوظيف المباشر HrDatasa. باستخدامك
          للمنصة فإنك توافق على الالتزام بهذه الشروط، وإذا لم تكن موافقًا فيرجى عدم استخدام المنصة.
        </p>

        <h2>١. وصف الخدمة</h2>
        <p>
          منصة التوظيف المباشر HrDatasa تتيح للمستخدمين البحث عن وظائف، حفظ الإعلانات، والتقديم عليها آليًا عند ربط
          حساب Gmail (اختياري). توفر المنصة أدوات مساعدة ولا تضمن نتيجة التوظيف.
        </p>

        <h2>٢. إنشاء الحساب</h2>
        <ul>
          <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل.</li>
          <li>رقم الجوال يجب أن يكون سعوديًا ويبدأ بـ 05 ويتكون من 10 أرقام.</li>
          <li>أنت مسؤول عن سرية بيانات الدخول وحماية حسابك.</li>
        </ul>

        <h2>٣. ميزة التقديم الآلي عبر Gmail</h2>
        <p>
          ميزة اختيارية تسمح للمنصة بإرسال طلبات التوظيف بالنيابة عنك عبر بريدك المرتبط. عند تفعيل الميزة، تمنح المنصة صلاحية
          إرسال البريد فقط، ويمكنك فصل الربط في أي وقت من الإعدادات.
        </p>

        <h2>٤. الاستخدام المقبول</h2>
        <p>لا يجوز للمستخدمين:</p>
        <ul>
          <li>استخدام المنصة لأغراض احتيالية أو غير قانونية.</li>
          <li>إرسال رسائل غير مرتبطة بالتوظيف أو محتوى سبام عبر المنصة.</li>
          <li>محاولة اختراق النظام أو الوصول غير المصرح به لبيانات الآخرين.</li>
          <li>انتحال هوية الآخرين أو تقديم معلومات مزيفة.</li>
        </ul>

        <h2>٥. المحتوى وحقوق الطرف الثالث</h2>
        <p>
          الإعلانات الواردة على المنصة مصدرها مواقع وإعلانات خارجية؛ لا تتحمل المنصة مسؤولية صحة أو صدق تلك الإعلانات. أي محتوى
          يقدّمه المستخدم يكون مسؤولية المستخدم نفسه.
        </p>

        <h2>٦. تعليق الحساب وإيقاف الخدمة</h2>
        <p>
          تحتفظ المنصة بالحق في تعليق أو إيقاف أي حساب في حالة مخالفة الشروط أو الاستخدام المفرط أو بناءً على طلب جهات
          قانونية. كما يمكن إغلاق الحسابات التي تُثبت محاولة إساءة الاستخدام.
        </p>

        <h2>٧. حدود المسؤولية</h2>
        <p>
          تستخدم المنصة كوسيلة مساعدة في التقديم على الوظائف، ولا تضمن الحصول على وظيفة أو نتائج معينة. لا تتحمل المنصة
          أية مسؤولية عن القرارات المتخذة من قبل جهات التوظيف أو عن النتائج المترتبة على عملية التقديم.
        </p>

        <h2>٨. حماية البيانات والأمن</h2>
        <p>
          تتخذ المنصة تدابير أمنية لحماية بيانات المستخدمين، ونخزن معلومات الربط الضرورية بشكل مشفّر وآمن، ولا نقوم بحفظ
          كلمات مرور خارجية أو محتوى صندوق الوارد.
        </p>

        <h2>٩. التعديلات على الشروط</h2>
        <p>
          يمكن تعديل هذه الشروط من وقت لآخر. سنُعلم المستخدمين المسجلين بوجود تغييرات عبر البريد الإلكتروني أو إشعار داخل
          المنصة، ويُعدّ استمرار الاستخدام موافقة على التعديلات.
        </p>

        <h2>١٠. سياسة الإلغاء والحذف</h2>
        <p>
          يمكنك طلب حذف حسابك وبياناتك عن طريق التواصل مع فريق الدعم عبر البريد الإلكتروني؛ سنعمل على معالجة الطلب وفقًا
          للسياسات الداخلية والمتطلبات القانونية.
        </p>

        <h2>١١. القانون المطبق وحل النزاعات</h2>
        <p>
          تخضع هذه الشروط وتشَرّع وفق قوانين المملكة العربية السعودية. أي نزاع ينشأ بخصوص هذه الشروط يُحال للجهات القضائية
          المختصة وفقًا للقانون المعمول به.
        </p>

        <h2>١٢. التواصل</h2>
        <p>لأي استفسار بخصوص الشروط أو لطلبات الدعم:<br />aebeilberdev2nda@gmail.com</p>
      </section>

      <HomeFooterSection />
    </HomeLayout>
  );
}
