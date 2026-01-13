// PDF Master Pro - Protect PDF Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, Input, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { encryptPDF, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'protect';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProtectScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    modifying: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const handleSelectFile = () => {
    setShowFilePicker(true);
  };

  const handleFileSelected = useCallback(async (selectedFiles: PDFFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setIsLoading(true);

      try {
        const pageCount = await getPDFPageCount(selectedFile.uri);
        setFile({ ...selectedFile, pageCount });
      } catch (error) {
        console.error('Error loading PDF:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const handleProtect = async () => {
    if (!file) return;
    if (!password) {
      Alert.alert('خطأ', 'يرجى إدخال كلمة المرور');
      return;
    }
    if (password.length < 4) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    setIsProcessing(true);

    try {
      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `protected_${originalName}.pdf`;

      // Use native encryption module
      const result = await encryptPDF(
        file.uri,
        password,
        {
          printing: permissions.printing,
          copying: permissions.copying,
          modifying: permissions.modifying,
        },
        outputFileName
      );

      if (result) {
        const shareOptions = {
          title: 'حفظ الملف المحمي',
          url: Platform.OS === 'ios' ? result.uri : `file://${result.uri}`,
          type: 'application/pdf',
          filename: result.name,
          saveToFiles: true,
        };

        try {
          await Share.open(shareOptions);
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم حماية الملف بكلمة المرور بنجاح! 🔐\n\nعند فتح الملف سيطلب منك إدخال كلمة المرور.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم حماية الملف بكلمة المرور! 🔐\nيمكنك العثور عليه في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في حماية الملف. تأكد من صحة الملف وحاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error protecting PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حماية الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: colors.border };
    if (password.length < 4) return { level: 1, text: 'ضعيفة', color: colors.error };
    if (password.length < 8) return { level: 2, text: 'متوسطة', color: '#F59E0B' };
    return { level: 3, text: 'قوية', color: colors.success };
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.2;
  const strength = getPasswordStrength();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.protect.title}
        rightAction={
          <TouchableOpacity
            onPress={() => toggleFavorite(TOOL_ID)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite(TOOL_ID) ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            <View style={[styles.uploadIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.uploadIcon}>🔐</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF للحماية
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              اضغط لاختيار ملف
            </Text>
          </TouchableOpacity>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              جاري تحميل الملف...
            </Text>
          </View>
        ) : (
          <>
            {/* File Card */}
            <Card style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text>📄</Text>
                </View>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                    {formatFileSize(file.size)} • {file.pageCount} صفحات
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearFile}>
                  <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* PDF Preview */}
            <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
              <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                <Pdf
                  source={{ uri: file.uri }}
                  singlePage={true}
                  style={styles.pdfView}
                  onError={(error) => console.log('PDF Error:', error)}
                />
                {/* Lock Overlay */}
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              </View>
            </View>

            {/* Password Section */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              كلمة المرور
            </Text>

            <View style={styles.passwordContainer}>
              <Input
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              {password.length > 0 && (
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthSegment, { backgroundColor: strength.level >= 1 ? strength.color : colors.border }]} />
                  <View style={[styles.strengthSegment, { backgroundColor: strength.level >= 2 ? strength.color : colors.border }]} />
                  <View style={[styles.strengthSegment, { backgroundColor: strength.level >= 3 ? strength.color : colors.border }]} />
                  <Text style={[styles.strengthText, { color: strength.color }]}>{strength.text}</Text>
                </View>
              )}
            </View>

            <Input
              label="تأكيد كلمة المرور"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              style={styles.showPasswordRow}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={[styles.showPasswordText, { color: colors.primary }]}>
                {showPassword ? '🙈 إخفاء كلمة المرور' : '👁 إظهار كلمة المرور'}
              </Text>
            </TouchableOpacity>

            {/* Permissions */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              الأذونات
            </Text>

            <Card style={styles.permissionsCard}>
              {[
                { key: 'printing', label: 'السماح بالطباعة', icon: '🖨️' },
                { key: 'copying', label: 'السماح بالنسخ', icon: '📋' },
                { key: 'modifying', label: 'السماح بالتعديل', icon: '✏️' },
              ].map((item) => (
                <View key={item.key} style={styles.permissionRow}>
                  <Text style={[styles.permissionIcon]}>{item.icon}</Text>
                  <Text style={[styles.permissionLabel, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                  <Switch
                    value={permissions[item.key as keyof typeof permissions]}
                    onValueChange={(value) =>
                      setPermissions({ ...permissions, [item.key]: value })
                    }
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              ))}
            </Card>

            <Button
              title="🔐 حماية الملف"
              onPress={handleProtect}
              loading={isProcessing}
              fullWidth
              size="lg"
              disabled={!password || password !== confirmPassword}
            />
          </>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      <FilePickerModal
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFilesSelected={handleFileSelected}
        allowMultiple={false}
        selectedFiles={file ? [file] : []}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  favoriteIcon: { fontSize: 22 },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl * 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadIcon: { fontSize: 40 },
  uploadTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: { fontSize: Typography.fontSize.sm },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl * 2,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  fileCard: { marginBottom: Spacing.md },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fileDetails: { flex: 1 },
  fileName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  fileSize: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  pdfSection: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  pdfContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfView: {
    flex: 1,
    backgroundColor: 'white',
  },
  lockOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  lockIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  passwordContainer: {
    marginBottom: Spacing.sm,
  },
  strengthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  showPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  showPasswordText: {
    fontSize: Typography.fontSize.sm,
  },
  permissionsCard: { marginBottom: Spacing.lg },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  permissionLabel: {
    flex: 1,
    fontSize: Typography.fontSize.base,
  },
});

export default ProtectScreen;
