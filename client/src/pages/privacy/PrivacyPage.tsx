import { Helmet } from 'react-helmet-async';
import HomeLayout from '@/components/home/layout/HomeLayout/HomeLayout';
import HomeFooterSection from '@/components/home/sections/HomeFooterSection/HomeFooterSection';

export default function PrivacyPage() {
  return (
    <HomeLayout>
      <Helmet>
        <title>Privacy Policy - HR Data</title>
        <meta
          name="description"
          content="Privacy policy for HR Data platform. Learn how we handle your data and Gmail OAuth access."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hrdatasa.com/privacy" />
        <meta property="og:title" content="Privacy Policy - HR Data" />
        <meta
          property="og:description"
          content="Learn how HR Data handles account data, Gmail OAuth access, and Gmail send-only permissions."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hrdatasa.com/privacy" />
        <meta property="og:site_name" content="HR Data" />
        <meta property="og:locale" content="ar_SA" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - HR Data" />
        <meta
          name="twitter:description"
          content="How HR Data handles privacy, user data, and Gmail OAuth send-only access."
        />
      </Helmet>

      <section style={{ padding: '32px 16px', maxWidth: 980, margin: '0 auto', lineHeight: 1.6 }}>
        <h1>سياسة الخصوصية — منصة التوظيف المباشر HrDatasa</h1>
        <p><strong>آخر تحديث:</strong> 23 مايو 2026</p>

        <h2>مقدمة</h2>
        <p>
          منصة HrData هي منصة سعودية تُساعد الباحثين عن عمل على اكتشاف الوظائف والتقديم عليها بشكل آلي. نحن
          نُولي خصوصيتك أهمية قصوى، وهذه السياسة توضّح بدقة ما نجمعه وكيف نستخدمه.
        </p>

        <h2>أولاً: البيانات التي نجمعها عند التسجيل</h2>
        <p>عندما تُنشئ حسابك في HrData، نطلب منك البيانات التالية:</p>
        <ul>
          <li><strong>الاسم الأول والأخير</strong> — لتعريف هويتك داخل المنصة.</li>
          <li><strong>البريد الإلكتروني</strong> — لتسجيل الدخول وإرسال رسائل التفعيل وإشعارات الوظائف.</li>
          <li><strong>رقم الجوال</strong> — للتواصل وتوثيق الحساب</li>
          <li><strong>كلمة المرور</strong> — تُحفظ مشفّرة تلقائيًا (hash)، ولا نطلع عليها بأي شكل.</li>
        </ul>
        <p>
          <strong>ملاحظة:</strong> لا تُفعَّل حسابك إلا بعد التحقق من بريدك الإلكتروني عبر رابط يُرسَل إليك فور التسجيل.
        </p>

        <h2>ثانياً: ربط حساب Gmail (اختياري — لميزة التقديم الآلي)</h2>
        <p>
          ميزة التقديم الآلي تتيح للمنصة إرسال طلبات التوظيف بالنيابة عنك عبر بريدك الإلكتروني. هذه الميزة اختيارية تمامًا
          وتعمل كالتالي:
        </p>
        <h3>ما نطلبه من Google:</h3>
        <ul>
          <li>صلاحية إرسال البريد فقط (gmail.send) — لا نقرأ رسائلك ولا نطّلع على صندوق الوارد.</li>
          <li>عنوان بريدك الإلكتروني المرتبط بحساب Google لتأكيد الهوية.</li>
        </ul>

        <p>
          نخزن معلومات الربط الضرورية لتشغيل ميزة التقديم الآلي بشكل مشفّر وآمن، دون حفظ كلمات المرور أو
          محتوى صندوق الوارد.
        </p>

        <h3>ما لا نحفظه أبداً:</h3>
        <ul>
          <li>كلمة مرور حساب Google.</li>
          <li>محتوى صندوق الوارد أو أي رسائل مستلمة.</li>
          <li>أي بيانات خارج نطاق إرسال البريد.</li>
        </ul>
        <p>يمكنك فصل الربط في أي وقت من إعدادات حسابك، وسيُحذف رمز الوصول فورًا من قاعدة بياناتنا.</p>

        <h2>ثالثاً: البيانات التي تنشأ تلقائيًا عند استخدام المنصة</h2>
        <ul>
          <li>
            <strong>سجلات النشاط:</strong> نسجّل الإجراءات الرئيسية مثل تسجيل الدخول، ربط Gmail، وإرسال الطلبات، مع عنوان IP، لأغراض
            الأمان ومراقبة الجودة.
          </li>
          <li><strong>الوظائف المحفوظة:</strong> قائمة الوظائف التي اخترت حفظها.</li>
          <li><strong>طلبات التوظيف:</strong> سجل الطلبات التي أُرسلت بالنيابة عنك، بما في ذلك حالة كل طلب (مجدول / مُرسَل / مفتوح / فاشل).</li>
          <li><strong>الإشعارات:</strong> الرسائل الإدارية وتنبيهات الوظائف التي أرسلها الفريق.</li>
        </ul>

        <h2>رابعاً: كيف نستخدم بياناتك</h2>
        <ul>
          <li>تشغيل المنصة وتمكينك من البحث في الوظائف وحفظها والتقديم عليها.</li>
          <li>إرسال رسائل التحقق من البريد واستعادة كلمة المرور.</li>
          <li>إرسال طلبات التوظيف بالنيابة عنك عبر Gmail (فقط عند تفعيل الميزة).</li>
          <li>تحسين جودة الخدمة وتشخيص الأخطاء التقنية.</li>
          <li>إرسال إشعارات إدارية تخصّ حسابك.</li>
        </ul>
        <p>لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تجارية.</p>

        <h2>خامساً: حماية البيانات</h2>
        <ul>
          <li>كلمات المرور مشفّرة بالكامل ولا يمكن استعادتها.</li>
          <li>رموز OAuth (Google) مشفّرة داخل قاعدة البيانات.</li>
          <li>نستخدم بروتوكول HTTPS لتأمين جميع الاتصالات.</li>
          <li>نتخذ تدابير أمنية مناسبة لحماية بياناتك وخصوصيتك.</li>
        </ul>

        <h2>سادساً: حقوقك</h2>
        <ul>
          <li><strong>الاطلاع:</strong> تستطيع الاطلاع على بياناتك الشخصية في صفحة الإعدادات.</li>
          <li><strong>التعديل:</strong> يمكنك تعديل معلوماتك الشخصية في أي وقت.</li>
          <li><strong>فصل Gmail:</strong> يمكنك قطع الربط مع Gmail من إعدادات حسابك فورًا.</li>
          <li><strong>حذف الحساب:</strong> للطلب من فريق الدعم حذف حسابك وبياناتك كاملة، تواصل معنا عبر: aebeilberdev2nda@gmail.com</li>
        </ul>

        <h2>سابعاً: التواصل</h2>
        <p>لأي استفسار بشأن خصوصيتك:<br />البريد الإلكتروني: aebeilberdev2nda@gmail.com</p>
      </section>

      <HomeFooterSection />
    </HomeLayout>
  );
}
