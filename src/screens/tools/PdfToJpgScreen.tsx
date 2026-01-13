// PDF Master Pro - PDF to JPG Screen
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import RNBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

// Lazy load ViewShot to prevent crash if not available
let _ViewShot: any = null;
let captureRef: any = null;
try {
  _ViewShot = require('react-native-view-shot').default;
  captureRef = require('react-native-view-shot').captureRef;
} catch {
  console.log('react-native-view-shot not available');
}
void _ViewShot; // Reserved for future use

const TOOL_ID = 'pdf-to-jpg';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ImageQuality = 'low' | 'medium' | 'high';

const QUALITY_OPTIONS: { id: ImageQuality; label: string; value: number }[] = [
  { id: 'low', label: 'منخفضة', value: 0.5 },
  { id: 'medium', label: 'متوسطة', value: 0.75 },
  { id: 'high', label: 'عالية', value: 1.0 },
];

const PdfToJpgScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<View>(null);
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPage, setProcessingPage] = useState(0);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<ImageQuality>('high');
  const [exportAll, setExportAll] = useState(true);

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
        setTotalPages(pageCount);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setFile(selectedFile);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const captureCurrentPage = async (): Promise<string | null> => {
    try {
      if (captureRef && viewShotRef.current) {
        const quality = QUALITY_OPTIONS.find(q => q.id === selectedQuality)?.value || 1.0;
        const uri = await captureRef(viewShotRef.current, {
          format: 'jpg',
          quality: quality,
        });
        return uri;
      }
      return null;
    } catch (error) {
      console.error('Error capturing page:', error);
      return null;
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    // Check if ViewShot is available
    if (!captureRef) {
      Alert.alert(
        'ملاحظة',
        'لتفعيل تحويل PDF إلى صور، يرجى إعادة بناء التطبيق من Xcode.\n\nاتبع الخطوات:\n1. أغلق التطبيق\n2. افتح Xcode\n3. اضغط Cmd+R',
        [{ text: 'حسناً' }]
      );
      return;
    }

    setIsProcessing(true);
    const capturedImages: string[] = [];

    try {
      // Create output directory
      const outputDir = `${RNBlobUtil.fs.dirs.DocumentDir}/PDFMasterPro/images`;
      const dirExists = await RNBlobUtil.fs.isDir(outputDir);
      if (!dirExists) {
        await RNBlobUtil.fs.mkdir(outputDir);
      }

      const timestamp = Date.now();
      const baseName = file.name.replace('.pdf', '').replace(/^\d+_/, '');

      if (exportAll) {
        // Convert all pages one by one
        for (let page = 1; page <= totalPages; page++) {
          setProcessingPage(page);
          setCurrentPage(page);

          // Wait for the page to render
          await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

          const uri = await captureCurrentPage();
          if (uri) {
            const outputPath = `${outputDir}/${timestamp}_${baseName}_page_${page}.jpg`;
            await RNBlobUtil.fs.cp(uri, outputPath);
            capturedImages.push(outputPath);
          }
        }
      } else {
        // Convert current page only
        setProcessingPage(currentPage);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

        const uri = await captureCurrentPage();
        if (uri) {
          const outputPath = `${outputDir}/${timestamp}_${baseName}_page_${currentPage}.jpg`;
          await RNBlobUtil.fs.cp(uri, outputPath);
          capturedImages.push(outputPath);
        }
      }

      if (capturedImages.length > 0) {
        // Save all images to Photos app
        let savedCount = 0;
        for (const imagePath of capturedImages) {
          try {
            await CameraRoll.saveAsset(imagePath, { type: 'photo' });
            savedCount++;
          } catch (saveError) {
            console.error('Error saving to Photos:', saveError);
          }
        }

        if (savedCount > 0) {
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            savedCount === 1
              ? 'تم حفظ الصورة في ألبوم الصور بنجاح! 📸'
              : `تم حفظ ${savedCount} صورة في ألبوم الصور بنجاح! 📸`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } else {
          // Fallback to Share if CameraRoll fails
          const shareOptions = {
            title: 'حفظ الصور',
            urls: capturedImages.map(path =>
              Platform.OS === 'ios' ? path : `file://${path}`
            ),
            type: 'image/jpeg',
            saveToFiles: true,
          };

          try {
            await Share.open(shareOptions);
            await showAdAfterOperation();
            Alert.alert(
              t.common.success,
              `تم تحويل ${capturedImages.length} صفحة إلى صور!`,
              [{ text: 'حسناً', onPress: () => navigation.goBack() }]
            );
          } catch (shareError: any) {
            if (shareError.message !== 'User did not share') {
              console.log('Share error:', shareError);
            }
            await showAdAfterOperation();
          }
        }
      } else {
        Alert.alert('خطأ', 'فشل في تحويل الصفحات');
      }
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التحويل');
    } finally {
      setIsProcessing(false);
      setProcessingPage(0);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setTotalPages(0);
    setCurrentPage(1);
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.35;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title="PDF إلى صور"
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
              <Text style={styles.uploadIcon}>📄</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              اضغط لاختيار ملف للتحويل إلى صور
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
                <View style={[styles.fileIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Text>📄</Text>
                </View>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                    {formatFileSize(file.size)} • {totalPages} صفحات
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearFile}>
                  <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* PDF Preview */}
            <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
              <View
                ref={viewShotRef}
                collapsable={false}
                style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}
              >
                <Pdf
                  source={{ uri: file.uri }}
                  page={currentPage}
                  singlePage={true}
                  style={styles.pdfView}
                  onLoadComplete={(numberOfPages) => {
                    setTotalPages(numberOfPages);
                  }}
                  onError={(error) => {
                    console.log('PDF Error:', error);
                  }}
                />
              </View>

              {/* Page indicator */}
              <View style={[styles.pageIndicator, { backgroundColor: colors.primary }]}>
                <Text style={styles.pageIndicatorText}>
                  {currentPage} / {totalPages}
                </Text>
              </View>
            </View>

            {/* Page Navigation */}
            {totalPages > 1 && (
              <View style={styles.pageNavigation}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { backgroundColor: currentPage > 1 ? colors.primary : colors.border },
                  ]}
                  onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <Text style={styles.navButtonText}>◀ السابق</Text>
                </TouchableOpacity>

                <Text style={[styles.pageText, { color: colors.textPrimary }]}>
                  صفحة {currentPage} من {totalPages}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { backgroundColor: currentPage < totalPages ? colors.primary : colors.border },
                  ]}
                  onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <Text style={styles.navButtonText}>التالي ▶</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Export Options */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              خيارات التصدير
            </Text>

            {/* Pages to export */}
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: exportAll ? colors.primary : colors.bgWhite,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setExportAll(true)}
              >
                <Text style={[
                  styles.optionButtonText,
                  { color: exportAll ? '#FFFFFF' : colors.textPrimary }
                ]}>
                  جميع الصفحات ({totalPages})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: !exportAll ? colors.primary : colors.bgWhite,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setExportAll(false)}
              >
                <Text style={[
                  styles.optionButtonText,
                  { color: !exportAll ? '#FFFFFF' : colors.textPrimary }
                ]}>
                  الصفحة الحالية فقط
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quality Selection */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.md }]}>
              جودة الصورة
            </Text>

            <View style={styles.qualityOptions}>
              {QUALITY_OPTIONS.map((quality) => (
                <TouchableOpacity
                  key={quality.id}
                  style={[
                    styles.qualityButton,
                    {
                      backgroundColor: selectedQuality === quality.id ? colors.primary : colors.bgWhite,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedQuality(quality.id)}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      { color: selectedQuality === quality.id ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {quality.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Processing Progress */}
            {isProcessing && (
              <View style={[styles.progressCard, { backgroundColor: colors.primaryLight }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  جاري تحويل الصفحة {processingPage} من {exportAll ? totalPages : 1}...
                </Text>
              </View>
            )}

            {/* Info Card - only show if ViewShot not available */}
            {!captureRef && (
              <View style={[styles.infoCard, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  لتفعيل هذه الميزة، أعد بناء التطبيق من Xcode (Cmd+R).
                </Text>
              </View>
            )}

            <Button
              title="🖼️ تحويل إلى صور"
              onPress={handleConvert}
              loading={isProcessing}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.lg }}
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
  pageIndicator: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pageIndicatorText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  navButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  pageText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  qualityButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default PdfToJpgScreen;
