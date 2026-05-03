import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateStoreSettings } from '@/app/actions/settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BillingButton } from '@/components/dashboard/billing-button'
import { ColorInput } from '@/components/dashboard/color-input'
import type { MerchantBranding } from '@/types'

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
              <span className="text-sm text-muted-foreground">.your-platform.com</span>
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

          <div className="space-y-1">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              defaultValue={branding.logoUrl ?? ''}
              placeholder="https://example.com/logo.png"
            />
          </div>
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
