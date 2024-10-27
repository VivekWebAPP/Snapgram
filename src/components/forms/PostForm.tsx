import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { postValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useAuthUserContext } from "@/context/AuthContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost, useUpdatePost } from "@/lib/react-quary/quaryAndMutation"

type PostFormProps = {
    post?: Models.Document;
    action: 'Create' | 'Update';
}

const PostForm = ({ post, action }: PostFormProps) => {
    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
    const { mutateAsync: updatePost, isPending: isUpdatingPost } = useUpdatePost();
    const { user } = useAuthUserContext();
    const { toast } = useToast();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof postValidation>>({
        resolver: zodResolver(postValidation),
        defaultValues: {
            caption: post ? post?.caption : "",
            file: [],
            location: post ? post?.location : "",
            tags: post ? post.tags.join(',') : "",
        },
    })

    async function onSubmit(values: z.infer<typeof postValidation>) {
        if(post && action === 'Update'){
            const updatedPost = await updatePost({
                ...values,
                postId: post.$id,
                imageID: post?.imageID,
                imageURL: post?.imageURL,
            });

            if(!updatedPost){
                toast({title:"Please try again"});
            }

            return navigate(`/posts/${post.$id}`);
        }

        const newPost = await createPost({
            ...values,
            userId: user.id,
        });

        if (!newPost) {
            toast({
                title: 'Please try again',
            });
        }
        navigate('/');
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-from_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" placeholder="" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-from_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageURL} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-from_label">Add Location</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-from_label">Add Tags (Seperate by a comma ",")</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" placeholder="Art,Expression,Learn" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button type="button" className="shad-button_dark-4">Cancel</Button>
                    <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingCreate || isUpdatingPost}>{isLoadingCreate || isUpdatingPost && "Loading ..." } {action} Post</Button>
                </div>
            </form>
        </Form>
    )
}

export default PostForm