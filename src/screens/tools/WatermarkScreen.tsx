// PDF Master Pro - Watermark Screen
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
import { Header, Button, Card, Input, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { addWatermarkToPDF, getPDFPageCount } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'watermark';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WatermarkScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [opacity, setOpacity] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const colorOptions = [
    { color: '#3B82F6', name: 'أزرق' },
    { color: '#EF4444', name: 'أحمر' },
    { color: '#10B981', name: 'أخضر' },
    { color: '#F59E0B', name: 'برتقالي' },
    { color: '#6B7280', name: 'رمادي' },
  ];

  const opacityOptions = [
    { value: 0.1, label: '10%' },
    { value: 0.2, label: '20%' },
    { value: 0.3, label: '30%' },
    { value: 0.5, label: '50%' },
  ];

  // Filter input to only allow English letters, numbers, spaces, and basic punctuation
  const handleWatermarkTextChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9\s.,\-_!?]/g, '');
    setWatermarkText(filteredText);
  };

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

  const handleAddWatermark = async () => {
    if (!file || !watermarkText) {
      Alert.alert('خطأ', 'يرجى إدخال نص العلامة المائية');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        } : { r: 0.5, g: 0.5, b: 0.5 };
      };

      const originalName = file.name.replace('.pdf', '').replace(/^\d+_/, '');
      const outputFileName = `watermarked_${originalName}.pdf`;

      const result = await addWatermarkToPDF(
        file.uri,
        watermarkText,
        {
          color: hexToRgb(selectedColor),
          opacity: opacity,
          fontSize: 50,
          rotation: -45,
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
            `تمت إضافة العلامة المائية "${watermarkText}" بنجاح!`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تمت إضافة العلامة المائية بنجاح!\nيمكنك العثور على الملف في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في إضافة العلامة المائية');
      }
    } catch (error: any) {
      console.error('Error adding watermark:', error);
      if (error?.message === 'INVALID_WATERMARK_TEXT') {
        Alert.alert(
          'تنبيه',
          'يُسمح فقط بالأحرف والأرقام الإنجليزية.\n\nأمثلة صحيحة:\n• CONFIDENTIAL\n• DRAFT\n• COPY\n• DO NOT COPY',
          [{ text: 'حسناً' }]
        );
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء إضافة العلامة المائية');
      }
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
        title={t.tools.watermark.title}
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
              <Text style={styles.uploadIcon}>💧</Text>
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

            {/* PDF Preview */}
            <View style={[styles.pdfSection, { height: pdfContainerHeight }]}>
              <View style={[styles.pdfContainer, { backgroundColor: colors.bgWhite }]}>
                <Pdf
                  source={{ uri: file.uri }}
                  singlePage={true}
                  style={styles.pdfView}
                  onError={(error) => console.log('PDF Error:', error)}
                />
                {/* Watermark Preview Overlay */}
                <View style={styles.watermarkOverlay}>
                  <Text
                    style={[
                      styles.watermarkPreview,
                      { color: selectedColor, opacity: opacity },
                    ]}
                  >
                    {watermarkText}
                  </Text>
                </View>
              </View>
            </View>

            {/* Watermark Text Input */}
            <Input
              label="نص العلامة المائية (إنجليزي فقط)"
              placeholder="CONFIDENTIAL, DRAFT, COPY..."
              value={watermarkText}
              onChangeText={handleWatermarkTextChange}
            />

            {/* Color Options */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              اللون
            </Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((item) => (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: item.color },
                    selectedColor === item.color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(item.color)}
                >
                  {selectedColor === item.color && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Opacity Options */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              الشفافية
            </Text>
            <View style={styles.opacityOptions}>
              {opacityOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.opacityOption,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: opacity === item.value ? colors.primary : colors.border,
                      borderWidth: opacity === item.value ? 2 : 1,
                    },
                  ]}
                  onPress={() => setOpacity(item.value)}
                >
                  <Text style={[styles.opacityLabel, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={`💧 إضافة العلامة المائية`}
              onPress={handleAddWatermark}
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
  watermarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  watermarkPreview: {
    fontSize: 28,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  opacityOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  opacityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  opacityLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default WatermarkScreen;
