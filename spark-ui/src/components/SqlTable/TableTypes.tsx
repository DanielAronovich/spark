export type Order = "asc" | "desc";

export interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => void;
  order: Order;
  orderBy: string;
}

export interface Data {
  id: string;
  status: string;
  description: string;
  duration: number;
  durationPercentage: number;
  coreHour: number;
  coreHourPercentage: number;
  activityRate: number;
  input: number;
  output: number;
}

export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}
