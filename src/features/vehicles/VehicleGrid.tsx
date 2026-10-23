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
      className={`vehicle-grid ${stale ? 'opacity-70' : ''}`}
      aria-busy={stale}
    >
      {items.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onOpen={onOpen} />
      ))}
    </div>
  )
}
