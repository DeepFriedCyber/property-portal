import Image from 'next/image'

export function PropertyCard({ image, title }: { image: string; title: string }) {
  return (
    <div className="rounded shadow overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <h3 className="p-2 text-xl font-bold">{title}</h3>
    </div>
  )
}
