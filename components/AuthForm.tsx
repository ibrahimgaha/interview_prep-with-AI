"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";



const authFormSchema = (type : FormType) => {
    return z.object({
        name :type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email : z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters long"),

    })
}

const AuthForm = ({ type }: {type:FormType}) => {
    const formSchema = authFormSchema(type);
    const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
  
    try {
      if (type === "sign-up") {
        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");
      } else if (type === "sign-in") {
         toast.success("Signed in successfully!");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again later.");
    }
    console.log(values);
  }

  const isSignIn = type === "sign-in";

return (
  <div className="card-border lg:min-w-[566px]">
    <div className="flex flex-col gap-6 card py-14 px-10">
      <div className="flex flex-row gap-2 justify-center">
        <Image src="/logo.svg" alt="logo" height={32} width={38} />
        <h2 className="text-primary-100">TalentForge</h2>
      </div>

      <h3>Practice job interviews with AI</h3>

   <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full mt-4 form">
    {!isSignIn && (
      <FormField
        control={form.control}
        name="name"
        label="Name"
        placeholder="Your Name"
      />
    )}

    <FormField
      control={form.control}
      name="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
    />

    <FormField
      control={form.control}
      name="password"
      label="Password"
      type="password"
      placeholder="Enter your password"
    />

    <Button type="submit" className="btn">
      {isSignIn ? "Sign In" : "Create an account"}
    </Button>
  </form>
</Form>


     <p className="text-center">
  {isSignIn ? "Don't have an account?" : "Already have an account?"}
  <span className="ml-1 font-bold text-user-primary">
    <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
      {isSignIn ? "Sign Up" : "Sign In"}
    </Link>
  </span>
</p>
    </div>
  </div>
);
}

export default AuthForm;
