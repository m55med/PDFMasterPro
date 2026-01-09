// PDF Master Pro - Protect PDF Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, Input } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'protect';

const ProtectScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    modifying: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleProtect = async () => {
    if (!file) return;
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t.common.success, t.tools.protect.protectSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.protect.title}
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
            <Text style={styles.uploadIcon}>🔐</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF to Protect
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

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.tools.protect.setPassword}
            </Text>

            <Input
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Permissions
            </Text>

            <Card style={styles.permissionsCard}>
              {[
                { key: 'printing', label: 'Allow Printing' },
                { key: 'copying', label: 'Allow Copying' },
                { key: 'modifying', label: 'Allow Modifying' },
              ].map((item) => (
                <View key={item.key} style={styles.permissionRow}>
                  <Text style={[styles.permissionLabel, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                  <Switch
                    value={permissions[item.key as keyof typeof permissions]}
                    onValueChange={(value) =>
                      setPermissions({ ...permissions, [item.key]: value })
                    }
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              ))}
            </Card>

            <Button
              title={t.tools.protect.protectButton}
              onPress={handleProtect}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>🔐</Text>}
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
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold, marginBottom: Spacing.md, marginTop: Spacing.md },
  permissionsCard: { marginBottom: Spacing.lg },
  permissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  permissionLabel: { fontSize: Typography.fontSize.base },
});

export default ProtectScreen;
