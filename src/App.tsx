import { Suspense, lazy } from 'react'
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
import { LoanProductsScreen } from './screens/LoanProductsScreen'
import { LoanApplyScreen } from './screens/LoanApplyScreen'
import { LoanDetailsFormScreen } from './screens/LoanDetailsFormScreen'
import { LoanReviewScreen } from './screens/LoanReviewScreen'
import { LoanProcessingScreen } from './screens/LoanProcessingScreen'
import { LoanSuccessScreen } from './screens/LoanSuccessScreen'
import { MyLoansScreen } from './screens/MyLoansScreen'
import { RepaymentScheduleScreen } from './screens/RepaymentScheduleScreen'
import { PayNowScreen } from './screens/PayNowScreen'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { CreditDetailsScreen } from './screens/CreditDetailsScreen'
import { PaymentsTabScreen } from './screens/PaymentsTabScreen'
import { ProfileHomeScreen } from './screens/ProfileHomeScreen'
import { SupportScreen } from './screens/SupportScreen'
import { ChatScreen } from './screens/ChatScreen'
import { AppearanceScreen } from './screens/AppearanceScreen'
import { RewardsScreen } from './screens/RewardsScreen'
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
// The admin console is a separate application that customers never open, so it
// is code-split out of the main bundle and fetched only under /admin.
const AdminLoginScreen = lazy(() =>
  import('./screens/admin/AdminLoginScreen').then((m) => ({ default: m.AdminLoginScreen })),
)
const AdminLayout = lazy(() =>
  import('./screens/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardScreen = lazy(() =>
  import('./screens/admin/AdminDashboardScreen').then((m) => ({ default: m.AdminDashboardScreen })),
)
const AdminSettingsScreen = lazy(() =>
  import('./screens/admin/AdminSettingsScreen').then((m) => ({ default: m.AdminSettingsScreen })),
)
const AdminOperationsScreen = lazy(() =>
  import('./screens/admin/AdminOperationsScreen').then((m) => ({ default: m.AdminOperationsScreen })),
)
const AdminCustomersScreen = lazy(() =>
  import('./screens/admin/AdminCustomersScreen').then((m) => ({ default: m.AdminCustomersScreen })),
)
const AdminLoansScreen = lazy(() =>
  import('./screens/admin/AdminLoansScreen').then((m) => ({ default: m.AdminLoansScreen })),
)
const AdminSupportScreen = lazy(() =>
  import('./screens/admin/AdminSupportScreen').then((m) => ({ default: m.AdminSupportScreen })),
)
const AdminAppearanceScreen = lazy(() =>
  import('./screens/admin/AdminAppearanceScreen').then((m) => ({ default: m.AdminAppearanceScreen })),
)

function CustomerRoutes() {
  const location = useLocation()

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="grid h-full min-h-0 min-w-0 overflow-hidden"
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
              <Route path="my-loans" element={<MyLoansScreen />} />
              <Route path="rewards" element={<RewardsScreen />} />
              <Route path="credit" element={<CreditDetailsScreen />} />
              <Route path="payments" element={<PaymentsTabScreen />} />
              <Route path="profile" element={<ProfileHomeScreen />} />
            </Route>

            {/* Loan journey — catalogue, per-product apply, extra step, review */}
            <Route path="/app/get-money" element={<GetMoneyScreen />} />
            <Route path={ROUTES.LOAN_PRODUCTS} element={<LoanProductsScreen />} />
            <Route path={`${ROUTES.LOAN_PRODUCTS}/:productId`} element={<LoanApplyScreen />} />
            <Route path={ROUTES.LOAN_DETAILS_FORM} element={<LoanDetailsFormScreen />} />
            <Route path={ROUTES.LOAN_REVIEW} element={<LoanReviewScreen />} />
            <Route path={ROUTES.LOAN_PROCESSING} element={<LoanProcessingScreen />} />
            <Route path={ROUTES.LOAN_SUCCESS} element={<LoanSuccessScreen />} />

            <Route path={ROUTES.REPAYMENT_SCHEDULE} element={<RepaymentScheduleScreen />} />
            <Route path={ROUTES.PAY_NOW} element={<PayNowScreen />} />
            <Route path={ROUTES.TRANSACTIONS} element={<TransactionsScreen />} />
            <Route path={ROUTES.CREDIT_DETAILS} element={<CreditDetailsScreen />} />

            <Route path={ROUTES.SUPPORT} element={<SupportScreen />} />
            <Route path={ROUTES.CHAT} element={<ChatScreen />} />

            <Route path={ROUTES.PROFILE_APPEARANCE} element={<AppearanceScreen />} />
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

function AdminFallback() {
  return (
    <div className="admin-stage items-center justify-center bg-subtle">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary" />
        <p className="text-sm font-semibold text-muted">Loading admin console…</p>
      </div>
    </div>
  )
}

function AdminRoutes() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Routes>
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginScreen />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardScreen />} />
          <Route path="settings" element={<AdminSettingsScreen />} />
          <Route path="operations" element={<AdminOperationsScreen />} />
          <Route path="customers" element={<AdminCustomersScreen />} />
          <Route path="loans" element={<AdminLoansScreen />} />
          <Route path="support" element={<AdminSupportScreen />} />
          <Route path="appearance" element={<AdminAppearanceScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
      </Routes>
    </Suspense>
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
