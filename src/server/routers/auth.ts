import { router, publicProcedure, protectedProcedure } from '@/lib/trpc/server'
import { z } from 'zod'

export const authRouter = router({
  getSession: protectedProcedure.query(async ({ ctx }) => {
    const { data: { session } } = await ctx.supabase.auth.getSession()
    return session
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),
})

