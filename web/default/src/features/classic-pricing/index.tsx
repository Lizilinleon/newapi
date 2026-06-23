import '@douyinfe/semi-ui/react19-adapter'
import '@douyinfe/semi-ui/dist/css/semi.css'
import 'react-toastify/dist/ReactToastify.css'
import '../../../../classic/src/i18n/i18n'
import './classic-pricing.css'

import { useContext, useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { UserContext, UserProvider } from '../../../../classic/src/context/User'
import {
  StatusContext,
  StatusProvider,
} from '../../../../classic/src/context/Status'
import { ThemeProvider } from '../../../../classic/src/context/Theme'
import HeaderBar from '../../../../classic/src/components/layout/headerbar'
import PricingPage from '../../../../classic/src/components/table/model-pricing/layout/PricingPage'
import { API, setStatusData, showError } from '../../../../classic/src/helpers'

export function ClassicPricing() {
  return (
    <MemoryRouter initialEntries={[window.location.pathname]}>
      <StatusProvider>
        <UserProvider>
          <ThemeProvider>
            <ClassicPricingContent />
          </ThemeProvider>
        </UserProvider>
      </StatusProvider>
    </MemoryRouter>
  )
}

function ClassicPricingContent() {
  const [, userDispatch] = useContext(UserContext)
  const [, statusDispatch] = useContext(StatusContext)

  useEffect(() => {
    document.body.classList.add('classic-pricing-active')
    return () => document.body.classList.remove('classic-pricing-active')
  }, [])

  useEffect(() => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      try {
        userDispatch({ type: 'login', payload: JSON.parse(cachedUser) })
      } catch (_error) {
        localStorage.removeItem('user')
      }
    }

    API.get('/api/status')
      .then((res) => {
        const { success, data } = res.data
        if (success) {
          statusDispatch({ type: 'set', payload: data })
          setStatusData(data)
        }
      })
      .catch(() => showError('Failed to load status'))
  }, [statusDispatch, userDispatch])

  return (
    <div className='classic-pricing-shell'>
      <HeaderBar onMobileMenuToggle={() => undefined} drawerOpen={false} />
      <PricingPage />
    </div>
  )
}

