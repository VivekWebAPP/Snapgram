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
import { signupFormSchema } from '../../lib/validation/index.ts';
import { Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSignUpAccount } from "@/lib/react-quary/quaryAndMutation.ts";
import { useAuthUserContext } from "@/context/AuthContext.tsx";


const SignupForm = () => {

  const { toast } = useToast();
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { mutateAsync: signUserSession, isPending: isSigning } = useSignUpAccount();
  const { checkIfAuthenticated, isLoading: userLoading } = useAuthUserContext();
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
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
        title: 'Sign-up Failed Please Re-Enter The Details',
      });
    }

    const isLoggedIn = await checkIfAuthenticated();
    // console.log('Checking if the user is logged in',isLoggedIn);
    if (!isLoggedIn) {
      return toast({
        title: 'Sign-up Failed Please Re-Enter The Details',
      })
    }
    else {
      form.reset();
      toast({
        title: 'Sign-up Successfull',
      })
      navigate('/');
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">Welcome back! Please Enter Your Details</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-5 mt-4">
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
              isSigning ? (
                <div className="flex-center gap-2">
                  <Loader />
                </div>
              ) : (
                "Sign-up"
              )
            }
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account? <Link to="/sign-in" className="text-primary-500 text-small-semibold mt-1">Sign-in</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignupForm;
