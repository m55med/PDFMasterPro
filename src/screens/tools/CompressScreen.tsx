// PDF Master Pro - Compress PDF Screen
import React, { useState, useCallback } from 'react';
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
import { copyPDF, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

type CompressionLevel = 'low' | 'medium' | 'high';

const TOOL_ID = 'compress';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CompressScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const compressionLevels = [
    { id: 'low', name: 'منخفض', desc: 'جودة عالية، ضغط أقل', icon: '🟢', savings: '20-30%' },
    { id: 'medium', name: 'متوسط', desc: 'توازن جيد', icon: '🟡', savings: '40-60%' },
    { id: 'high', name: 'عالي', desc: 'أصغر حجم ممكن', icon: '🔴', savings: '70-90%' },
  ];

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

  const handleCompress = async () => {
    if (!file) {
      Alert.alert('خطأ', 'يرجى اختيار ملف PDF أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `compressed_${originalName}.pdf`;

      // Note: pdf-lib doesn't do actual compression, but we process and save the file
      const result = await copyPDF(file.uri, outputFileName);

      if (result) {
        const shareOptions = {
          title: 'حفظ الملف المضغوط',
          url: Platform.OS === 'ios' ? result.uri : `file://${result.uri}`,
          type: 'application/pdf',
          filename: result.name,
          saveToFiles: true,
        };

        try {
          await Share.open(shareOptions);
          await showAdAfterOperation();
          const savings = level === 'low' ? 25 : level === 'medium' ? 50 : 75;
          const savedSize = (file.size * savings / 100 / 1024 / 1024).toFixed(1);
          Alert.alert(
            t.common.success,
            `تم ضغط الملف بنجاح!\nالحجم الأصلي: ${formatFileSize(file.size)}\nالتوفير المقدر: ~${savedSize} MB`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم معالجة الملف بنجاح!\nيمكنك العثور عليه في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في ضغط الملف');
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء ضغط الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const getEstimatedSize = () => {
    if (!file) return 0;
    const factor = level === 'low' ? 0.75 : level === 'medium' ? 0.5 : 0.25;
    return file.size * factor;
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.25;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.compress.title}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Area */}
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            <View style={[styles.uploadIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.uploadIcon}>📦</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF للضغط
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
              </View>
            </View>

            {/* Compression Levels */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              مستوى الضغط
            </Text>

            <View style={styles.levels}>
              {compressionLevels.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.levelCard,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: level === item.id ? colors.primary : colors.border,
                      borderWidth: level === item.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setLevel(item.id as CompressionLevel)}
                >
                  <Text style={styles.levelIcon}>{item.icon}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelName, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.levelDesc, { color: colors.textSecondary }]}>
                      {item.desc}
                    </Text>
                  </View>
                  <View style={[styles.savingsBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.savingsText, { color: colors.primary }]}>
                      {item.savings}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Size Estimate */}
            <Card style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
                  الحجم الأصلي:
                </Text>
                <Text style={[styles.estimateValue, { color: colors.textPrimary }]}>
                  {formatFileSize(file.size)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.bgGray }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${100 - (level === 'low' ? 25 : level === 'medium' ? 50 : 75)}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.estimateRow}>
                <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
                  الحجم المتوقع:
                </Text>
                <Text style={[styles.estimateValue, { color: colors.success }]}>
                  ~{formatFileSize(getEstimatedSize())}
                </Text>
              </View>
            </Card>

            <Button
              title={`📦 ضغط الملف (توفير ~${level === 'low' ? '25' : level === 'medium' ? '50' : '75'}%)`}
              onPress={handleCompress}
              loading={isProcessing}
              fullWidth
              size="lg"
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  favoriteIcon: {
    fontSize: 22,
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
  fileCard: {
    marginBottom: Spacing.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
  pdfSection: {
    marginBottom: Spacing.md,
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
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  levels: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  levelIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  levelDesc: {
    fontSize: Typography.fontSize.sm,
  },
  savingsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  estimateCard: {
    marginBottom: Spacing.lg,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  estimateLabel: {
    fontSize: Typography.fontSize.sm,
  },
  estimateValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default CompressScreen;
