import React from 'react';
import { Seat } from '../../types';
import { SeatGrid } from './SeatGrid';

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  basePrice: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  basePrice,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <SeatGrid
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={onToggleSeat}
        basePrice={basePrice}
      />
    </div>
  );
};
