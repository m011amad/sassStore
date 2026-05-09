import Link from 'next/link'
import { ShoppingBag, Zap, CreditCard, BarChart3, Globe, Lock, Check, ArrowUpRight } from 'lucide-react'

const demos = [
  {
    name: 'Grocery Store',
    description: 'Fresh produce, pantry staples, and daily essentials.',
    tenant: 'grocery',
    emoji: '🛒',
  },
  {
    name: 'Test Store',
    description: 'General merchandise — browse the full storefront experience.',
    tenant: 'test-store',
    emoji: '🏪',
  },
]

const features = [
  {
    icon: ShoppingBag,
    title: 'Your store, your brand',
    description: 'Custom storefront with your logo, colours, and domain. Launch looking professional from day one.',
  },
  {
    icon: Zap,
    title: 'Live in minutes',
    description: 'Add products, connect Stripe, and start selling. No code, no hosting headaches.',
  },
  {
    icon: CreditCard,
    title: 'Payments built in',
    description: 'Accept cards, Apple Pay, Google Pay, and more. Payouts go straight to your bank account.',
  },
  {
    icon: BarChart3,
    title: 'Real-time dashboard',
    description: 'Track revenue, orders, and customers from one clean overview. Know your numbers at a glance.',
  },
  {
    icon: Globe,
    title: 'Custom domain',
    description: 'Bring your own domain or use a free subdomain. Your store works anywhere.',
  },
  {
    icon: Lock,
    title: 'Secure by default',
    description: 'SSL everywhere, Stripe-verified payments, rate limiting on every endpoint.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Everything you need to get started.',
    features: ['Unlimited products', 'Stripe payments', 'Custom subdomain', 'Order management', 'Customer dashboard'],
    cta: 'Start for free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For stores that are ready to grow.',
    features: ['Everything in Free', 'Custom domain', 'Priority support', 'Advanced analytics', 'Remove branding'],
    cta: 'Start free trial',
    href: '/signup',
    highlight: true,
  },
]

export default function PlatformHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-5 text-primary" />
            Digital Market
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-24 pb-20 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Zap className="size-3" />
            Launch your store today — no code required
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Sell online with
            <span className="text-primary"> Digital Market</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Everything you need to launch a beautiful online store — products, payments, orders, and customers — all in one place.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors sm:w-auto"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border px-8 py-3 text-sm font-semibold hover:bg-muted transition-colors sm:w-auto"
            >
              Sign in to dashboard
            </Link>
          </div>
        </section>

        {/* Demo stores */}
        <section className="border-t py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight">See it in action</h2>
              <p className="mt-2 text-sm text-muted-foreground">Browse live demo stores built on Digital Market.</p>
            </div>
            <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
              {demos.map((demo) => (
                <a
                  key={demo.tenant}
                  href={`/?_tenant=${demo.tenant}`}
                  className="group flex items-start gap-4 rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <span className="text-3xl">{demo.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{demo.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{demo.description}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Everything your store needs</h2>
              <p className="mt-3 text-muted-foreground">Built for independent sellers who want to move fast.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border bg-card p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
              <p className="mt-3 text-muted-foreground">Start free. Upgrade when you&apos;re ready.</p>
            </div>
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 ${plan.highlight ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card'}`}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className={`size-4 shrink-0 ${plan.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`mt-8 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="size-4 text-primary" />
            Digital Market
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Digital Market. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
