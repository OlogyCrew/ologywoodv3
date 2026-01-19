import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Calendar, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SUBSCRIPTION_PRODUCTS } from "../../../shared/products";

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: subscription, refetch: refetchSubscription, isLoading } = trpc.subscription.getMy.useQuery(
    undefined,
    { retry: false }
  );
  const { data: stripeStatus } = trpc.subscription.getStatus.useQuery(
    undefined,
    { retry: false }
  );

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.open(data.checkoutUrl, '_blank');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const cancelSubscription = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      toast.success("Subscription will be canceled at the end of the billing period");
      refetchSubscription();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const reactivateSubscription = trpc.subscription.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Subscription reactivated successfully");
      refetchSubscription();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate subscription");
    },
  });

  const handleSubscribe = () => {
    const origin = window.location.origin;
    createCheckout.mutate({
      successUrl: `${origin}/subscription?success=true`,
      cancelUrl: `${origin}/subscription?canceled=true`,
    });
  };

  const product = SUBSCRIPTION_PRODUCTS.ARTIST_BASIC;
  const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = stripeStatus?.cancelAtPeriodEnd;

  if (!isAuthenticated || user?.role !== 'artist') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Artist Subscription Required</CardTitle>
            <CardDescription>
              You need to be logged in as an artist to manage subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/role-selection")} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your Ologywood artist subscription
            </p>
          </div>

          {/* Current Subscription Status */}
          {hasActiveSubscription && (
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Your Active Subscription</CardTitle>
                    <CardDescription>Manage your subscription settings</CardDescription>
                  </div>
                  <Badge variant={isTrialing ? "secondary" : "default"} className="text-base py-1 px-3">
                    {isTrialing ? "Trial Active" : "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <p className="text-xl font-bold">{product.name}</p>
                    </div>
                    <p className="text-lg text-primary font-semibold">
                      ${(product.priceMonthly / 100).toFixed(2)}/month
                    </p>
                  </div>
                  
                  {stripeStatus?.currentPeriodEnd && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isCanceled ? "Expires" : isTrialing ? "Trial Ends" : "Next Billing"}
                      </p>
                      <p className="text-xl font-bold">
                        {new Date(stripeStatus.currentPeriodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isCanceled ? "Cancellation date" : isTrialing ? "Trial period" : "Billing cycle"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-xl font-bold capitalize">
                      {isCanceled ? "Canceling" : isTrialing ? "On Trial" : "Active"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isCanceled ? "Ends soon" : isTrialing ? "No charges yet" : "Recurring"}
                    </p>
                  </div>
                </div>

                {/* Status Alerts */}
                {isTrialing && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Free Trial Active</p>
                      <p className="text-sm text-blue-800 mt-1">
                        You are currently in your {product.trialDays}-day free trial. No charges will be applied until the trial period ends.
                      </p>
                    </div>
                  </div>
                )}

                {isCanceled && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">Cancellation Pending</p>
                      <p className="text-sm text-orange-800 mt-1">
                        Your subscription will end on {new Date(stripeStatus?.currentPeriodEnd || '').toLocaleDateString()}. You can reactivate your subscription anytime.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 flex-wrap">
                  {isCanceled ? (
                    <Button
                      size="lg"
                      onClick={() => reactivateSubscription.mutate()}
                      disabled={reactivateSubscription.isPending}
                      className="flex-1 md:flex-none"
                    >
                      {reactivateSubscription.isPending ? "Reactivating..." : "Reactivate Subscription"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={() => navigate("/pricing")}
                        className="flex-1"
                      >
                        Upgrade to Premium
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => cancelSubscription.mutate()}
                        disabled={cancelSubscription.isPending}
                      >
                        {cancelSubscription.isPending ? "Canceling..." : "Cancel Subscription"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Subscription - Offer Plan */}
          {!hasActiveSubscription && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      ${(product.priceMonthly / 100).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium">
                    🎉 {product.trialDays}-day free trial included!
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Try Ologywood risk-free. Cancel anytime during the trial period.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Creating checkout..." : "Start Free Trial"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By subscribing, you agree to our terms of service and privacy policy.
                  You can cancel anytime.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Features Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>
                Everything you need to manage your bookings and grow your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
