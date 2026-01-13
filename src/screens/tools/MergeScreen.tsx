// PDF Master Pro - Merge PDF Screen
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
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
import { mergePDFs, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'merge';

const MergeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState<number | null>(null);

  const handleSelectFiles = () => {
    setShowFilePicker(true);
  };

  const handleFilesSelected = useCallback(async (selectedFiles: PDFFile[]) => {
    // Add new files, avoiding duplicates by URI
    const existingUris = new Set(files.map(f => f.uri));
    const newFiles = selectedFiles.filter(f => !existingUris.has(f.uri));

    // Get page count for each new file
    const filesWithPageCount = await Promise.all(
      newFiles.map(async (file) => {
        const pageCount = await getPDFPageCount(file.uri);
        return { ...file, pageCount };
      })
    );

    setFiles([...files, ...filesWithPageCount]);
  }, [files]);

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    if (previewFileIndex !== null) {
      const removedIndex = files.findIndex(f => f.id === id);
      if (removedIndex === previewFileIndex) {
        setPreviewFileIndex(null);
      } else if (removedIndex < previewFileIndex) {
        setPreviewFileIndex(previewFileIndex - 1);
      }
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      Alert.alert('خطأ', 'يرجى إضافة ملفين PDF على الأقل للدمج');
      return;
    }

    setIsProcessing(true);

    try {
      const sourceUris = files.map(f => f.uri);
      const outputFileName = 'merged.pdf';

      const result = await mergePDFs(sourceUris, outputFileName);

      if (result) {
        // Show file browser for saving
        const shareOptions = {
          title: 'حفظ الملف المدمج',
          url: Platform.OS === 'ios' ? result.uri : `file://${result.uri}`,
          type: 'application/pdf',
          filename: result.name,
          saveToFiles: true,
        };

        try {
          await Share.open(shareOptions);
          // Show interstitial ad after successful operation
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            `تم دمج ${files.length} ملفات بنجاح!\nإجمالي الصفحات: ${result.pageCount}`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          // Show interstitial ad after successful operation
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم دمج الملفات بنجاح!\nيمكنك العثور على الملف في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في دمج الملفات');
      }
    } catch (error) {
      console.error('Error merging PDFs:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء دمج الملفات');
    } finally {
      setIsProcessing(false);
    }
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const getTotalPages = () => {
    return files.reduce((sum, file) => sum + (file.pageCount || 0), 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.merge.title}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(TOOL_ID)}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.favoriteIcon}>
                {isFavorite(TOOL_ID) ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Area */}
        <TouchableOpacity
          style={[styles.uploadArea, { borderColor: colors.primary }]}
          onPress={handleSelectFiles}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.uploadIconContainer,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={styles.uploadIcon}>📤</Text>
          </View>
          <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
            {t.tools.merge.addFiles}
          </Text>
          <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
            اضغط لاختيار ملفات PDF
          </Text>
        </TouchableOpacity>

        {/* Files Summary */}
        {files.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.bgWhite }]}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryChip, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.summaryChipText, { color: colors.primary }]}>
                  📄 {files.length} ملفات
                </Text>
              </View>
              <View style={[styles.summaryChip, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.summaryChipText, { color: colors.success }]}>
                  📑 {getTotalPages()} صفحة
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFiles([])}
                style={[styles.clearButton, { backgroundColor: colors.error + '20' }]}
              >
                <Text style={[styles.clearButtonText, { color: colors.error }]}>
                  مسح الكل
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PDF Preview */}
        {previewFileIndex !== null && files[previewFileIndex] && (
          <View style={[styles.previewSection, { backgroundColor: colors.bgWhite }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>
                معاينة: {files[previewFileIndex].name}
              </Text>
              <TouchableOpacity onPress={() => setPreviewFileIndex(null)}>
                <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pdfPreviewContainer}>
              <Pdf
                source={{ uri: files[previewFileIndex].uri }}
                style={styles.pdfPreview}
                onError={(error) => console.log('PDF Error:', error)}
              />
            </View>
          </View>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={[styles.filesTitle, { color: colors.textPrimary }]}>
              ترتيب الدمج (اسحب لتغيير الترتيب)
            </Text>

            {files.map((file, index) => (
              <Card key={file.id} style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <View style={styles.orderControls}>
                    <TouchableOpacity
                      onPress={() => index > 0 && moveFile(index, index - 1)}
                      disabled={index === 0}
                      style={[styles.orderButton, { opacity: index === 0 ? 0.3 : 1 }]}
                    >
                      <Text style={{ color: colors.textSecondary }}>▲</Text>
                    </TouchableOpacity>
                    <View style={[styles.orderBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.orderNumber}>{index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => index < files.length - 1 && moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                      style={[styles.orderButton, { opacity: index === files.length - 1 ? 0.3 : 1 }]}
                    >
                      <Text style={{ color: colors.textSecondary }}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setPreviewFileIndex(index)}
                  >
                    <Text>📄</Text>
                    <View style={[styles.previewBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.previewBadgeText}>👁</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.fileDetails}>
                    <Text
                      style={[styles.fileName, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {file.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatFileSize(file.size)} • {file.pageCount || '?'} صفحات
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveFile(file.id)}
                    style={styles.removeButton}
                  >
                    <Text style={[styles.removeIcon, { color: colors.error }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              💡 اضغط على أيقونة الملف لمعاينته
            </Text>
          </View>
        )}

        {/* Merge Button */}
        {files.length >= 2 && (
          <Button
            title={`🔗 دمج ${files.length} ملفات (${getTotalPages()} صفحة)`}
            onPress={handleMerge}
            loading={isProcessing}
            fullWidth
            size="lg"
          />
        )}

        {/* Info Card */}
        {files.length < 2 && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              اختر ملفين PDF على الأقل لدمجهما في ملف واحد
            </Text>
          </Card>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      {/* File Picker Modal */}
      <FilePickerModal
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFilesSelected={handleFilesSelected}
        allowMultiple={true}
        selectedFiles={files}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  favoriteButton: {
    padding: Spacing.xs,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  summaryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  clearButton: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  previewSection: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  previewTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  pdfPreviewContainer: {
    height: 250,
  },
  pdfPreview: {
    flex: 1,
    backgroundColor: 'white',
  },
  filesSection: {
    marginBottom: Spacing.lg,
  },
  filesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  fileCard: {
    marginBottom: Spacing.sm,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderControls: {
    alignItems: 'center',
    paddingRight: Spacing.sm,
  },
  orderButton: {
    padding: 4,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    position: 'relative',
  },
  previewBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBadgeText: {
    fontSize: 10,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: Typography.fontSize.sm,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  removeIcon: {
    fontSize: 18,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});

export default MergeScreen;
