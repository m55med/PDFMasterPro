// PDF Master Pro - Rotate PDF Screen
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

const TOOL_ID = 'rotate';

const RotateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);
  const [isProcessing, setIsProcessing] = useState(false);

  const rotationOptions = [
    { value: 90, label: '90°', icon: '↻' },
    { value: 180, label: '180°', icon: '↺↻' },
    { value: 270, label: '270°', icon: '↺' },
  ];

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

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t.common.success, t.tools.rotate.rotateSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
          >
            <Text style={styles.uploadIcon}>🔄</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF to Rotate
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
                  <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                    {file.pageCount} pages
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)}>
                  <Text style={{ color: colors.error }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.tools.rotate.selectDegrees}
            </Text>

            <View style={styles.rotationOptions}>
              {rotationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.rotationOption,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: degrees === option.value ? colors.primary : colors.border,
                      borderWidth: degrees === option.value ? 2 : 1,
                    },
                  ]}
                  onPress={() => setDegrees(option.value as 90 | 180 | 270)}
                >
                  <Text style={styles.rotationIcon}>{option.icon}</Text>
                  <Text style={[styles.rotationLabel, { color: colors.textPrimary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={t.tools.rotate.rotateButton}
              onPress={handleRotate}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>🔄</Text>}
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
  fileSize: { fontSize: Typography.fontSize.sm },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold, marginBottom: Spacing.md },
  rotationOptions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  rotationOption: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg },
  rotationIcon: { fontSize: 32, marginBottom: Spacing.sm },
  rotationLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
});

export default RotateScreen;
