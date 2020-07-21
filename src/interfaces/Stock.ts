import Trade from "interfaces/Trade";

export interface Stock {
  name: number;
  code: string;

  price: number;
  percent: number;

  unit: number;
  cost: number;
  volume: number;

  trades: Trade[];
}

export default Stock;
