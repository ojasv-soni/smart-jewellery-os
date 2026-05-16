'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Package, Users, BarChart3 } from 'lucide-react'
import { useRequireAuth } from '@/lib/auth-guard'

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoading } = useRequireAuth()
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: 'Welcome to SMART JEWELLERY INVENTORY OS',
      subtitle: 'Manage your jewellery inventory with ease',
      icon: Package,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-foreground">This app helps you:</p>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <Package className="text-primary flex-shrink-0 mt-1" size={20} />
              <span className="text-foreground">Track jewellery inventory with details like weight and purity</span>
            </li>
            <li className="flex gap-3 items-start">
              <Users className="text-primary flex-shrink-0 mt-1" size={20} />
              <span className="text-foreground">Manage your team with role-based access</span>
            </li>
            <li className="flex gap-3 items-start">
              <BarChart3 className="text-primary flex-shrink-0 mt-1" size={20} />
              <span className="text-foreground">Perform audits and track stock movements</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Add Your First Product',
      subtitle: 'Get started by adding your first inventory item',
      icon: Package,
      content: (
        <div className="space-y-4">
          <p className="text-foreground">You'll be able to:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Take photos of jewellery</li>
            <li>✓ Record weight and purity details</li>
            <li>✓ Track quantity and location</li>
            <li>✓ Organize by category</li>
          </ul>
          <button
            onClick={() => router.push('/inventory/add')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition font-semibold mt-6"
          >
            Add First Product
          </button>
        </div>
      ),
    },
    {
      title: 'Invite Your Team',
      subtitle: 'Collaborate with your team members',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-foreground">Team roles:</p>
          <ul className="space-y-3 text-sm">
            <li className="border-l-4 border-primary pl-3">
              <strong>Owner:</strong> Full access, can manage team
            </li>
            <li className="border-l-4 border-secondary pl-3">
              <strong>Admin:</strong> Full access, can manage team
            </li>
            <li className="border-l-4 border-accent pl-3">
              <strong>Employee:</strong> Can add and edit inventory
            </li>
            <li className="border-l-4 border-muted pl-3">
              <strong>Viewer:</strong> Can only view inventory
            </li>
          </ul>
          <button
            onClick={() => router.push('/settings?tab=team')}
            className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 transition font-semibold mt-6"
          >
            Invite Team Members
          </button>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      subtitle: 'Start managing your inventory now',
      icon: Package,
      content: (
        <div className="space-y-4 text-center">
          <div className="bg-green-100 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-5xl mb-2">✓</div>
            <p className="text-foreground font-semibold">Your workspace is ready</p>
          </div>
          <p className="text-muted-foreground">You can always come back to settings to adjust preferences or invite more team members.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      ),
    },
  ]

  const currentStep = steps[step - 1]
  const Icon = currentStep.icon

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-lg text-foreground">Checking your sign-in status...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-primary" size={24} />
            <h1 className="text-2xl font-bold text-foreground">SMART JEWELLERY INVENTORY OS</h1>
          </div>
          <p className="text-muted-foreground">Setup Guide</p>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < step - 1
                    ? 'bg-green-600'
                    : i === step - 1
                      ? 'bg-primary'
                      : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Step {step} of {steps.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Icon className="text-primary" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
              <p className="text-muted-foreground">{currentStep.subtitle}</p>
            </div>
          </div>

          {currentStep.content}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-8 max-w-2xl mx-auto">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-border text-foreground py-3 rounded-lg hover:bg-muted/50 transition font-semibold"
            >
              Back
            </button>
          )}
          {step < steps.length && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
            >
              Next <ArrowRight size={18} />
            </button>
          )}
          {step === steps.length && (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
