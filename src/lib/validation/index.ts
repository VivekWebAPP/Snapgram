import { z } from "zod";

export const siginFormSchema = z.object({
    name: z.string().min(5, {
        message: "name must be at least 5 characters",
    }),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email(),
    password: z.string().min(5, {
        message: "password must be at least 5 characters long",
    })
});

export const signupFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5, {
        message: "password must be at least 5 characters long",
    })
});

export const postValidation = z.object({
    caption: z.string().min(5).max(2200, {
        message: "caption must be at least 5 character long",
    }),
    file: z.custom<File[]>(),
    location: z.string().min(2).max(100),
    tags: z.string().min(5).max(2200),
});

export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string().min(5, {
        message: "name must be at least 5 characters",
    }),
    username: z.string().min(5, {
        message: "username must be at least 5 characters"
    }),
    email: z.string().email(),
    bio: z.string().min(5, {
        message: "bio must be at least 5 characters",
    }),
});