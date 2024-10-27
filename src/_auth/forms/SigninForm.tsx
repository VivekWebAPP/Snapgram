import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { siginFormSchema } from '../../lib/validation/index.ts';
import { Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCreateNewUserAccount, useSignAccount } from "@/lib/react-quary/quaryAndMutation.ts";
import { useAuthUserContext } from "@/context/AuthContext.tsx";


const SigninForm = () => {

  const { toast } = useToast();
  const form = useForm<z.infer<typeof siginFormSchema>>({
    resolver: zodResolver(siginFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });
  const { mutateAsync: createNewUserAccount, isPending: isCreating } = useCreateNewUserAccount();
  const { mutateAsync: signUserSession, isPending: isSigning } = useSignAccount();
  const { checkIfAuthenticated, isLoading: userLoading } = useAuthUserContext();
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof siginFormSchema>) {
    const newUser = await createNewUserAccount(values);
    if (!newUser) {
      return toast({
        title: 'Sigin Failed Please Re-Enter The Details',
      });
    }
    const user: {
      email: string,
      password: string,
    } = {
      email: values.email,
      password: values.password
    }

    const session = await signUserSession(user);
    if (!session) {
      return toast({
        title: 'Sigin Failed Please Re-Enter The Details',
      });
    }

    const isLoggedIn = await checkIfAuthenticated();
    if (!isLoggedIn) {
      return toast({
        title: 'Sigin Failed Please Re-Enter The Details',
      })
    }
    else {
      form.reset();
      toast({
        title: 'Sign-in Successfull',
      })
      navigate('/sign-up');
    }

    return newUser;
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">To use Snapgram please enter your details</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-5 mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" placeholder="shadcn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" placeholder="shadcn@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {
              isCreating ? (
                <div className="flex-center gap-2">
                  <Loader />
                </div>
              ) : (
                "Sign-in"
              )
            }
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account? <Link to="/sign-up" className="text-primary-500 text-small-semibold mt-1">Login</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SigninForm;
