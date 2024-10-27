import TopBar from '../components/shared/TopBar'
import LeftBar from '../components/shared/LeftBar'
import BottomBar from '../components/shared/BottomBar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className='w-full md:flex'>
      <TopBar />
      <LeftBar />
      <section className='flex flex-1 h-full'>
        <Outlet />
      </section>
      <BottomBar />
    </div>
  )
}

export default RootLayout
