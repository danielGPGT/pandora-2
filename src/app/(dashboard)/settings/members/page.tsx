'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/lib/hooks/use-organization'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { InviteMemberDialog } from '@/components/organization/invite-member-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function MembersPage() {
  const { currentOrg } = useOrganization()
  const { can } = usePermissions()

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null

      const supabase = createClient()
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          user:users (
            id,
            email
          )
        `)
        .eq('organization_id', currentOrg.id)

      if (error) throw error
      return data
    },
    enabled: !!currentOrg,
  })

  if (!currentOrg) {
    return <div>No organization selected</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-600">Manage organization members</p>
        </div>
        {can('members:manage') && <InviteMemberDialog />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>View and manage members of {currentOrg.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

