import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form'

export default function AcceptInvitationPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Accept Invitation</h1>
        <p className="text-gray-500">Join an organization</p>
      </div>
      <AcceptInvitationForm />
    </div>
  )
}

