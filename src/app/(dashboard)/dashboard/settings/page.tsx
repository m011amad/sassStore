import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateStoreSettings } from '@/app/actions/settings'
import { openPayoutsDashboard } from '@/app/actions/connect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BillingButton } from '@/components/dashboard/billing-button'
import { ConnectButton } from '@/components/dashboard/connect-button'
import { ColorInput } from '@/components/dashboard/color-input'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { MerchantBranding } from '@/types'
import { BannerImageManager } from '@/components/dashboard/banner-image-manager'
import { LogoUpload } from '@/components/dashboard/logo-upload'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, subdomain, custom_domain, branding')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/login')

  // stripe_connect_id / stripe_connect_onboarded are new columns — cast to bypass
  // generated types until the SQL migration has been run in Supabase
  const { data: connectData } = (await supabase
    .from('merchants')
    .select('stripe_connect_id, stripe_connect_onboarded')
    .eq('id', merchant.id)
    .single()) as unknown as {
    data: { stripe_connect_id: string | null; stripe_connect_onboarded: boolean } | null
  }

  const branding = (merchant.branding ?? {}) as MerchantBranding

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and branding</p>
      </div>

      <form action={updateStoreSettings} className="space-y-4">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Store Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your store name appears on the storefront and in order emails.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="storeName">Store name</Label>
            <Input
              id="storeName"
              name="storeName"
              defaultValue={branding.storeName ?? ''}
              placeholder={merchant.subdomain}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input id="subdomain" value={merchant.subdomain} disabled className="max-w-xs" />
              <span className="text-sm text-muted-foreground">.digitalmarket.com</span>
            </div>
            <p className="text-xs text-muted-foreground">Subdomain cannot be changed after signup.</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Branding</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize your storefront appearance.
            </p>
          </div>

          <div className="space-y-1">
            <Label>Primary color</Label>
            <ColorInput defaultValue={branding.primaryColor} />
          </div>

          <div className="space-y-1.5">
            <Label>Logo</Label>
            <LogoUpload initialUrl={branding.logoUrl} merchantId={merchant.id} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tagline">Store tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={branding.heroTagline ?? ''}
              placeholder="Fresh groceries delivered daily"
            />
            <p className="text-xs text-muted-foreground">Shown next to your store name in the navigation bar.</p>
          </div>

        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Shop Banner Images</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload images for the carousel shown at the top of your shop page. Recommended 16:9, at least 1200×675px.
            </p>
          </div>
          <BannerImageManager
            initialImages={branding.bannerImages ?? []}
            merchantId={merchant.id}
          />
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Custom Domain</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Point your domain&apos;s CNAME to the platform to activate it.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="customDomain">Domain</Label>
            <Input
              id="customDomain"
              name="customDomain"
              defaultValue={merchant.custom_domain ?? ''}
              placeholder="shop.yourbrand.com"
            />
          </div>
        </div>

        <Button type="submit">Save changes</Button>
      </form>

      {/* Payouts */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Payouts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your bank account to receive payments from your store. The platform retains a 2% fee per transaction.
          </p>
        </div>

        {connectData?.stripe_connect_onboarded ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle className="size-4" />
              Stripe account connected — payouts are active
            </div>
            <form action={openPayoutsDashboard}>
              <Button type="submit" variant="outline">Manage Payouts</Button>
            </form>
          </div>
        ) : connectData?.stripe_connect_id ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
              <AlertCircle className="size-4" />
              Setup incomplete — finish connecting your bank account
            </div>
            <ConnectButton label="Complete Setup" variant="outline" />
          </div>
        ) : (
          <ConnectButton label="Connect Stripe Account" />
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription plan and payment method via the Stripe billing portal.
          </p>
        </div>
        <BillingButton />
      </div>
    </div>
  )
}
