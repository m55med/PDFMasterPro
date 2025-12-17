# 🎨 دليل إنشاء الأيقونات - PDF Master Pro

## الطريقة السريعة

### باستخدام المولّد المدمج
1. افتح الملف: `scripts/generate-icons.html` في المتصفح
2. الأيقونات ستظهر تلقائياً
3. اضغط "Download All" لتحميل جميع الأحجام
4. احفظ الملفات في: `assets/icons/`

### الملفات المطلوبة
```
assets/icons/
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png
```

---

## الطريقة المتقدمة (باستخدام أدوات تصميم)

### 1. باستخدام Figma أو Adobe Illustrator
1. افتح ملف `assets/icons/icon.svg`
2. صدّر بالأحجام التالية:
   - 16x16 pixels
   - 32x32 pixels
   - 48x48 pixels
   - 128x128 pixels
3. احفظ كـ PNG بجودة عالية

### 2. باستخدام ImageMagick (سطر الأوامر)
```bash
# تثبيت ImageMagick أولاً
# على Windows: choco install imagemagick
# على Mac: brew install imagemagick
# على Linux: sudo apt-get install imagemagick

# تحويل SVG إلى PNG بأحجام مختلفة
magick convert -background none assets/icons/icon.svg -resize 16x16 assets/icons/icon16.png
magick convert -background none assets/icons/icon.svg -resize 32x32 assets/icons/icon32.png
magick convert -background none assets/icons/icon.svg -resize 48x48 assets/icons/icon48.png
magick convert -background none assets/icons/icon.svg -resize 128x128 assets/icons/icon128.png
```

### 3. باستخدام Node.js (للمطورين)
```bash
# تثبيت الحزمة
npm install sharp

# إنشاء سكريبت generate-icons.js
node generate-icons.js
```

**محتوى generate-icons.js:**
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 48, 128];
const svgBuffer = fs.readFileSync('assets/icons/icon.svg');

sizes.forEach(async (size) => {
    await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(`assets/icons/icon${size}.png`);
    console.log(`✅ Generated icon${size}.png`);
});
```

---

## المواصفات الفنية

### الألوان المستخدمة
- **Primary Blue**: `#2563EB`
- **Dark Blue**: `#1D4ED8`
- **Gold Accent**: `#FBBF24`
- **White**: `#FFFFFF`
- **Gray**: `#E5E7EB`, `#CBD5E1`

### التصميم
- **الشكل**: مستطيل دائري (border-radius: 24px للحجم 128px)
- **العنصر الرئيسي**: مستند PDF أبيض مع نص "PDF" بالأزرق
- **العنصر الثانوي**: نجمة صفراء صغيرة (للأحجام ≥48px)
- **خطوط التفاصيل**: خطوط رمادية تمثل محتوى المستند

---

## التحقق من الأيقونات

بعد إنشاء الأيقونات:
1. تأكد من وجود جميع الملفات في `assets/icons/`
2. تأكد من أن الملفات بصيغة PNG
3. تأكد من الأحجام الصحيحة:
   ```
   icon16.png  → 16x16 pixels
   icon32.png  → 32x32 pixels
   icon48.png  → 48x48 pixels
   icon128.png → 128x128 pixels
   ```
4. أعد تحميل الإضافة في Chrome

---

## استكشاف الأخطاء

### الأيقونات لا تظهر
- تأكد من أن مسار الملفات صحيح في `manifest.json`
- تأكد من أن الأيقونات PNG وليست SVG
- امسح الكاش وأعد تحميل الإضافة

### الأيقونات غير واضحة
- تأكد من استخدام دقة عالية عند التصدير
- استخدم PNG بدون ضغط (lossless)
- تأكد من الأحجام الصحيحة بالبكسل

---

## ملاحظات إضافية

- يمكنك تعديل التصميم في ملف `assets/icons/icon.svg`
- للحصول على أفضل جودة، استخدم أدوات التصميم المتخصصة
- تأكد من أن الأيقونات واضحة على الخلفيات الفاتحة والداكنة

---

**تم إنشاؤه بواسطة PDF Master Pro** 🚀

