import { useAuthUserContext } from "@/context/AuthContext";
import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-quary/quaryAndMutation"
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite"
import React, { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatsProps = {
    post?: Models.Document,
    userId: string,
}

const PostsStats = ({ post, userId }: PostStatsProps) => {

    const likedList = post?.likes.map((user: Models.Document) => user.$id);

    const [likes, setlikes] = useState(likedList);

    const [isSaved, setisSaved] = useState(false);

    const { mutate: likePost } = useLikePost();

    const { mutate: savePost, isPending: isSavingPost } = useSavePost();

    const { mutate: deletePost, isPending: isDeletingPost } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();

    const savedPost = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

    useEffect(() => {
        setisSaved(savedPost ? true : false);
    }, [currentUser])

    const handleLikePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newLikes = [...likes];

        const hasLiked = newLikes.includes(userId);

        if (hasLiked) {
            newLikes = newLikes.filter((id) => id !== userId);
        }
        else {
            newLikes.push(userId);
        }

        setlikes(newLikes);
        likePost({ postId: post?.$id || '', likedArray: newLikes });
    }

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (savedPost) {
            setisSaved(false);
            deletePost(savedPost.$id);
        } else {
            setisSaved(true);
            savePost({ postId: post?.$id || '', userId });
        }
    }

    return (
        <div className="flex justify-between items-center z-20">
            <div className="flex gap-2 mr-5">
                <img src={checkIsLiked(likedList, userId) ? '/assets/icons/liked.svg' : '/assets/icons/like.svg'} alt="like" width={20} height={20} onClick={handleLikePost} className="cursor-pointer" />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>
            <div className="flex gap-2">
                {isSavingPost || isDeletingPost ? <Loader /> : <img src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'} alt="like" width={20} height={20} onClick={handleSavePost} className="cursor-pointer" />}
            </div>
        </div>
    )
}

export default PostsStats
