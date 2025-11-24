import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default App
