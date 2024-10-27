import { useAuthUserContext } from "@/context/AuthContext"
import { Models } from "appwrite"
import { Link } from "react-router-dom";
import PostsStats from "./PostsStats";

type gridPostProp = {
    posts: Models.Document[],
    showUser: Boolean,
    showStats: Boolean,
}

const GridPostList = ({ posts, showUser = true, showStats = true }: gridPostProp) => {
    const { user } = useAuthUserContext();

    return (
        <ul className="grid-container">
            {posts.map((post) => (
                <li key={post.$id} className="relative min-w-80 h-80">
                    <Link to={`/posts/${post.$id}`} className="grid-post_link">
                        <img src={post.imageURL} alt="post_image" className="w-full h-full object-cover" />
                    </Link>
                    <div className="grid-post_user">
                        {showUser && (
                            <div className="flex items-center justify-start gap-2 flex-1">
                                <img src={post.creator.imageUrl} alt="profile" className="h-8 w-8 rounded-full" />
                                <p className="line-clamp-1">{post.creator.name}</p>
                            </div>
                        )}
                        {
                            showStats && <PostsStats post={post} userId={user.id} />
                        }
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default GridPostList