"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Separator, Input, Label } from "@the-nexcom/ui"
import { Github, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginCard() {

  const router = useRouter()

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <div className="grid md:grid-cols-2">
        {/* Left column: Email and Password */}
        <div className="p-6 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Enter your email and password to login</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="p-0">
            <Button className="w-full">Login</Button>
          </CardFooter>
        </div>

        {/* Right column: Social logins */}
        <div className="p-6 space-y-6 bg-muted rounded-r-lg flex flex-col justify-center">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold">Social Login</CardTitle>
            <CardDescription>Login using your social accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <Button variant="outline" className="w-full"
              onClick={() =>
                typeof window !== "undefined" &&
                window.location.replace("/api/auth/google/login")
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Login with GitHub
            </Button>
          </CardContent>
          <Separator />
          <CardFooter className="p-0 text-sm text-center">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline ml-1">
              Sign up
            </a>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

