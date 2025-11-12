import { create } from 'zustand'

interface BookingState {
  // Add booking-related state here
}

export const useBookingStore = create<BookingState>(() => ({}))

