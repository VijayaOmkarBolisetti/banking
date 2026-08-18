import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PhoneFrame } from './components/layout/PhoneFrame'
import { AppShell } from './components/layout/AppShell'
import { ROUTES } from './navigation/routes'
import { SplashScreen } from './screens/SplashScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { LoginScreen } from './screens/LoginScreen'
import { OtpScreen } from './screens/OtpScreen'
import { ProfileSetupScreen } from './screens/ProfileSetupScreen'
import { PanScreen } from './screens/PanScreen'
import { AddressScreen } from './screens/AddressScreen'
import { BankScreen } from './screens/BankScreen'
import { ConsentScreen } from './screens/ConsentScreen'
import { EligibilityScreen } from './screens/EligibilityScreen'
import { CreditApprovedScreen } from './screens/CreditApprovedScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { GetMoneyScreen } from './screens/GetMoneyScreen'
import { LoanReviewScreen } from './screens/LoanReviewScreen'
import { LoanProcessingScreen } from './screens/LoanProcessingScreen'
import { LoanSuccessScreen } from './screens/LoanSuccessScreen'
import { RepaymentScheduleScreen } from './screens/RepaymentScheduleScreen'
import { PayNowScreen } from './screens/PayNowScreen'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { CreditDetailsScreen } from './screens/CreditDetailsScreen'
import { PaymentsTabScreen } from './screens/PaymentsTabScreen'
import { ProfileHomeScreen } from './screens/ProfileHomeScreen'
import {
  ProfileBankScreen,
  ProfileDocumentsScreen,
  ProfileHelpScreen,
  ProfileNotificationsScreen,
  ProfilePersonalScreen,
  ProfilePrivacyScreen,
  ProfileSecurityScreen,
  ProfileTermsScreen,
} from './screens/ProfilePages'
import { AdminLoginScreen } from './screens/admin/AdminLoginScreen'
import { AdminLayout } from './screens/admin/AdminLayout'
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen'
import { AdminSettingsScreen } from './screens/admin/AdminSettingsScreen'
import { AdminOperationsScreen } from './screens/admin/AdminOperationsScreen'
import { AdminCustomersScreen } from './screens/admin/AdminCustomersScreen'
import { AdminLoansScreen } from './screens/admin/AdminLoansScreen'

function CustomerRoutes() {
  const location = useLocation()

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="grid h-full min-h-0 overflow-hidden"
          initial={{ opacity: 0, transform: 'translateY(8px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          exit={{ opacity: 0, transform: 'translateY(-6px)' }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <Routes location={location}>
            <Route path={ROUTES.SPLASH} element={<SplashScreen />} />
            <Route path={ROUTES.ONBOARDING} element={<OnboardingScreen />} />
            <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
            <Route path={ROUTES.OTP} element={<OtpScreen />} />
            <Route path={ROUTES.PROFILE} element={<ProfileSetupScreen />} />
            <Route path={ROUTES.PAN} element={<PanScreen />} />
            <Route path={ROUTES.ADDRESS} element={<AddressScreen />} />
            <Route path={ROUTES.BANK} element={<BankScreen />} />
            <Route path={ROUTES.CONSENT} element={<ConsentScreen />} />
            <Route path={ROUTES.ELIGIBILITY} element={<EligibilityScreen />} />
            <Route path={ROUTES.CREDIT_APPROVED} element={<CreditApprovedScreen />} />

            <Route path="/app" element={<AppShell />}>
              <Route path="home" element={<DashboardScreen />} />
              <Route path="credit" element={<CreditDetailsScreen />} />
              <Route path="payments" element={<PaymentsTabScreen />} />
              <Route path="profile" element={<ProfileHomeScreen />} />
            </Route>

            <Route path={ROUTES.GET_MONEY} element={<GetMoneyScreen />} />
            <Route path={ROUTES.LOAN_REVIEW} element={<LoanReviewScreen />} />
            <Route path={ROUTES.LOAN_PROCESSING} element={<LoanProcessingScreen />} />
            <Route path={ROUTES.LOAN_SUCCESS} element={<LoanSuccessScreen />} />
            <Route path={ROUTES.REPAYMENT_SCHEDULE} element={<RepaymentScheduleScreen />} />
            <Route path={ROUTES.PAY_NOW} element={<PayNowScreen />} />
            <Route path={ROUTES.TRANSACTIONS} element={<TransactionsScreen />} />
            <Route path={ROUTES.CREDIT_DETAILS} element={<CreditDetailsScreen />} />
            <Route path={ROUTES.PROFILE_PERSONAL} element={<ProfilePersonalScreen />} />
            <Route path={ROUTES.PROFILE_BANK} element={<ProfileBankScreen />} />
            <Route path={ROUTES.PROFILE_DOCUMENTS} element={<ProfileDocumentsScreen />} />
            <Route path={ROUTES.PROFILE_NOTIFICATIONS} element={<ProfileNotificationsScreen />} />
            <Route path={ROUTES.PROFILE_SECURITY} element={<ProfileSecurityScreen />} />
            <Route path={ROUTES.PROFILE_HELP} element={<ProfileHelpScreen />} />
            <Route path={ROUTES.PROFILE_TERMS} element={<ProfileTermsScreen />} />
            <Route path={ROUTES.PROFILE_PRIVACY} element={<ProfilePrivacyScreen />} />

            <Route path="*" element={<Navigate to={ROUTES.SPLASH} replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginScreen />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardScreen />} />
        <Route path="settings" element={<AdminSettingsScreen />} />
        <Route path="operations" element={<AdminOperationsScreen />} />
        <Route path="customers" element={<AdminCustomersScreen />} />
        <Route path="loans" element={<AdminLoansScreen />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
    </Routes>
  )
}

function Root() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) {
    return <AdminRoutes />
  }
  return <CustomerRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  )
}
