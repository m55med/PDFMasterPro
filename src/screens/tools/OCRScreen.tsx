// PDF Master Pro - OCR Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'ocr';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OCRScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
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
      setExtractedText('');

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

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Note: Real OCR would require a dedicated OCR library like tesseract.js
    // This is a simulation showing the UI flow
    setTimeout(async () => {
      setIsProcessing(false);
      setExtractedText(
        'ملاحظة: هذه ميزة OCR تجريبية.\n\n' +
        'لاستخراج النص الفعلي من ملفات PDF الممسوحة ضوئياً، يتطلب الأمر:\n' +
        '1. مكتبة OCR متخصصة مثل Tesseract\n' +
        '2. معالجة الصور لتحسين الدقة\n' +
        '3. دعم اللغات المتعددة\n\n' +
        'سيتم تفعيل هذه الميزة في إصدار قادم.'
      );
      await showAdAfterOperation();
    }, 2000);
  };

  const handleCopy = () => {
    Clipboard.setString(extractedText);
    Alert.alert(t.common.success, 'تم نسخ النص');
  };

  const handleClearFile = () => {
    setFile(null);
    setExtractedText('');
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.3;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.ocr.title}
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
              <Text style={styles.uploadIcon}>👁️</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF أو صورة
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              يدعم PDF، JPG، PNG
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
                {/* OCR Indicator */}
                <View style={[styles.ocrIndicator, { backgroundColor: colors.primary }]}>
                  <Text style={styles.ocrIndicatorText}>👁️ OCR</Text>
                </View>
              </View>
            </View>

            {!extractedText && !isProcessing && (
              <Button
                title="👁️ استخراج النص (OCR)"
                onPress={handleExtract}
                loading={isProcessing}
                fullWidth
                size="lg"
              />
            )}

            {isProcessing && (
              <Card style={styles.progressCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.progressText, { color: colors.textPrimary }]}>
                  جاري استخراج النص...
                </Text>
                <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
                  قد يستغرق هذا بضع لحظات
                </Text>
              </Card>
            )}

            {extractedText && (
              <>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                    النص المستخرج
                  </Text>
                  <TouchableOpacity onPress={handleCopy}>
                    <Text style={[styles.copyButton, { color: colors.primary }]}>
                      نسخ 📋
                    </Text>
                  </TouchableOpacity>
                </View>

                <Card style={styles.textCard}>
                  <ScrollView style={styles.textScroll} nestedScrollEnabled>
                    <Text style={[styles.extractedText, { color: colors.textPrimary }]}>
                      {extractedText}
                    </Text>
                  </ScrollView>
                </Card>

                <Button
                  title="استخراج من ملف آخر"
                  onPress={handleClearFile}
                  variant="outline"
                  fullWidth
                />
              </>
            )}
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
  ocrIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ocrIndicatorText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  progressCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  progressText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  progressHint: { fontSize: Typography.fontSize.sm },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  copyButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  textCard: { marginBottom: Spacing.lg, maxHeight: 250 },
  textScroll: { maxHeight: 220 },
  extractedText: { fontSize: Typography.fontSize.sm, lineHeight: 22 },
});

export default OCRScreen;
