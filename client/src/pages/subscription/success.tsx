import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  return (
    <div className="container py-16 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing. Your premium features are now activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You now have access to advanced dropshipping automation features including
            automated price optimization, competitor tracking, and AI-powered tools.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/settings/subscription">
            <Button variant="outline" className="w-full">Manage Subscription</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}