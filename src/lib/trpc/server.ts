import { createClient } from '@/lib/supabase/server'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type Context = {
  supabase: SupabaseClient
  user: Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

