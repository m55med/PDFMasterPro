// PDF Master Pro - Watermark Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, Input } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'watermark';

const WatermarkScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isProcessing, setIsProcessing] = useState(false);

  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6B7280'];

  const handleSelectFile = () => {
    setFile({
      id: '1',
      name: 'Document.pdf',
      uri: '',
      size: 2500000,
      type: 'application/pdf',
      pageCount: 10,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleAddWatermark = async () => {
    if (!file || !watermarkText) {
      Alert.alert('Error', 'Please enter watermark text');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t.common.success, t.tools.watermark.addSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

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
          >
            <Text style={styles.uploadIcon}>💧</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Card style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text>📄</Text>
                </View>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]}>
                    {file.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)}>
                  <Text style={{ color: colors.error }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Input
              label={t.tools.watermark.watermarkText}
              placeholder="Enter watermark text"
              value={watermarkText}
              onChangeText={setWatermarkText}
            />

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Color
            </Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <Card style={styles.previewCard}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                Preview
              </Text>
              <View style={styles.previewArea}>
                <Text
                  style={[
                    styles.previewText,
                    { color: selectedColor, opacity: 0.3 },
                  ]}
                >
                  {watermarkText}
                </Text>
              </View>
            </Card>

            <Button
              title={t.tools.watermark.watermarkButton}
              onPress={handleAddWatermark}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>💧</Text>}
            />
          </>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  favoriteIcon: { fontSize: 22 },
  uploadArea: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  uploadIcon: { fontSize: 48, marginBottom: Spacing.md },
  uploadTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
  fileCard: { marginBottom: Spacing.lg },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  fileDetails: { flex: 1 },
  fileName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold, marginBottom: Spacing.md },
  colorOptions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  colorOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  checkmark: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  previewCard: { marginBottom: Spacing.lg },
  previewLabel: { fontSize: Typography.fontSize.sm, marginBottom: Spacing.sm },
  previewArea: { height: 100, backgroundColor: '#F3F4F6', borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  previewText: { fontSize: 24, fontWeight: 'bold', transform: [{ rotate: '-25deg' }] },
});

export default WatermarkScreen;
