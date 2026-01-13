// PDF Master Pro - Split PDF Screen
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import {
  getPDFPageCount,
  removePagesFromPDF,
  PageInfo,
  generatePageInfoList,
} from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'split';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SplitScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const handleSelectFile = () => {
    setShowFilePicker(true);
  };

  const handleFileSelected = useCallback(async (selectedFiles: PDFFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setIsLoading(true);
      setCurrentPageIndex(0);

      try {
        const pageCount = await getPDFPageCount(selectedFile.uri);
        if (pageCount > 0) {
          const pageInfoList = generatePageInfoList(pageCount);
          setPages(pageInfoList);
        } else {
          Alert.alert('خطأ', 'لا يمكن قراءة الملف');
          setFile(null);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف');
        setFile(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const togglePageExclusion = useCallback((index: number) => {
    setPages(prevPages =>
      prevPages.map((page, i) =>
        i === index ? { ...page, isExcluded: !page.isExcluded } : page
      )
    );
  }, []);

  const getExcludedCount = useCallback(() => {
    return pages.filter(p => p.isExcluded).length;
  }, [pages]);

  const getKeptCount = useCallback(() => {
    return pages.filter(p => !p.isExcluded).length;
  }, [pages]);

  const handleSplit = async () => {
    if (!file) {
      Alert.alert('خطأ', 'يرجى اختيار ملف PDF أولاً');
      return;
    }

    const keptCount = getKeptCount();
    if (keptCount === 0) {
      Alert.alert('خطأ', 'لا يمكن حذف جميع الصفحات');
      return;
    }

    if (keptCount === pages.length) {
      Alert.alert('تنبيه', 'لم يتم استبعاد أي صفحات');
      return;
    }

    setIsProcessing(true);

    try {
      const excludedPages = pages
        .filter(p => p.isExcluded)
        .map(p => p.index);

      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `split_${originalName}.pdf`;

      const result = await removePagesFromPDF(
        file.uri,
        excludedPages,
        outputFileName
      );

      if (result) {
        const shareOptions = {
          title: 'حفظ ملف PDF',
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
            `تم معالجة الملف بنجاح!\n${keptCount} صفحات من ${pages.length}`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled or error:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            `تم معالجة الملف!\nيمكنك العثور عليه في ملفات التطبيق.`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في معالجة الملف');
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء معالجة الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPages([]);
    setCurrentPageIndex(0);
  };

  const goToPage = (index: number) => {
    setCurrentPageIndex(index);
  };

  const isCurrentPageExcluded = pages[currentPageIndex]?.isExcluded;

  const renderPageThumbnail = (page: PageInfo, index: number) => {
    const isCurrentPage = currentPageIndex === index;

    return (
      <TouchableOpacity
        key={page.index}
        style={[
          styles.thumbnailCard,
          {
            backgroundColor: colors.bgWhite,
            borderColor: isCurrentPage ? colors.primary : page.isExcluded ? colors.error : colors.border,
            borderWidth: isCurrentPage ? 3 : 2,
            opacity: page.isExcluded ? 0.4 : 1,
          },
        ]}
        onPress={() => goToPage(index)}
        activeOpacity={0.7}
      >
        <Text style={[styles.thumbnailNumber, { color: page.isExcluded ? colors.error : colors.textPrimary }]}>
          {page.pageNumber}
        </Text>
        {page.isExcluded && (
          <View style={[styles.excludedBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.excludedBadgeIcon}>✕</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calculate PDF container height dynamically
  const pdfContainerHeight = SCREEN_HEIGHT * 0.45;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.split.title}
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

      {/* Upload Area - when no file selected */}
      {!file ? (
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={styles.uploadIcon}>✂️</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              اضغط لاختيار ملف للتقسيم
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                جاري تحميل الملف...
              </Text>
            </View>
          ) : (
            <>
              {/* Top Bar: File Info + Stats + Page Counter */}
              <View style={[styles.topBar, { backgroundColor: colors.bgWhite }]}>
                {/* File name and close button */}
                <View style={styles.fileRow}>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                      📄 {file.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatFileSize(file.size)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClearFile} style={styles.closeButton}>
                    <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={[styles.statChip, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.statChipText, { color: colors.success }]}>
                      ✓ محتفظ: {getKeptCount()}
                    </Text>
                  </View>

                  <View style={[styles.pageCounter, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.pageCounterText, { color: colors.primary }]}>
                      صفحة {currentPageIndex + 1} / {pages.length}
                    </Text>
                  </View>

                  <View style={[styles.statChip, { backgroundColor: colors.error + '20' }]}>
                    <Text style={[styles.statChipText, { color: colors.error }]}>
                      ✕ محذوف: {getExcludedCount()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* PDF Preview Area */}
              <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
                <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                  <Pdf
                    source={{ uri: file.uri }}
                    page={currentPageIndex + 1}
                    singlePage={true}
                    style={styles.pdfView}
                    onError={(error) => console.log('PDF Error:', error)}
                  />

                  {/* Excluded Overlay */}
                  {isCurrentPageExcluded && (
                    <View style={styles.pageExcludedOverlay}>
                      <Text style={styles.pageExcludedText}>سيتم حذفها</Text>
                    </View>
                  )}
                </View>

                {/* Navigation Arrows */}
                <TouchableOpacity
                  style={[
                    styles.navArrow,
                    styles.navArrowLeft,
                    { backgroundColor: colors.bgWhite, opacity: currentPageIndex === 0 ? 0.3 : 1 },
                  ]}
                  onPress={() => goToPage(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                >
                  <Text style={styles.navArrowText}>◀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navArrow,
                    styles.navArrowRight,
                    { backgroundColor: colors.bgWhite, opacity: currentPageIndex === pages.length - 1 ? 0.3 : 1 },
                  ]}
                  onPress={() => goToPage(Math.min(pages.length - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                >
                  <Text style={styles.navArrowText}>▶</Text>
                </TouchableOpacity>
              </View>

              {/* Delete/Restore Button */}
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isCurrentPageExcluded ? colors.success : colors.error,
                    },
                  ]}
                  onPress={() => togglePageExclusion(currentPageIndex)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>
                    {isCurrentPageExcluded ? '↩️ استعادة هذه الصفحة' : '🗑️ حذف هذه الصفحة'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Thumbnails Strip */}
              <View style={[styles.thumbnailsSection, { backgroundColor: colors.bgWhite }]}>
                <Text style={[styles.thumbnailsTitle, { color: colors.textSecondary }]}>
                  الصفحات (اضغط للانتقال)
                </Text>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsScroll}
                >
                  {pages.map((page, index) => renderPageThumbnail(page, index))}
                </ScrollView>
              </View>

              {/* Save Button */}
              <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
                <Button
                  title={`💾 حفظ الملف (${getKeptCount()} صفحات)`}
                  onPress={handleSplit}
                  loading={isProcessing}
                  disabled={getKeptCount() === 0 || getKeptCount() === pages.length}
                  fullWidth
                  size="lg"
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* File Picker Modal */}
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
  container: {
    flex: 1,
  },
  uploadContainer: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
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
  uploadIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  fileSize: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pageCounter: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pageCounterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  pdfSection: {
    position: 'relative',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
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
  pageExcludedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageExcludedText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  navArrowLeft: {
    left: -8,
  },
  navArrowRight: {
    right: -8,
  },
  navArrowText: {
    fontSize: 18,
  },
  actionButtonContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  thumbnailsSection: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  thumbnailsTitle: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  thumbnailsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  thumbnailCard: {
    width: 44,
    height: 56,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  excludedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  excludedBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  favoriteIcon: {
    fontSize: 22,
  },
});

export default SplitScreen;
