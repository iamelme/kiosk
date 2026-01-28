import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import Sidebar from './components/Sidebar'
import { useEffect } from 'react'
import useBoundStore from './stores/boundStore'

function App(): React.JSX.Element {
  const updateLocale = useBoundStore((state) => state.updateLocale)

  useEffect(() => {
    const ipcHandle = async (): Promise<void> => {
      const locale = await window.apiElectron.getLocale()

      updateLocale(locale)
    }

    ipcHandle()
  }, [updateLocale])

  const store = useBoundStore((state) => state)
  console.log('store ', store)

  return (
    <div className="flex min-h-svh text-slate-700 text-sm">
      <Sidebar />
      <main className="flex-1 p-4 bg-slate-50">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
