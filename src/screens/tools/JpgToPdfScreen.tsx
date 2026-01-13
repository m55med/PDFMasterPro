// PDF Master Pro - JPG to PDF Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Share from 'react-native-share';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { convertImagesToPDF, ImageFile } from '../../services/pdfManipulationService';
import { useInterstitialAd } from '../../hooks';

const TOOL_ID = 'jpg-to-pdf';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 2) / 3;

type PageSize = 'A4' | 'Letter' | 'fit';
type Orientation = 'portrait' | 'landscape';

const JpgToPdfScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const { showAdAfterOperation } = useInterstitialAd();

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'إذن الوصول للصور',
            message: 'يحتاج التطبيق للوصول إلى الصور لتحويلها إلى PDF',
            buttonNeutral: 'اسألني لاحقاً',
            buttonNegative: 'إلغاء',
            buttonPositive: 'موافق',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleSelectImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission && Platform.OS === 'android') {
      Alert.alert('خطأ', 'لا يوجد إذن للوصول إلى الصور');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 0, // 0 means unlimited
        includeBase64: false,
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('خطأ', response.errorMessage || 'حدث خطأ أثناء اختيار الصور');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const newImages: ImageFile[] = response.assets.map((asset: Asset, index: number) => ({
            id: `${Date.now()}-${index}`,
            uri: asset.uri || '',
            name: asset.fileName || `image_${index}.jpg`,
            type: asset.type || 'image/jpeg',
            width: asset.width,
            height: asset.height,
          }));
          setImages((prev) => [...prev, ...newImages]);
        }
      }
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    setIsProcessing(true);

    try {
      const outputFileName = `images_${images.length}_pages.pdf`;
      const result = await convertImagesToPDF(images, outputFileName, {
        pageSize,
        orientation,
        margin: 20,
      });

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
            `تم تحويل ${images.length} صورة إلى PDF بنجاح!`,
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            console.log('Share cancelled:', shareError);
          }
          await showAdAfterOperation();
          Alert.alert(
            t.common.success,
            'تم إنشاء ملف PDF بنجاح!\nيمكنك العثور على الملف في ملفات التطبيق.',
            [{ text: 'حسناً', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert('خطأ', 'فشل في تحويل الصور إلى PDF');
      }
    } catch (error) {
      console.error('Error converting images:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحويل الصور');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderImageItem = (image: ImageFile, index: number) => (
    <View key={image.id} style={styles.imageWrapper}>
      <View style={[styles.imageContainer, { backgroundColor: colors.bgWhite }]}>
        <Image source={{ uri: image.uri }} style={styles.imageThumb} resizeMode="cover" />
        <View style={[styles.orderBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.orderNumber}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => handleRemoveImage(image.id)}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageControls}>
        <TouchableOpacity
          onPress={() => index > 0 && moveImage(index, index - 1)}
          disabled={index === 0}
          style={[styles.moveButton, { opacity: index === 0 ? 0.3 : 1 }]}
        >
          <Text style={{ color: colors.textSecondary }}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => index < images.length - 1 && moveImage(index, index + 1)}
          disabled={index === images.length - 1}
          style={[styles.moveButton, { opacity: index === images.length - 1 ? 0.3 : 1 }]}
        >
          <Text style={{ color: colors.textSecondary }}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title="JPG إلى PDF"
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
          onPress={handleSelectImages}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.uploadIconContainer,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={styles.uploadIcon}>🖼️</Text>
          </View>
          <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
            إضافة صور
          </Text>
          <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
            اضغط لاختيار صور من المعرض
          </Text>
        </TouchableOpacity>

        {/* Images Summary */}
        {images.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.bgWhite }]}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryChip, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.summaryChipText, { color: colors.primary }]}>
                  🖼️ {images.length} صورة
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setImages([])}
                style={[styles.clearButton, { backgroundColor: colors.error + '20' }]}
              >
                <Text style={[styles.clearButtonText, { color: colors.error }]}>
                  مسح الكل
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings */}
        {images.length > 0 && (
          <Card style={styles.settingsCard}>
            <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>
              إعدادات PDF
            </Text>

            {/* Page Size */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>
                حجم الصفحة:
              </Text>
              <View style={styles.optionsRow}>
                {(['A4', 'Letter', 'fit'] as PageSize[]).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: pageSize === size ? colors.primary : colors.bgGray,
                        borderColor: pageSize === size ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setPageSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: pageSize === size ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {size === 'fit' ? 'مناسب' : size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Orientation */}
            {pageSize !== 'fit' && (
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>
                  الاتجاه:
                </Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: orientation === 'portrait' ? colors.primary : colors.bgGray,
                        borderColor: orientation === 'portrait' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setOrientation('portrait')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: orientation === 'portrait' ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      طولي 📱
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: orientation === 'landscape' ? colors.primary : colors.bgGray,
                        borderColor: orientation === 'landscape' ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setOrientation('landscape')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: orientation === 'landscape' ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      عرضي 📺
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ترتيب الصور (اضغط الأسهم لتغيير الترتيب)
            </Text>
            <View style={styles.imagesGrid}>
              {images.map((image, index) => renderImageItem(image, index))}
            </View>
          </View>
        )}

        {/* Convert Button */}
        {images.length > 0 && (
          <Button
            title={`📄 تحويل ${images.length} صورة إلى PDF`}
            onPress={handleConvert}
            loading={isProcessing}
            fullWidth
            size="lg"
          />
        )}

        {/* Info Card */}
        {images.length === 0 && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                اختر صورة واحدة أو أكثر لتحويلها إلى ملف PDF
              </Text>
              <Text style={[styles.infoSubtext, { color: colors.textLight }]}>
                يدعم صيغ JPG و PNG
              </Text>
            </View>
          </Card>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  settingsCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  settingsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  settingRow: {
    marginBottom: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  imagesSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  orderBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageControls: {
    flexDirection: 'row',
    marginTop: 4,
    gap: Spacing.xs,
  },
  moveButton: {
    padding: 4,
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
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
});

export default JpgToPdfScreen;
