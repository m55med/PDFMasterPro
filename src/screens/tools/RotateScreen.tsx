// PDF Master Pro - Rotate PDF Screen
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
import { Header, Button, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { rotatePDF, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'rotate';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PageRotation {
  pageNumber: number;
  index: number;
  rotation: 0 | 90 | 180 | 270;
}

const RotateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<PageRotation[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [globalRotation, setGlobalRotation] = useState<90 | 180 | 270>(90);
  const [rotateMode, setRotateMode] = useState<'all' | 'current'>('all');

  const rotationOptions = [
    { value: 90, label: '90°', icon: '↻', desc: 'يمين' },
    { value: 180, label: '180°', icon: '↺↻', desc: 'قلب' },
    { value: 270, label: '270°', icon: '↺', desc: 'يسار' },
  ];

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
          const pageList: PageRotation[] = Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            index: i,
            rotation: 0,
          }));
          setPages(pageList);
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

  const rotateCurrentPage = useCallback((degrees: 90 | 180 | 270) => {
    setPages(prevPages =>
      prevPages.map((page, i) =>
        i === currentPageIndex
          ? { ...page, rotation: ((page.rotation + degrees) % 360) as 0 | 90 | 180 | 270 }
          : page
      )
    );
  }, [currentPageIndex]);

  const rotateAllPages = useCallback((degrees: 90 | 180 | 270) => {
    setPages(prevPages =>
      prevPages.map(page => ({
        ...page,
        rotation: ((page.rotation + degrees) % 360) as 0 | 90 | 180 | 270,
      }))
    );
  }, []);

  const handleApplyRotation = () => {
    if (rotateMode === 'all') {
      rotateAllPages(globalRotation);
    } else {
      rotateCurrentPage(globalRotation);
    }
  };

  const resetAllRotations = () => {
    setPages(prevPages =>
      prevPages.map(page => ({ ...page, rotation: 0 }))
    );
  };

  const getRotatedPagesCount = useCallback(() => {
    return pages.filter(p => p.rotation !== 0).length;
  }, [pages]);

  const handleRotate = async () => {
    if (!file) {
      Alert.alert('خطأ', 'يرجى اختيار ملف PDF أولاً');
      return;
    }

    const rotatedCount = getRotatedPagesCount();
    if (rotatedCount === 0) {
      Alert.alert('تنبيه', 'لم يتم تدوير أي صفحة');
      return;
    }

    setIsProcessing(true);

    try {
      // For simplicity, we'll use the most common rotation for all pages
      // In a more advanced version, we could rotate each page individually
      const rotatedPages = pages.filter(p => p.rotation !== 0);
      const mostCommonRotation = rotatedPages[0]?.rotation || 90;
      const pagesToRotate = rotatedPages.map(p => p.index);

      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `rotated_${originalName}.pdf`;

      const result = await rotatePDF(
        file.uri,
        mostCommonRotation,
        pagesToRotate.length === pages.length ? undefined : pagesToRotate,
        outputFileName
      );

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
            `تم تدوير ${rotatedCount} صفحات بنجاح!`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم تدوير الملف بنجاح!\nيمكنك العثور عليه في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في تدوير الملف');
      }
    } catch (error) {
      console.error('Error rotating PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تدوير الملف');
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

  const currentPageRotation = pages[currentPageIndex]?.rotation || 0;

  const renderPageThumbnail = (page: PageRotation, index: number) => {
    const isCurrentPage = currentPageIndex === index;
    const hasRotation = page.rotation !== 0;

    return (
      <TouchableOpacity
        key={page.index}
        style={[
          styles.thumbnailCard,
          {
            backgroundColor: colors.bgWhite,
            borderColor: isCurrentPage ? colors.primary : hasRotation ? colors.warning : colors.border,
            borderWidth: isCurrentPage ? 3 : 2,
          },
        ]}
        onPress={() => goToPage(index)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.thumbnailInner,
            { transform: [{ rotate: `${page.rotation}deg` }] },
          ]}
        >
          <Text style={[styles.thumbnailNumber, { color: colors.textPrimary }]}>
            {page.pageNumber}
          </Text>
        </View>
        {hasRotation && (
          <View style={[styles.rotationBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.rotationBadgeText}>{page.rotation}°</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.32;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.rotate.title}
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
              <Text style={styles.uploadIcon}>🔄</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF للتدوير
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              اضغط لاختيار ملف
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
              {/* Top Bar: File Info + Stats */}
              <View style={[styles.topBar, { backgroundColor: colors.bgWhite }]}>
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

                <View style={styles.statsRow}>
                  <View style={[styles.statChip, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.statChipText, { color: colors.warning }]}>
                      🔄 مُدار: {getRotatedPagesCount()}
                    </Text>
                  </View>

                  <View style={[styles.pageCounter, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.pageCounterText, { color: colors.primary }]}>
                      صفحة {currentPageIndex + 1} / {pages.length}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: colors.error + '20' }]}
                    onPress={resetAllRotations}
                  >
                    <Text style={[styles.resetButtonText, { color: colors.error }]}>
                      ↩️ إعادة تعيين
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* PDF Preview Area */}
              <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
                <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                  <View
                    style={[
                      styles.pdfRotationWrapper,
                      {
                        transform: [
                          { rotate: `${currentPageRotation}deg` },
                          { scale: currentPageRotation === 90 || currentPageRotation === 270 ? 0.7 : 1 },
                        ],
                      },
                    ]}
                  >
                    <Pdf
                      source={{ uri: file.uri }}
                      page={currentPageIndex + 1}
                      singlePage={true}
                      style={styles.pdfView}
                      onError={(error) => console.log('PDF Error:', error)}
                    />
                  </View>

                  {/* Rotation Indicator */}
                  {currentPageRotation !== 0 && (
                    <View style={[styles.rotationIndicator, { backgroundColor: colors.warning }]}>
                      <Text style={styles.rotationIndicatorText}>
                        {currentPageRotation}°
                      </Text>
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

              {/* Rotation Controls */}
              <View style={[styles.rotationControls, { backgroundColor: colors.bgWhite }]}>
                {/* Mode Selection */}
                <View style={styles.modeSelection}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      rotateMode === 'current' && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => setRotateMode('current')}
                  >
                    <Text style={[
                      styles.modeButtonText,
                      { color: rotateMode === 'current' ? colors.primary : colors.textSecondary },
                    ]}>
                      📄 الصفحة الحالية
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      rotateMode === 'all' && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => setRotateMode('all')}
                  >
                    <Text style={[
                      styles.modeButtonText,
                      { color: rotateMode === 'all' ? colors.primary : colors.textSecondary },
                    ]}>
                      📑 جميع الصفحات
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Rotation Options */}
                <View style={styles.rotationOptions}>
                  {rotationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.rotationOption,
                        {
                          backgroundColor: globalRotation === option.value ? colors.primaryLight : colors.bgGray,
                          borderColor: globalRotation === option.value ? colors.primary : 'transparent',
                          borderWidth: globalRotation === option.value ? 2 : 0,
                        },
                      ]}
                      onPress={() => setGlobalRotation(option.value as 90 | 180 | 270)}
                    >
                      <Text style={styles.rotationIcon}>{option.icon}</Text>
                      <Text style={[styles.rotationLabel, { color: colors.textPrimary }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: colors.primary }]}
                  onPress={handleApplyRotation}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>
                    🔄 تطبيق التدوير {globalRotation}° على {rotateMode === 'all' ? 'الكل' : 'الصفحة الحالية'}
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
              <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md + 20 }]}>
                <Button
                  title={`💾 حفظ الملف (${getRotatedPagesCount()} صفحات مُدارة)`}
                  onPress={handleRotate}
                  loading={isProcessing}
                  disabled={getRotatedPagesCount() === 0}
                  fullWidth
                  size="lg"
                />
              </View>
            </>
          )}
        </ScrollView>
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
    flexGrow: 1,
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
  resetButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  resetButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
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
  pdfRotationWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pdfView: {
    flex: 1,
    backgroundColor: 'white',
  },
  rotationIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  rotationIndicatorText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
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
  rotationControls: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  modeSelection: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  rotationOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  rotationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  rotationIcon: {
    fontSize: 24,
  },
  rotationLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  applyButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  thumbnailsSection: {
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
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
    overflow: 'hidden',
  },
  thumbnailInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  rotationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rotationBadgeText: {
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

export default RotateScreen;
