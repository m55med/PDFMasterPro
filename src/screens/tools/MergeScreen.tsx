// PDF Master Pro - Merge PDF Screen
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
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'merge';

const MergeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFiles = () => {
    // TODO: Implement file picker
    // For demo, add dummy files
    const dummyFile: PDFFile = {
      id: Date.now().toString(),
      name: `Document_${files.length + 1}.pdf`,
      uri: '',
      size: Math.floor(Math.random() * 5000000),
      type: 'application/pdf',
      pageCount: Math.floor(Math.random() * 20) + 1,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    setFiles([...files, dummyFile]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      Alert.alert('Error', 'Please add at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        t.common.success,
        t.tools.merge.mergeSuccess,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            {files.length >= 2 && (
              <TouchableOpacity onPress={handleMerge}>
                <Text style={[styles.mergeButton, { color: colors.primary }]}>
                  Merge
                </Text>
              </TouchableOpacity>
            )}
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
            Tap to select PDF files
          </Text>
        </TouchableOpacity>

        {/* Files List */}
        {files.length > 0 && (
          <View style={styles.filesSection}>
            <View style={styles.filesHeader}>
              <Text style={[styles.filesTitle, { color: colors.textPrimary }]}>
                Selected Files ({files.length})
              </Text>
              {files.length > 0 && (
                <TouchableOpacity onPress={() => setFiles([])}>
                  <Text style={[styles.clearAll, { color: colors.error }]}>
                    {t.common.clearAll}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {files.map((file, index) => (
              <Card key={file.id} style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <View style={styles.dragHandle}>
                    <Text style={{ color: colors.textLight }}>≡</Text>
                  </View>
                  <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                    <Text>📄</Text>
                  </View>
                  <View style={styles.fileDetails}>
                    <Text
                      style={[styles.fileName, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {file.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatSize(file.size)} • {file.pageCount} pages
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveFile(file.id)}
                    style={styles.removeButton}
                  >
                    <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              💡 {t.tools.merge.dragToReorder}
            </Text>
          </View>
        )}

        {/* Merge Button */}
        {files.length >= 2 && (
          <Button
            title={t.tools.merge.mergeButton}
            onPress={handleMerge}
            loading={isProcessing}
            fullWidth
            size="lg"
            icon={<Text>🔗</Text>}
          />
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
  mergeButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
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
  filesSection: {
    marginBottom: Spacing.lg,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  clearAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  fileCard: {
    marginBottom: Spacing.sm,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    paddingHorizontal: Spacing.sm,
  },
  fileIcon: {
    width: 40,
    height: 40,
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
  removeButton: {
    padding: Spacing.sm,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

export default MergeScreen;
