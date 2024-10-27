import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '../../types/index.ts';
import { account, appwriteconfig, avatars, databases, storage } from './config.ts';
import { AppwriteException, ID, Query } from 'appwrite';

export const createNewUserAccount = async (user: INewUser) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        );

        if (!newAccount) {
            throw new Error('User Not Created');
        }

        const avatarsUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarsUrl
        });

        return newUser;
    } catch (error) {
        console.log('Error Message', error);
        return error;
    }
}

export const saveUserToDB = async (user: {
    accountId: string;
    name: string;
    email: string;
    username?: string;
    imageUrl: URL;
}) => {
    try {
        console.log('Attempting to save user to database:', user);

        const savedUser = await databases.createDocument(
            appwriteconfig.databaseID,
            appwriteconfig.usersID,
            ID.unique(),
            user
        );

        if (!savedUser) {
            console.error('User was not saved to the database. No document returned.');
            throw new Error('User save failed.');
        }

        console.log('User successfully saved to the database:', savedUser);

        return savedUser;

    } catch (error) {
        console.error('Error occurred while saving user to the database:', error);
        throw error; // Throw the error to propagate it to the calling function
    }
}


export const signUserAccount = async (user: { email: string; password: string; }) => {
    try {
        try {
            const sessions = await account.listSessions();
            if (sessions.sessions.length !== 0) {
                for (const session of sessions.sessions) {
                    await account.deleteSession(session.$id);
                }
            }
        } catch (error) {
            console.log('Error manually deleting sessions:', error);
        }
        const session = await account.createEmailPasswordSession(user.email, user.password);
        if (!session) {
            throw new Error('Invalid Email or Password');
        }
        return session;
    } catch (error) {
        console.log(error);
        return error;
    }
};


export const signUpUserAccount = async (user: { email: string; password: string; }) => {
    try {
        try {
            const sessions = await account.listSessions();
            if (sessions.sessions.length !== 0) {
                for (const session of sessions.sessions) {
                    await account.deleteSession(session.$id);
                }
            }
        } catch (error) {
            console.log('Error manually deleting sessions:', error);
        }

        const signInUser = await account.createEmailPasswordSession(user.email, user.password);

        if (signInUser) {
            return signInUser;
        } else {
            throw new Error('Failed to create session');
        }

    } catch (error) {

        if (error instanceof AppwriteException) {
            if (error.message.includes('User (role: guests) missing scope (account)')) {
                return error;
            }
        }

        return error;
    }
};



export const getCurrentUser = async () => {
    try {
        // Fetch the currently authenticated user from the Appwrite account service
        const currentUser = await account.get();
        if (!currentUser) {
            throw new Error('No authenticated user found.');
        }

        // Log the current user ID to debug
        console.log('Current User ID:', currentUser.$id);

        // Fetch the user's details from the database using the accountId
        const getCurrentUserDetails = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.usersID,
            [Query.equal('accountId', currentUser.$id)]
        );

        if (!getCurrentUserDetails.total) {
            throw new Error('No user details found in the database for the current user.');
        }

        // Return the first document containing the user details
        return getCurrentUserDetails.documents[0];

    } catch (error) {
        console.error('Error fetching current user details:', error);
        return null; // Return null or a suitable value when an error occurs
    }
};


export const signOutUserAccount = async () => {
    try {
        console.log('Attempting to delete session...');
        const session = await account.deleteSession('current');
        console.log('Session deleted:', session);

        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        if (!session) {
            throw new Error('Failed to delete session');
        }
        return session;
    } catch (error) {
        console.log('Error during logout:', error);
    }

}

export const createNewPost = async (post: INewPost) => {
    try {
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw new Error("File upload failed");

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        console.log(fileUrl);

        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to get file URL");
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];
        console.log(fileUrl);

        // Create post
        const newPost = await databases.createDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageURL: fileUrl,
                imageID: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to create new post");
        }

        return newPost;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};


