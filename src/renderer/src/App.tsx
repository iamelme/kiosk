import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="flex h-full text-slate-700 text-sm">
      <Sidebar />
      <main className="flex-1 p-4 bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}

export default App
