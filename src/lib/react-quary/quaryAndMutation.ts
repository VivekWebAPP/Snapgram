import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types';
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createNewUserAccount, signOutUserAccount, signUpUserAccount, signUserAccount, createNewPost, getRecentPosts, likePost, savePost, deleteSavedPost, getCurrentUser, getPostById, updatePost, deletePost, getInfinitPost, searchPost, getInfiniteUsers, getUser, getSavedPost, updateUserProfile, getUserById, getUserProfile, moreRelatedPosts } from '../appwrite/api';
import { QUERY_KEYS } from './quaryKeys';
import { number } from 'zod';

export const useCreateNewUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createNewUserAccount(user),
    })
}

export const useSignAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string;
        }) => signUserAccount(user),
    })
}

export const useSignUpAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string,
            password: string,
        }) => signUpUserAccount(user),
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: () => signOutUserAccount(),
    });
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: INewPost) => createNewPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            })
        }
    });
};

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, likedArray }: { postId: string; likedArray: string[] }) => likePost(postId, likedArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, userId }: { postId: String; userId: String }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    })
}

export const useGetPostByID = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.$id],
            })
        }
    })
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) => deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetPost = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitPost,
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.documents.length == 0) {
                return null;
            }
            const lastId = lastPage?.documents[lastPage?.documents.length - 1].$id;
            return lastId
        }
    })
}

export const useSearchPost = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS, searchTerm],
        queryFn: () => searchPost(searchTerm),
        enabled: !!searchTerm,
    })
}

export const useGetUsers = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfiniteUsers as any,
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.documents.length === 0) {
                return null;
            }

            const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
            return lastId;
        },
    });
};

export const useGetTopUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUser(limit),
    });
}

export const useGetSavedPost = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POSTS],
        queryFn: getSavedPost,
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUserProfile(user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
            });
        },
    })
}

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    })
}

export const useGetMoreRelatedPost = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: () => moreRelatedPosts(userId),
        enabled: !!userId,
    });
}