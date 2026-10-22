import type { Vehicle } from '../../types/mbta.ts'
import { VehicleCard } from './VehicleCard.tsx'

type Props = {
  items: Vehicle[]
  stale: boolean
  onOpen: (id: string) => void
}

export function VehicleGrid({ items, stale, onOpen }: Props) {
  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${stale ? 'opacity-70' : ''}`}
      aria-busy={stale}
    >
      {items.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onOpen={onOpen} />
      ))}
    </div>
  )
}
