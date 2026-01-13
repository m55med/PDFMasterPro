// PDF Master Pro - Feedback Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useAuth } from '../../context';
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

type FeedbackType = 'bug' | 'suggestion' | 'question' | 'other';

interface FeedbackOption {
  id: FeedbackType;
  icon: string;
  labelAr: string;
  labelEn: string;
}

const FEEDBACK_TYPES: FeedbackOption[] = [
  { id: 'bug', icon: '🐛', labelAr: 'الإبلاغ عن مشكلة', labelEn: 'Report a Bug' },
  { id: 'suggestion', icon: '💡', labelAr: 'اقتراح ميزة', labelEn: 'Suggest Feature' },
  { id: 'question', icon: '❓', labelAr: 'سؤال', labelEn: 'Question' },
  { id: 'other', icon: '📝', labelAr: 'أخرى', labelEn: 'Other' },
];

const SUPPORT_EMAIL = 'support@pdfmasterpro.com';

const FeedbackScreen: React.FC = () => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArabic = language === 'ar';

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'الرجاء إدخال الموضوع' : 'Please enter a subject'
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'الرجاء إدخال رسالتك' : 'Please enter your message'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackLabel = FEEDBACK_TYPES.find(f => f.id === feedbackType);
      const typeLabel = isArabic ? feedbackLabel?.labelAr : feedbackLabel?.labelEn;

      const emailSubject = `[PDF Master Pro - ${typeLabel}] ${subject}`;
      const emailBody = `
نوع الملاحظة / Feedback Type: ${typeLabel}
المستخدم / User: ${user?.email || 'غير مسجل / Not logged in'}
الجهاز / Device: ${Platform.OS} ${Platform.Version}

الرسالة / Message:
${message}
      `.trim();

      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        // Clear form after opening email
        setSubject('');
        setMessage('');
        Alert.alert(
          isArabic ? 'شكراً لك' : 'Thank You',
          isArabic
            ? 'تم فتح تطبيق البريد الإلكتروني. يرجى إرسال الرسالة.'
            : 'Email app opened. Please send the message.'
        );
      } else {
        Alert.alert(
          isArabic ? 'خطأ' : 'Error',
          isArabic
            ? 'لا يمكن فتح تطبيق البريد الإلكتروني. يرجى إرسال رسالة إلى ' + SUPPORT_EMAIL
            : 'Cannot open email app. Please send an email to ' + SUPPORT_EMAIL
        );
      }
    } catch (error) {
      console.error('Feedback error:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={isArabic ? 'الملاحظات والدعم' : 'Feedback & Support'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Feedback Type Selection */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {isArabic ? 'نوع الملاحظة' : 'Feedback Type'}
          </Text>
          <View style={styles.typeContainer}>
            {FEEDBACK_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: feedbackType === type.id ? colors.primary : colors.bgWhite,
                    borderColor: feedbackType === type.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFeedbackType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    { color: feedbackType === type.id ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {isArabic ? type.labelAr : type.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject Input */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {isArabic ? 'الموضوع' : 'Subject'}
          </Text>
          <Card style={styles.inputCard}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  textAlign: isArabic ? 'right' : 'left',
                },
              ]}
              placeholder={isArabic ? 'أدخل موضوع رسالتك...' : 'Enter the subject...'}
              placeholderTextColor={colors.textLight}
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
          </Card>

          {/* Message Input */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {isArabic ? 'الرسالة' : 'Message'}
          </Text>
          <Card style={styles.inputCard}>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.textPrimary,
                  textAlign: isArabic ? 'right' : 'left',
                },
              ]}
              placeholder={
                isArabic
                  ? 'اكتب رسالتك هنا... كن محدداً قدر الإمكان لمساعدتنا في فهم ملاحظاتك.'
                  : 'Write your message here... Be as specific as possible to help us understand your feedback.'
              }
              placeholderTextColor={colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={[styles.charCount, { color: colors.textLight }]}>
              {message.length}/1000
            </Text>
          </Card>

          {/* Submit Button */}
          <Button
            title={isArabic ? 'إرسال الملاحظات' : 'Submit Feedback'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          {/* Contact Info */}
          <Card style={styles.contactCard}>
            <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>
              {isArabic ? 'طرق التواصل الأخرى' : 'Other Ways to Contact Us'}
            </Text>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleContactSupport}
            >
              <Text style={styles.contactIcon}>📧</Text>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </Text>
                <Text style={[styles.contactValue, { color: colors.primary }]}>
                  {SUPPORT_EMAIL}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>⏰</Text>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {isArabic ? 'وقت الرد المتوقع' : 'Expected Response Time'}
                </Text>
                <Text style={[styles.contactValue, { color: colors.textPrimary }]}>
                  {isArabic ? '24-48 ساعة' : '24-48 hours'}
                </Text>
              </View>
            </View>
          </Card>

          {/* FAQ Link */}
          <TouchableOpacity style={styles.faqLink}>
            <Text style={[styles.faqText, { color: colors.textSecondary }]}>
              {isArabic ? 'هل لديك سؤال؟ تحقق من ' : 'Have a question? Check our '}
              <Text style={{ color: colors.primary }}>
                {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  inputCard: {
    padding: 0,
    overflow: 'hidden',
  },
  input: {
    fontSize: Typography.fontSize.base,
    padding: Spacing.md,
  },
  textArea: {
    fontSize: Typography.fontSize.base,
    padding: Spacing.md,
    minHeight: 150,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  contactCard: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  contactTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: Typography.fontSize.sm,
  },
  contactValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  faqLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  faqText: {
    fontSize: Typography.fontSize.sm,
  },
});

export default FeedbackScreen;
