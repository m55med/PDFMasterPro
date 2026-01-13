# تقرير ESLint - PDFMasterPro

**تاريخ التقرير:** 2026-01-10
**الأداة:** ESLint

---

## الملخص

| المقياس | القيمة |
|---------|--------|
| إجمالي الملفات المفحوصة | 72 |
| ملفات تحتوي على أخطاء | 15 |
| ملفات تحتوي على تحذيرات | 18 |
| **إجمالي الأخطاء** | **25** |
| **إجمالي التحذيرات** | **24** |

---

## المشاكل حسب الفئة

| الفئة | العدد | الخطورة |
|-------|-------|---------|
| متغيرات غير مستخدمة | 19 | خطأ |
| أنماط مضمنة | 18 | تحذير |
| مكونات متداخلة غير مستقرة | 5 | تحذير |
| اعتماديات React Hooks | 1 | خطأ |

---

## التقرير المفصل

### الأخطاء (25)

#### src/navigation/MainNavigator.tsx (4 أخطاء)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 3:10 | @typescript-eslint/no-unused-vars | تم تعريف 'StyleSheet' ولكن لم يتم استخدامه |
| 3:22 | @typescript-eslint/no-unused-vars | تم تعريف 'View' ولكن لم يتم استخدامه |
| 6:48 | @typescript-eslint/no-unused-vars | تم تعريف 'RootStackParamList' ولكن لم يتم استخدامه |
| 63:3 | @typescript-eslint/no-unused-vars | تم تعريف 'color' ولكن لم يتم استخدامه |

#### src/screens/auth/WelcomeScreen.tsx (3 أخطاء)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 7:3 | @typescript-eslint/no-unused-vars | تم تعريف 'Image' ولكن لم يتم استخدامه |
| 18:10 | @typescript-eslint/no-unused-vars | تم تعريف 'Colors' ولكن لم يتم استخدامه |
| 20:16 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'height' ولكن لم يتم استخدامها |

#### src/context/StorageContext.tsx (خطآن)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 27:18 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'storageLimit' ولكن لم يتم استخدامها |
| 63:6 | react-hooks/exhaustive-deps | React Hook useCallback يفتقد اعتمادية: 'calculateDirectorySize' |

#### src/screens/main/ProfileScreen.tsx (خطآن)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 25:18 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'subscription' ولكن لم يتم استخدامها |
| 25:32 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'userProfile' ولكن لم يتم استخدامها |

#### src/screens/main/ToolsScreen.tsx (خطآن)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 15:10 | @typescript-eslint/no-unused-vars | تم تعريف 'Card' ولكن لم يتم استخدامه |
| 19:9 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'width' ولكن لم يتم استخدامها |

#### src/screens/tools/MergeScreen.tsx (خطآن)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 15:45 | @typescript-eslint/no-unused-vars | تم تعريف 'Shadow' ولكن لم يتم استخدامه |
| 144:31 | @typescript-eslint/no-unused-vars | تم تعريف 'index' ولكن لم يتم استخدامه |

#### src/services/firebase/auth.ts (خطآن)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 116:3 | @typescript-eslint/no-unused-vars | تم تعريف 'password' ولكن لم يتم استخدامه |
| 192:3 | @typescript-eslint/no-unused-vars | تم تعريف 'callback' ولكن لم يتم استخدامه |

#### src/components/common/Card.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 69:7 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'styles' ولكن لم يتم استخدامها |

#### src/components/common/Input.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 39:19 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'isDark' ولكن لم يتم استخدامها |

#### src/screens/auth/LoginScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 27:56 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'error' ولكن لم يتم استخدامها |

#### src/screens/auth/PrivacyPolicyScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 16:14 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'isRTL' ولكن لم يتم استخدامها |

#### src/screens/auth/TermsOfServiceScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 16:14 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'isRTL' ولكن لم يتم استخدامها |

#### src/screens/main/SettingsScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 23:37 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'isRTL' ولكن لم يتم استخدامها |

#### src/screens/tools/OCRScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 22:9 | @typescript-eslint/no-unused-vars | تم تعيين قيمة لـ 'navigation' ولكن لم يتم استخدامها |

#### src/screens/tools/OrganizeScreen.tsx (خطأ واحد)
| السطر | القاعدة | الرسالة |
|-------|--------|---------|
| 133:33 | @typescript-eslint/no-unused-vars | تم تعريف 'index' ولكن لم يتم استخدامه |

---

### التحذيرات (24)

#### الأنماط المضمنة (18 تحذير)
| الملف | السطر |
|-------|-------|
| App.tsx | 20:36 |
| src/components/common/Header.tsx | 47:11 |
| src/components/common/Input.tsx | 73:13 |
| src/components/common/Loading.tsx | 27:9 |
| src/navigation/MainNavigator.tsx | 74:18 |
| src/screens/main/ProfileScreen.tsx | 148:39 |
| src/screens/main/SubscriptionScreen.tsx | 116:24 |
| src/screens/main/ToolsScreen.tsx | 89:15, 126:21 |
| src/screens/tools/CompressScreen.tsx | 144:21 |
| src/screens/tools/MergeScreen.tsx | 168:34 |
| src/screens/tools/OrganizeScreen.tsx | 138:21 |
| src/screens/tools/PageNumbersScreen.tsx | 126:21, 153:21 |
| src/screens/tools/RotateScreen.tsx | 120:21 |
| src/screens/tools/SplitScreen.tsx | 137:21, 148:23 |
| src/screens/tools/WatermarkScreen.tsx | 143:21 |

#### المكونات المتداخلة غير المستقرة (5 تحذيرات)
| الملف | السطر |
|-------|-------|
| src/navigation/MainNavigator.tsx | 89:21 |
| src/screens/auth/PrivacyPolicyScreen.tsx | 19:65, 30:51 |
| src/screens/auth/TermsOfServiceScreen.tsx | 19:65 |
| src/screens/main/SettingsScreen.tsx | 92:8, 117:53 |

---

## التوصيات

1. **إزالة الاستيرادات والمتغيرات غير المستخدمة** - هذه هي المشكلة الأكثر شيوعاً. قم بإزالة أو استخدام المتغيرات المعرّفة.

2. **نقل الأنماط المضمنة إلى StyleSheet** - استخدم `StyleSheet.create()` للحصول على أداء أفضل.

3. **استخراج المكونات المتداخلة** - انقل تعريفات المكونات خارج دوال العرض لمنع إعادة العرض غير الضرورية.

4. **إصلاح اعتماديات React Hook** - أضف الاعتماديات المفقودة إلى مصفوفات اعتماديات useCallback/useEffect.

---

*تم إنشاء التقرير بواسطة ESLint*
