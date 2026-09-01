import { Navigate } from 'react-router-dom'
import { ROUTES } from '../navigation/routes'

/**
 * Legacy redirect. "Get money" was a single personal-loan flow before the app
 * offered four products; the catalogue replaced it. Kept so old links and any
 * bookmarked `/app/get-money` still land somewhere sensible.
 */
export function GetMoneyScreen() {
  return <Navigate to={ROUTES.LOAN_PRODUCTS} replace />
}
