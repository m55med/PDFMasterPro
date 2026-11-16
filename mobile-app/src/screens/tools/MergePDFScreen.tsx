/**
 * Merge PDF Screen
 * Screen for merging multiple PDF files
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../theme';
import { Button, Card } from '../../components/common';
import { MergePDFService } from '../../services/pdf';
import { FileManager } from '../../services/storage';
import { useFilesStore } from '../../store';

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
}

export default function MergePDFScreen({ navigation }: any) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const addFile = useFilesStore((state) => state.addFile);

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
        }));
        setFiles([...files, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      Alert.alert('Error', 'Please select at least 2 PDF files');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const filePaths = files.map(f => f.uri);
      const outputPath = await MergePDFService.merge({
        filePaths,
        outputName: `merged_${Date.now()}.pdf`,
        onProgress: setProgress,
      });

      // Save to file manager
      const fileMetadata = await FileManager.saveFile(outputPath, {
        name: `merged_${Date.now()}.pdf`,
        tool: 'merge',
        type: 'application/pdf',
      });

      addFile(fileMetadata);

      Alert.alert(
        'Success',
        'PDFs merged successfully!',
        [
          { text: 'View Files', onPress: () => navigation.navigate('Files') },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error('Merge error:', error);
      Alert.alert('Error', 'Failed to merge PDFs. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Merge PDF Files</Text>
          <Text style={styles.subtitle}>
            Combine multiple PDFs into one document
          </Text>
        </View>

        {files.length === 0 ? (
          <Card style={styles.uploadCard} onPress={pickFiles}>
            <Text style={styles.uploadEmoji}>📑</Text>
            <Text style={styles.uploadTitle}>Tap to select PDF files</Text>
            <Text style={styles.uploadSubtitle}>
              Select 2 or more PDF files to merge
            </Text>
          </Card>
        ) : (
          <>
            <View style={styles.filesHeader}>
              <Text style={styles.filesCount}>
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </Text>
              <Button variant="ghost" size="sm" onPress={pickFiles}>
                Add More
              </Button>
            </View>

            <FlatList
              data={files}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Card style={styles.fileCard}>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileEmoji}>📄</Text>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {FileManager.formatFileSize(item.size)}
                      </Text>
                    </View>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => removeFile(index)}
                  >
                    ✕
                  </Button>
                </Card>
              )}
              contentContainerStyle={styles.filesList}
            />
          </>
        )}

        {processing && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.progressText}>
              Merging PDFs... {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleMerge}
          disabled={files.length < 2 || processing}
          loading={processing}
          fullWidth
          size="lg"
        >
          {processing ? 'Merging...' : `Merge ${files.length} Files`}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  content: {
    flex: 1,
    padding: theme.spacing.base,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  uploadCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['4xl'],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primaryLight,
  },
  uploadEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  uploadTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  uploadSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  filesCount: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.primary,
  },
  filesList: {
    paddingBottom: theme.spacing.xl,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  fileSize: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  progressText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});
