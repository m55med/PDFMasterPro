# ESLint Report - PDFMasterPro

**Generated:** 2026-01-10
**Tool:** ESLint

---

## Summary

| Metric | Value |
|--------|-------|
| Total Files Scanned | 72 |
| Files with Errors | 15 |
| Files with Warnings | 18 |
| **Total Errors** | **25** |
| **Total Warnings** | **24** |

---

## Issues by Category

| Category | Count | Severity |
|----------|-------|----------|
| Unused Variables | 19 | Error |
| Inline Styles | 18 | Warning |
| Unstable Nested Components | 5 | Warning |
| React Hooks Dependencies | 1 | Error |

---

## Detailed Report

### Errors (25)

#### src/navigation/MainNavigator.tsx (4 errors)
| Line | Rule | Message |
|------|------|---------|
| 3:10 | @typescript-eslint/no-unused-vars | 'StyleSheet' is defined but never used |
| 3:22 | @typescript-eslint/no-unused-vars | 'View' is defined but never used |
| 6:48 | @typescript-eslint/no-unused-vars | 'RootStackParamList' is defined but never used |
| 63:3 | @typescript-eslint/no-unused-vars | 'color' is defined but never used |

#### src/screens/auth/WelcomeScreen.tsx (3 errors)
| Line | Rule | Message |
|------|------|---------|
| 7:3 | @typescript-eslint/no-unused-vars | 'Image' is defined but never used |
| 18:10 | @typescript-eslint/no-unused-vars | 'Colors' is defined but never used |
| 20:16 | @typescript-eslint/no-unused-vars | 'height' is assigned a value but never used |

#### src/context/StorageContext.tsx (2 errors)
| Line | Rule | Message |
|------|------|---------|
| 27:18 | @typescript-eslint/no-unused-vars | 'storageLimit' is assigned a value but never used |
| 63:6 | react-hooks/exhaustive-deps | React Hook useCallback has a missing dependency: 'calculateDirectorySize' |

#### src/screens/main/ProfileScreen.tsx (2 errors)
| Line | Rule | Message |
|------|------|---------|
| 25:18 | @typescript-eslint/no-unused-vars | 'subscription' is assigned a value but never used |
| 25:32 | @typescript-eslint/no-unused-vars | 'userProfile' is assigned a value but never used |

#### src/screens/main/ToolsScreen.tsx (2 errors)
| Line | Rule | Message |
|------|------|---------|
| 15:10 | @typescript-eslint/no-unused-vars | 'Card' is defined but never used |
| 19:9 | @typescript-eslint/no-unused-vars | 'width' is assigned a value but never used |

#### src/screens/tools/MergeScreen.tsx (2 errors)
| Line | Rule | Message |
|------|------|---------|
| 15:45 | @typescript-eslint/no-unused-vars | 'Shadow' is defined but never used |
| 144:31 | @typescript-eslint/no-unused-vars | 'index' is defined but never used |

#### src/services/firebase/auth.ts (2 errors)
| Line | Rule | Message |
|------|------|---------|
| 116:3 | @typescript-eslint/no-unused-vars | 'password' is defined but never used |
| 192:3 | @typescript-eslint/no-unused-vars | 'callback' is defined but never used |

#### src/components/common/Card.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 69:7 | @typescript-eslint/no-unused-vars | 'styles' is assigned a value but never used |

#### src/components/common/Input.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 39:19 | @typescript-eslint/no-unused-vars | 'isDark' is assigned a value but never used |

#### src/screens/auth/LoginScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 27:56 | @typescript-eslint/no-unused-vars | 'error' is assigned a value but never used |

#### src/screens/auth/PrivacyPolicyScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 16:14 | @typescript-eslint/no-unused-vars | 'isRTL' is assigned a value but never used |

#### src/screens/auth/TermsOfServiceScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 16:14 | @typescript-eslint/no-unused-vars | 'isRTL' is assigned a value but never used |

#### src/screens/main/SettingsScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 23:37 | @typescript-eslint/no-unused-vars | 'isRTL' is assigned a value but never used |

#### src/screens/tools/OCRScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 22:9 | @typescript-eslint/no-unused-vars | 'navigation' is assigned a value but never used |

#### src/screens/tools/OrganizeScreen.tsx (1 error)
| Line | Rule | Message |
|------|------|---------|
| 133:33 | @typescript-eslint/no-unused-vars | 'index' is defined but never used |

---

### Warnings (24)

#### Inline Styles (18 warnings)
| File | Line |
|------|------|
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

#### Unstable Nested Components (5 warnings)
| File | Line |
|------|------|
| src/navigation/MainNavigator.tsx | 89:21 |
| src/screens/auth/PrivacyPolicyScreen.tsx | 19:65, 30:51 |
| src/screens/auth/TermsOfServiceScreen.tsx | 19:65 |
| src/screens/main/SettingsScreen.tsx | 92:8, 117:53 |

---

## Recommendations

1. **Remove unused imports and variables** - This is the most common issue. Remove or use the declared variables.

2. **Move inline styles to StyleSheet** - Use `StyleSheet.create()` for better performance.

3. **Extract nested components** - Move component definitions outside of render functions to prevent unnecessary re-renders.

4. **Fix React Hook dependencies** - Add missing dependencies to useCallback/useEffect dependency arrays.

---

*Report generated by ESLint*
