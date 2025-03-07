export type IContextType = {
    user:IUser;
    isLoading:boolean;
    setUser:React.Dispatch<React.SetStateAction<IUser>>;
    isAuthenticated:boolean;
    setIsAuthenticated:React.Dispatch<React.SetStateAction<boolean>>;
    checkIfAuthenticated:() => Promise<boolean>;
}

export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
};

export type IUpdateUser = {
    imageURL: any;
    imageID: any;
    postId(databaseID: any, postID: any, postId: any, arg3: { name: string; username: any; email: any; bio: string; imageURL: any; imageID: any; }): unknown;
    username: any;
    email: any;
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
};

export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
};

export type IUpdatePost = {
    postId: string;
    caption: string;
    imageID: string;
    imageURL: URL;
    file: File[];
    location?: string;
    tags?: string;
};

export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
};


export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
};