// PDF Master Pro - Page Numbers Screen
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
import { addPageNumbersToPDF, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'page-numbers';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type PositionType = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
type FormatType = 'number' | 'page-x-of-y';

const PageNumbersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [format, setFormat] = useState<FormatType>('number');
  const [position, setPosition] = useState<PositionType>('bottom-center');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const formatOptions = [
    { id: 'number', label: '1, 2, 3', example: '1', desc: 'أرقام فقط' },
    { id: 'page-x-of-y', label: 'صفحة X من Y', example: 'Page 1 of 10', desc: 'مع الإجمالي' },
  ];

  const positionOptions = [
    { id: 'top-left', label: 'أعلى يسار', icon: '↖' },
    { id: 'top-center', label: 'أعلى وسط', icon: '⬆' },
    { id: 'top-right', label: 'أعلى يمين', icon: '↗' },
    { id: 'bottom-left', label: 'أسفل يسار', icon: '↙' },
    { id: 'bottom-center', label: 'أسفل وسط', icon: '⬇' },
    { id: 'bottom-right', label: 'أسفل يمين', icon: '↘' },
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

  const handleAddPageNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `numbered_${originalName}.pdf`;

      const result = await addPageNumbersToPDF(
        file.uri,
        {
          position: position,
          fontSize: 12,
          startNumber: 1,
          format: format,
        },
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
            `تمت إضافة أرقام الصفحات بنجاح!\n${file.pageCount} صفحة`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تمت إضافة أرقام الصفحات بنجاح!\nيمكنك العثور على الملف في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في إضافة أرقام الصفحات');
      }
    } catch (error) {
      console.error('Error adding page numbers:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة أرقام الصفحات');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const pdfContainerHeight = SCREEN_HEIGHT * 0.25;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.pageNumbers.title}
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
              <Text style={styles.uploadIcon}>🔢</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              اختر ملف PDF
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

            {/* PDF Preview with Position Indicator */}
            <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
              <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                <Pdf
                  source={{ uri: file.uri }}
                  singlePage={true}
                  style={styles.pdfView}
                  onError={(error) => console.log('PDF Error:', error)}
                />
                {/* Position Indicator */}
                <View style={[styles.positionIndicator, getPositionStyle(position)]}>
                  <Text style={styles.positionText}>
                    {format === 'number' ? '1' : 'Page 1 of 10'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Format Options */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              تنسيق الترقيم
            </Text>
            <View style={styles.formatOptions}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.formatOption,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: format === option.id ? colors.primary : colors.border,
                      borderWidth: format === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setFormat(option.id as FormatType)}
                >
                  <Text style={[styles.formatLabel, { color: colors.textPrimary }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Position Options */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              موضع الترقيم
            </Text>
            <View style={styles.positionGrid}>
              {positionOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.positionOption,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: position === option.id ? colors.primary : colors.border,
                      borderWidth: position === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPosition(option.id as PositionType)}
                >
                  <Text style={styles.positionIcon}>{option.icon}</Text>
                  <Text style={[styles.positionLabel, { color: colors.textPrimary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={`🔢 إضافة أرقام الصفحات (${file.pageCount} صفحة)`}
              onPress={handleAddPageNumbers}
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

const getPositionStyle = (position: PositionType) => {
  const styles: any = {};
  if (position.includes('top')) {
    styles.top = 8;
  } else {
    styles.bottom = 8;
  }
  if (position.includes('left')) {
    styles.left = 8;
  } else if (position.includes('right')) {
    styles.right = 8;
  } else {
    styles.left = 0;
    styles.right = 0;
    styles.alignItems = 'center';
  }
  return styles;
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
  positionIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  formatOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  formatOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  formatLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 4,
  },
  formatDesc: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  positionOption: {
    width: '31%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  positionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});

export default PageNumbersScreen;
