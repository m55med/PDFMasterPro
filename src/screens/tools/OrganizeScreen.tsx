// PDF Master Pro - Organize PDF Screen
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
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import {
  getPDFPageCount,
  reorderPDFPages,
} from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

interface PageItem {
  originalIndex: number;
  currentIndex: number;
  isDeleted: boolean;
}

// Page Thumbnail Component with real PDF preview
interface PageThumbnailProps {
  uri: string;
  pageNumber: number;
  isDeleted: boolean;
}

const PageThumbnail: React.FC<PageThumbnailProps> = React.memo(({ uri, pageNumber, isDeleted }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[thumbnailStyles.container, { backgroundColor: colors.bgGray }]}>
        <Text style={thumbnailStyles.fallbackIcon}>📄</Text>
        <Text style={[thumbnailStyles.pageNum, { color: colors.textSecondary }]}>{pageNumber}</Text>
      </View>
    );
  }

  return (
    <View style={[thumbnailStyles.container, { backgroundColor: colors.bgGray, opacity: isDeleted ? 0.5 : 1 }]}>
      {isLoading && (
        <View style={thumbnailStyles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Pdf
        source={{ uri }}
        page={pageNumber}
        singlePage={true}
        style={thumbnailStyles.pdf}
        onLoadComplete={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        enablePaging={false}
        horizontal={false}
        fitPolicy={0}
      />
    </View>
  );
});

const thumbnailStyles = StyleSheet.create({
  container: {
    width: 60,
    height: 80,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  pdf: {
    width: 60,
    height: 80,
    backgroundColor: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
  },
  fallbackIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
  },
  pageNum: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});

const TOOL_ID = 'organize';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OrganizeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState<number | null>(null);

  const handleSelectFile = () => {
    setShowFilePicker(true);
  };

  const handleFileSelected = useCallback(async (selectedFiles: PDFFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setIsLoading(true);
      setSelectedPageIndex(null);
      setPreviewPageIndex(null);

      try {
        const pageCount = await getPDFPageCount(selectedFile.uri);
        if (pageCount > 0) {
          setFile({ ...selectedFile, pageCount });
          setPages(
            Array.from({ length: pageCount }, (_, i) => ({
              originalIndex: i,
              currentIndex: i,
              isDeleted: false,
            }))
          );
        } else {
          Alert.alert('خطأ', 'لا يمكن قراءة الملف');
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const movePageUp = (index: number) => {
    if (index <= 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    setPages(newPages);
    setSelectedPageIndex(index - 1);
  };

  const movePageDown = (index: number) => {
    if (index >= pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
    setSelectedPageIndex(index + 1);
  };

  const togglePageDelete = (index: number) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], isDeleted: !newPages[index].isDeleted };
    setPages(newPages);
  };

  const getActivePages = () => pages.filter(p => !p.isDeleted);
  const getDeletedCount = () => pages.filter(p => p.isDeleted).length;

  const handleSave = async () => {
    if (!file) return;

    const activePages = getActivePages();
    if (activePages.length === 0) {
      Alert.alert('خطأ', 'لا يمكن حذف جميع الصفحات');
      return;
    }

    setIsProcessing(true);

    try {
      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `organized_${originalName}.pdf`;

      // Get the new page order (only non-deleted pages)
      const newOrder = activePages.map(p => p.originalIndex);

      let result;
      if (getDeletedCount() > 0) {
        // If pages were deleted, use reorder with only active pages
        result = await reorderPDFPages(file.uri, newOrder, outputFileName);
      } else {
        // Just reorder
        result = await reorderPDFPages(file.uri, newOrder, outputFileName);
      }

      if (result) {
        const shareOptions = {
          title: 'حفظ الملف',
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
            `تم تنظيم الملف بنجاح!\nالصفحات: ${activePages.length} من ${pages.length}`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم تنظيم الملف بنجاح!\nيمكنك العثور عليه في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في تنظيم الملف');
      }
    } catch (error) {
      console.error('Error organizing PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تنظيم الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPages([]);
    setSelectedPageIndex(null);
    setPreviewPageIndex(null);
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.3;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.organize.title}
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

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            <View style={[styles.uploadIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.uploadIcon}>📑</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF للتنظيم
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
            {/* File Card with Stats */}
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
                    {formatFileSize(file.size)}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearFile}>
                  <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.statChipText, { color: colors.success }]}>
                    ✓ {getActivePages().length} صفحة
                  </Text>
                </View>
                {getDeletedCount() > 0 && (
                  <View style={[styles.statChip, { backgroundColor: colors.error + '20' }]}>
                    <Text style={[styles.statChipText, { color: colors.error }]}>
                      ✕ {getDeletedCount()} محذوف
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* PDF Preview */}
            {previewPageIndex !== null && (
              <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
                <View style={[styles.pdfHeader, { backgroundColor: colors.bgWhite }]}>
                  <Text style={[styles.pdfHeaderText, { color: colors.textPrimary }]}>
                    معاينة الصفحة {pages[previewPageIndex].originalIndex + 1}
                  </Text>
                  <TouchableOpacity onPress={() => setPreviewPageIndex(null)}>
                    <Text style={{ color: colors.error }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                  <Pdf
                    source={{ uri: file.uri }}
                    page={pages[previewPageIndex].originalIndex + 1}
                    singlePage={true}
                    style={styles.pdfView}
                    onError={(error) => console.log('PDF Error:', error)}
                  />
                </View>
              </View>
            )}

            {/* Pages List */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ترتيب الصفحات (استخدم الأسهم لإعادة الترتيب)
            </Text>

            <View style={styles.pagesList}>
              {pages.map((page, index) => (
                <View
                  key={`page-${page.originalIndex}`}
                  style={[
                    styles.pageItem,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: selectedPageIndex === index ? colors.primary : page.isDeleted ? colors.error : colors.border,
                      borderWidth: selectedPageIndex === index ? 2 : 1,
                      opacity: page.isDeleted ? 0.5 : 1,
                    },
                  ]}
                >
                  {/* Reorder Controls */}
                  <View style={styles.reorderControls}>
                    <TouchableOpacity
                      onPress={() => movePageUp(index)}
                      disabled={index === 0 || page.isDeleted}
                      style={[styles.reorderButton, { opacity: index === 0 || page.isDeleted ? 0.3 : 1 }]}
                    >
                      <Text style={{ color: colors.textSecondary }}>▲</Text>
                    </TouchableOpacity>
                    <View style={[styles.indexBadge, { backgroundColor: page.isDeleted ? colors.error : colors.primary }]}>
                      <Text style={styles.indexText}>{index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => movePageDown(index)}
                      disabled={index === pages.length - 1 || page.isDeleted}
                      style={[styles.reorderButton, { opacity: index === pages.length - 1 || page.isDeleted ? 0.3 : 1 }]}
                    >
                      <Text style={{ color: colors.textSecondary }}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Page Info */}
                  <TouchableOpacity
                    style={styles.pageInfo}
                    onPress={() => {
                      setSelectedPageIndex(index);
                      setPreviewPageIndex(index);
                    }}
                  >
                    <PageThumbnail
                      uri={file.uri}
                      pageNumber={page.originalIndex + 1}
                      isDeleted={page.isDeleted}
                    />
                    <View style={styles.pageDetails}>
                      <Text style={[styles.pageLabel, { color: colors.textPrimary }]}>
                        صفحة {page.originalIndex + 1}
                      </Text>
                      <Text style={[styles.pageStatus, { color: page.isDeleted ? colors.error : colors.textSecondary }]}>
                        {page.isDeleted ? 'سيتم حذفها' : 'اضغط للمعاينة الكبيرة'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Delete/Restore Button */}
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      { backgroundColor: page.isDeleted ? colors.success + '20' : colors.error + '20' },
                    ]}
                    onPress={() => togglePageDelete(index)}
                  >
                    <Text style={{ color: page.isDeleted ? colors.success : colors.error, fontSize: 14 }}>
                      {page.isDeleted ? '↩️' : '🗑️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Button
              title={`💾 حفظ التغييرات (${getActivePages().length} صفحة)`}
              onPress={handleSave}
              loading={isProcessing}
              fullWidth
              size="lg"
              disabled={getActivePages().length === 0}
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
  fileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  pdfSection: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pdfHeaderText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  pdfContainer: {
    flex: 1,
  },
  pdfView: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  pagesList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  reorderControls: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  reorderButton: {
    padding: 4,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  pageInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageDetails: {
    flex: 1,
  },
  pageLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  pageStatus: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrganizeScreen;
