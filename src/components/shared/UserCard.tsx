import { Models } from 'appwrite'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

type users = {
  user: Models.Document,
}

const UserCard = ({ user }:users) => {
  return (
    <Link to={`/profile/${user.$id}`} className='user-card'>
      <img src={user.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="logo Image" className='rounded-full w-14 h-14'/>
      <div className='flex-center flex-col gap-1'>
        <p className='base-medium text-light-1 text-center line-clamp-1'>{user.name}</p>
        <p className='base-small text-light-1 text-center'>@{user.username}</p>
      </div>
      <Button type='button' size='sm' className='shad-button_primary px-5'>
        Follow
      </Button>
    </Link>
  )
}

export default UserCard