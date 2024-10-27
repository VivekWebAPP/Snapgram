import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-quary/quaryAndMutation';
import { toast } from '@/components/ui/use-toast';
import { useAuthUserContext } from '@/context/AuthContext';

const TopBar = () => {
    const { mutateAsync: signOut, isSuccess } = useSignOutAccount();
    const navigate = useNavigate();
    const { user } = useAuthUserContext();

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: 'Logout-successfully',
            });
            navigate('/sign-up');
        }
    }, [isSuccess])

    return (
        <section className='topbar'>
            <div className="flex-between py-4 px-5">
                <Link to='/' className='flex gap-3 items-center'>
                    <img src="/assets/images/logo.svg" alt="logo" width={130} height={325} />
                </Link>
                <div className='flex gap-4'>
                    <Button variant='ghost' className='shad-button_ghost' onClick={() => signOut()}>
                        <img src="/assets/icons/logout.svg" alt="logout" />
                    </Button>
                    <Link to={`/profile/${user.id}`} className='flex-center gap-3'>
                        <img src={user.imageUrl || 'assets/images/profile-placeholder.svg'} alt="profileImage" className='h-8 w-8 rounded-full'/>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default TopBar