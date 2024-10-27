import { Account, Databases, Client, Storage, Avatars } from 'appwrite';

export const appwriteconfig = {
    projectID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    databaseID: import.meta.env.VITE_APPWRITE_Database_ID,
    storageID: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    usersID: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    postID: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    savesID: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
}

export const client = new Client();
client.setProject(appwriteconfig.projectID);
client.setEndpoint(appwriteconfig.endpoint);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);