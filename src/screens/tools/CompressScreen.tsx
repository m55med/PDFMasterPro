// PDF Master Pro - Compress PDF Screen
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
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

type CompressionLevel = 'low' | 'medium' | 'high';

const TOOL_ID = 'compress';

const CompressScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  const compressionLevels = [
    { id: 'low', name: t.tools.compress.low, desc: 'Best quality, less compression', icon: '🟢', savings: '20-30%' },
    { id: 'medium', name: t.tools.compress.medium, desc: 'Good balance', icon: '🟡', savings: '40-60%' },
    { id: 'high', name: t.tools.compress.high, desc: 'Smallest file size', icon: '🔴', savings: '70-90%' },
  ];

  const handleSelectFile = () => {
    setFile({
      id: '1',
      name: 'Large_Document.pdf',
      uri: '',
      size: 8500000,
      type: 'application/pdf',
      pageCount: 50,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleCompress = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const savings = level === 'low' ? 25 : level === 'medium' ? 50 : 75;
      Alert.alert(
        t.common.success,
        `${t.tools.compress.compressSuccess}\n\nSaved ${savings}% (${(file.size * savings / 100 / 1024 / 1024).toFixed(1)} MB)`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  const formatSize = (bytes: number): string => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          >
            <Text style={styles.uploadIcon}>📦</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF to Compress
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              Tap to select a file
            </Text>
          </TouchableOpacity>
        ) : (
          <Card style={styles.fileCard}>
            <View style={styles.fileInfo}>
              <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                <Text>📄</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: colors.textPrimary }]}>
                  {file.name}
                </Text>
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                  {formatSize(file.size)} • {file.pageCount} pages
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFile(null)}>
                <Text style={{ color: colors.error }}>✕</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Compression Levels */}
        {file && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.tools.compress.selectLevel}
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
                  Original Size:
                </Text>
                <Text style={[styles.estimateValue, { color: colors.textPrimary }]}>
                  {formatSize(file.size)}
                </Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
                  Estimated Size:
                </Text>
                <Text style={[styles.estimateValue, { color: colors.success }]}>
                  ~{formatSize(file.size * (level === 'low' ? 0.75 : level === 'medium' ? 0.5 : 0.25))}
                </Text>
              </View>
            </Card>

            <Button
              title={t.tools.compress.compressButton}
              onPress={handleCompress}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>📦</Text>}
            />
          </>
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
    marginBottom: Spacing.lg,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  fileCard: {
    marginBottom: Spacing.lg,
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
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  levels: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
});

export default CompressScreen;
