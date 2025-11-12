export default function BookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Booking Details</h1>
      <div className="rounded-lg border bg-white p-6">
        <p className="text-gray-500">Booking {params.id} details will be displayed here</p>
      </div>
    </div>
  )
}

