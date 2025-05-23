export function PropertyCard({ title, price }: { title: string; price: number }) {
  return (
    <div role="article" aria-label={`${title}, $${price} per month`} className="rounded p-2">
      <h3 className="text-xl font-bold">{title}</h3>
      <p>${price}/month</p>
    </div>
  )
}
