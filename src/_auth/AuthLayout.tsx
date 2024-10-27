import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {

  const isAuthonicated = false;
  return (
    <>
      {isAuthonicated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className='flex flex-1 flex-col justify-center items-center py-10'>
            <Outlet />
          </section>
          <img src="/assets/images/side-img.svg" alt="auth-layout" className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat' />
        </>
      )}
    </>
  )
}

export default AuthLayout;
