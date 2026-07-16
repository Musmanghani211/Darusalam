export const pageMeta: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'ڈیش بورڈ', crumb: 'آج کا خلاصہ' },
  '/students': { title: 'طلبہ کا انتظام', crumb: 'داخلے، پروفائل اور پیش رفت' },
  '/teachers': { title: 'اساتذہ کا انتظام', crumb: 'کلاسز، طلبہ اور حاضری' },
  '/classes': { title: 'کلاسز', crumb: 'کلاسز اور اساتذہ کا تعین' },
  '/attendance': { title: 'حاضری', crumb: 'روزانہ طلبہ اور اساتذہ کی حاضری' },
  '/fees': { title: 'فیس', crumb: 'وصولی، تاریخ اور رسیدیں' },
  '/salary': { title: 'تنخواہ', crumb: 'سلپ بنائیں اور تنخواہ کی تاریخ دیکھیں' },
  '/income': { title: 'آمدنی', crumb: 'تمام مدات کے مطابق آمدنی' },
  '/expenses': { title: 'اخراجات', crumb: 'تمام مدات کے مطابق اخراجات' },
  '/reports': { title: 'رپورٹس', crumb: 'مکمل خلاصہ جات' },
  '/users': { title: 'صارف کا انتظام', crumb: 'صارفین بنائیں اور ان کا انتظام کریں' },
  '/settings': { title: 'ترتیبات', crumb: 'سسٹم کی ترجیحات' },
  '/funds': { title: 'دیگر فنڈز', crumb: 'دستی طور پر شامل کردہ رقوم' },
  '/progress': { title: 'طلبہ کی پیش رفت', crumb: 'سبق، سبقی اور منزل' },
  '/profile': { title: 'میری پروفائل', crumb: 'کلاس، طلبہ اور تنخواہ سلپ' },
}

export function metaFor(pathname: string) {
  const match = Object.keys(pageMeta).find(k => pathname.startsWith(k))
  return match ? pageMeta[match] : { title: 'ڈیش بورڈ', crumb: '' }
}