export function uploadFile(file: File) {
    try {
        const uploadedFile = storage.createFile(
            appwriteconfig.storageID,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteconfig.storageID,
            fileId,
            2000,
            2000,
            "top",
            100
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteconfig.storageID, fileId);

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export const getRecentPosts = async () => {
    const posts = await databases.listDocuments(
        appwriteconfig.databaseID,
        appwriteconfig.postID,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    );

    if (!posts) {
        throw new Error('Error In Retriving Posts')
    }

    return posts;
}


export const likePost = async (postId: string, likedArray: string[]) => {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            postId,
            {
                likes: likedArray,
            }
        );
        if (!updatedPost) {
            throw new Error();
        }
        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export const savePost = async (postId: String, userId: String) => {
    try {
        const savesPost = await databases.createDocument(
            appwriteconfig.databaseID,
            appwriteconfig.savesID,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        );

        if (!savesPost) {
            throw new Error("Document creation failed");
        }

        return savesPost;

    } catch (error: any) {
        console.error("Error saving post:", error.message || error);
    }
}

export const deleteSavedPost = async (savedRecordId: string) => {
    try {
        const deletePost = await databases.deleteDocument(
            appwriteconfig.databaseID,
            appwriteconfig.savesID,
            savedRecordId,
        );
        if (!deletePost) {
            throw new Error();
        }
        return { status: 'Ok' };
    } catch (error) {
        console.log(error);
    }
}

export const getPostById = async (postId: string) => {
    try {
        const post = await databases.getDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            postId,
        );

        return post;

    } catch (error) {
        console.log(error);
    }
}

export const updatePost = async (post: IUpdatePost) => {
    const hasFileToUpdate = post.file.length > 0;
    try {
        let image = {
            imageURL: post.imageURL,
            imageID: post.imageID,
        };

        if (hasFileToUpdate) {
            // Upload file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);

            if (!uploadedFile) throw new Error("File upload failed");

            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            console.log(fileUrl);

            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw new Error("Failed to get file URL");
            }

            image = { ...image, imageURL: fileUrl, imageID: uploadedFile.$id };

        }

        const tags = post.tags?.replace(/ /g, "").split(",") || [];
        // Create post
        const newPost = await databases.updateDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            post.postId,
            {
                caption: post.caption,
                imageURL: image.imageURL,
                imageID: image.imageID,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(post.imageID);
            throw new Error("Failed to create new post");
        }

        return newPost;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
}

export const deletePost = async (postId: string, imageId: string) => {
    try {
        if (!postId || !imageId) throw new Error;

        await databases.deleteDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            postId,
        );
        return { status: 'ok' };
    } catch (error) {
        console.log(error);
    }
}

export const getInfinitPost = async ({ pageParam }: { pageParam: number }) => {
    const query: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];
    if (pageParam) {
        query.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            query,
        )
        if (!posts) {
            throw new Error()
        }
        return posts;
    } catch (error) {
        console.log(error);
    }
}

export const searchPost = async (searchTerm: string) => {
    try {
        const posts = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            [Query.search('caption', searchTerm)],
        )

        if (!posts) {
            throw new Error();
        }

        return posts;
    } catch (error) {
        console.log(error);
    }
}

export const getInfiniteUsers = async ({ pageParam }: { pageParam: number }) => {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(1)];
    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const users = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            queries,
        )

        if (!users) {
            throw new Error();
        }

        return users;

    } catch (error) {
        console.log(error);
    }
}

export const getUser = async (limit?: number) => {
    try {
        const queries = [Query.orderDesc('$createdAt')];

        if (limit) {
            queries.push(Query.limit(limit))
        }

        const users = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.usersID,
            queries,
        );

        if (!users) {
            throw new Error();
        }

        return users;

    } catch (error) {
        console.log(error);
    }
}

export const getSavedPost = async () => {
    try {
        const savedPost = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.savesID,
        );

        if (!savedPost) {
            throw new Error();
        }

        return savedPost;
    } catch (error) {
        console.log(error);
    }
}

export const updateUserProfile = async (user: IUpdateUser) => {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageURL: user.imageURL,
            imageID: user.imageID,
        };

        if (hasFileToUpdate) {
            // Upload file to appwrite storage
            const uploadedFile = await uploadFile(user.file[0]);

            if (!uploadedFile) throw new Error("File upload failed");

            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            console.log(fileUrl);

            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw new Error("Failed to get file URL");
            }

            image = { ...image, imageURL: fileUrl, imageID: uploadedFile.$id };

        }
        // Create post
        const updatedProfile = await databases.updateDocument(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            user.userId,
            {
                name: user.name,
                username: user.username,
                bio: user.bio || "",
                imageURL: image.imageURL,
                imageID: image.imageID,
            }
        );

        if (!updatedProfile) {
            if (hasFileToUpdate) {
                await deleteFile(image.imageID);
            }
            throw new Error("Failed to create new post");
        }

        return updatedProfile;
    } catch (error) {
        console.log(error);
    }
}

export const getUserById = async (userId: string) => {
    try {
        const user = await databases.getDocument(
            appwriteconfig.databaseID,
            appwriteconfig.usersID,
            userId,
        );

        if (!user) {
            throw new Error();
        }

        return user;
    } catch (error) {
        console.log(error);
    }

}

export const moreRelatedPosts = async (userId: string) => {
    try {
        const user = await databases.listDocuments(
            appwriteconfig.databaseID,
            appwriteconfig.postID,
            [Query.equal('creator',userId),Query.orderDesc('$createdAt')],
        );
        if(!user){
            throw new Error();
        }
        return user;
    } catch (error) {
        console.log(error);
    }
}