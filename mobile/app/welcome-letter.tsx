import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { MotiView } from 'moti';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useGetUserDashboardQuery } from '../redux/apies/dashboardApi';

export default function WelcomeLetterScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { data: dashboardData, isLoading } = useGetUserDashboardQuery();
  const [isDownloading, setIsDownloading] = useState(false);
  // const [isDownloading, setIsDownloading] = useState(false);

  const profile = dashboardData?.data?.profile;
  const account = dashboardData?.data?.account;
  const referral = dashboardData?.data?.referral;

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const logoUrl = 'https://shreesarwadnya.com/sarwadnya-nav-logo.png';

  const generateHtml = () => {
    const name = profile?.name || 'Member';
    const memberId = referral?.code || 'N/A';
    const phone = profile?.phone_number || 'N/A';
    const email = profile?.email || 'N/A';
    const joinedDate = formatDate(account?.joined_at);
    const issueDate = formatDate(new Date().toISOString());

    const primaryColor = '#F29F05';
    const textColor = '#1F2937';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&family=Great+Vibes&display=swap');

          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }

          .page-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
            box-sizing: border-box;
            padding: 5mm;
          }

          .border-frame {
            width: 100%;
            height: 100%;
            border: 3px solid ${primaryColor};
            box-sizing: border-box;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          .header {
            background-color: ${primaryColor};
            height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
          }

          .logo-bg {
            background: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .logo-img {
            width: 60px;
            height: auto;
          }

          .header-text {
            color: white;
            display: flex;
            flex-direction: column;
          }

          .header-title {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }

          .header-subtitle {
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 4px;
          }

          .content-body {
            padding: 40px 36px;
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 90px;
            font-family: 'Playfair Display', serif;
            color: rgba(0,0,0,0.04);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 32px;
          }

          .meta-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .meta-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #6B7280;
            letter-spacing: 1px;
          }

          .meta-value {
            font-size: 15px;
            font-weight: 700;
            color: ${textColor};
          }

          .member-id-color {
            color: #EA580C;
          }

          .details-card {
            border: 1px solid #E5E7EB;
            border-left: 6px solid ${primaryColor};
            border-radius: 10px;
            padding: 28px;
            margin-bottom: 36px;
            background: #FCFCFC;
          }

          .card-header {
            color: #92400E;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 24px;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .card-header::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #FED7AA;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 48px;
            row-gap: 20px;
          }

          .field-wrapper {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .field-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #9CA3AF;
            letter-spacing: 0.8px;
          }

          .field-value {
            font-size: 14px;
            font-weight: 600;
            color: ${textColor};
          }

          .welcome-title {
            font-size: 22px;
            color: #374151;
            margin-bottom: 20px;
            font-family: 'Playfair Display', serif;
          }

          .welcome-title span {
            color: ${primaryColor};
            font-weight: 700;
          }

          .text-p {
            font-size: 13px;
            line-height: 1.9;
            color: #4B5563;
            margin-bottom: 18px;
            text-align: justify;
          }

          .note-box {
            margin-top: 28px;
            background-color: #FFFBEB;
            border: 1px solid #FEF3C7;
            padding: 16px;
            border-radius: 8px;
            font-size: 11px;
            color: #B45309;
            line-height: 1.6;
          }

          .footer-section {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            padding-right: 24px;
            position: relative;
          }

          .quote {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 16px;
            color: #374151;
            margin-bottom: 36px;
            text-align: center;
            width: 100%;
          }

          .signature-container {
            display: flex;
            align-items: center;
            gap: 16px;
            position: relative;
          }

          .stamp-outer {
            width: 100px;
            height: 100px;
            border: 3px solid #1F2937;
            border-radius: 50%;
            opacity: 0.18;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 60px;
            top: -50px;
            pointer-events: none;
            transform: rotate(-15deg);
          }

          .stamp-inner {
            text-align: center;
            font-size: 11px;
            font-weight: 800;
            line-height: 1.3;
            text-transform: uppercase;
            color: #1F2937;
          }

          .sign-box {
            text-align: center;
            position: relative;
            z-index: 2;
          }

          .sign-script {
            font-family: 'Great Vibes', cursive;
            font-size: 36px;
            color: #1F2937;
            margin-bottom: 8px;
          }

          .sign-line {
            height: 2px;
            background: #9CA3AF;
            width: 220px;
            margin: 8px auto;
          }

          .sign-name {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            color: #111827;
          }

          .sign-role {
            font-size: 10px;
            text-transform: uppercase;
            color: #6B7280;
            letter-spacing: 0.8px;
          }

          .page-footer {
            margin-top: 24px;
            text-align: center;
            font-size: 9px;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="border-frame">
            <div class="header">
              <div class="logo-bg">
                <img src="${logoUrl}" class="logo-img" />
              </div>
              <div class="header-text">
                <div class="header-title">SHREE SARWADNYA</div>
                <div class="header-subtitle">ALL IN ONE SOLUTIONS</div>
              </div>
            </div>

            <div class="content-body">
              <div class="watermark">SARWADNYA</div>

              <div class="meta-row">
                <div class="meta-group">
                  <div class="meta-label">DATE OF ISSUE</div>
                  <div class="meta-value">${issueDate}</div>
                </div>
                <div class="meta-group" style="align-items: flex-end;">
                  <div class="meta-label">MEMBER ID</div>
                  <div class="meta-value member-id-color">${memberId}</div>
                </div>
              </div>

              <div class="details-card">
                <div class="card-header">MEMBER DETAILS</div>
                <div class="grid-2">
                  <div class="field-wrapper">
                    <div class="field-label">Name</div>
                    <div class="field-value">${name}</div>
                  </div>
                  <div class="field-wrapper">
                    <div class="field-label">Member ID</div>
                    <div class="field-value">${memberId}</div>
                  </div>
                  <div class="field-wrapper">
                    <div class="field-label">Mobile</div>
                    <div class="field-value">${phone}</div>
                  </div>
                  <div class="field-wrapper">
                    <div class="field-label">Email</div>
                    <div class="field-value">${email}</div>
                  </div>
                  <div class="field-wrapper">
                    <div class="field-label">Joined Date</div>
                    <div class="field-value">${joinedDate}</div>
                  </div>
                </div>
              </div>

              <div class="welcome-title">
                Welcome to <span>Shree Sarwadnya All in one solutions</span>
              </div>

              <div class="text-p">
                We are thrilled to welcome you as a distinguished member of our growing family. Your decision to join <strong>Shree Sarwadnya</strong> reflects your trust in our vision for financial empowerment and holistic growth.
              </div>

              <div class="text-p">
                At Shree Sarwadnya, we are steadfast in our commitment to transparency, security, and delivering exceptional value. We have designed our ecosystem to support your aspirations and ensure a prosperous journey ahead.
              </div>

              <div class="note-box">
                <strong>Note:</strong> Your account is now active. You can access your full portfolio and services by logging into <strong>shreesarwadnya.com</strong> with your credentials.
              </div>

              <div class="footer-section">
                <div class="quote">"Wish You All The Best!"</div>

                <div class="signature-container">
                  <div class="stamp-outer">
                    <div class="stamp-inner">DIGITALLY<br>SIGNED</div>
                  </div>
                  <div class="sign-box">
                    <div class="sign-script">Shree Sarwadnya</div>
                    <div class="sign-line"></div>
                    <div class="sign-name">SHREE SARWADNYA</div>
                    <div class="sign-role">All in one solutions<br>AUTHORIZED SIGNATORY</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="page-footer">
              Computer Generated Document • No Physical Signature Required<br>
              © ${new Date().getFullYear()} Shree Sarwadnya All in one solutions. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (Platform.OS === 'android') {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download Welcome Letter' });
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };


  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary?.start} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Welcome Letter</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.mainContent}
        >
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/welcome_letter_illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.mainTitle}>Ready for Download</Text>
          <Text style={styles.mainDescription}>
            Your official welcome letter from Shree Sarwadnya All in One Solutions is ready. Download the PDF to view your membership details and official welcome note.
          </Text>

          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={20} color="#F29F05" />
              <Text style={styles.infoText}>{profile?.name || 'Member'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="finger-print-outline" size={20} color="#F29F05" />
              <Text style={styles.infoText}>ID: {referral?.code || 'N/A'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="download-outline" size={24} color="white" />
            )}
            <Text style={styles.downloadBtnText}>
              {isDownloading ? 'Generating PDF...' : 'Download Official PDF'}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.background.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...Shadow.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerBarTitle: {
      fontSize: FontSize.lg,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    scrollContent: {
      flexGrow: 1,
    },
    mainContent: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 30,
      paddingTop: 40,
      paddingBottom: 60,
    },
    illustrationWrapper: {
      width: '100%',
      height: 300,
      marginBottom: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustration: {
      width: '100%',
      height: '100%',
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    mainDescription: {
      fontSize: 14,
      color: colors.text.muted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 30,
    },
    cardInfo: {
      width: '100%',
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadow.small,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    downloadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F29F05',
      paddingHorizontal: 40,
      paddingVertical: 18,
      borderRadius: 16,
      gap: 12,
      ...Shadow.medium,
      width: '100%',
      justifyContent: 'center',
    },
    downloadBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
