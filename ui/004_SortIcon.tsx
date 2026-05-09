import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

/**
 * SortIcon — column sort direction indicator.
 * Shows a neutral double-arrow when inactive, or an up/down
 * arrow in the accent color when the column is the active sort key.
 */
export function SortIcon({
  col,
  activeCol,
  direction,
  activeColor = "text-[#ff6b2b]",
}: {
  col: string;
  activeCol: string;
  direction: "asc" | "desc";
  activeColor?: string;
}) {
  if (activeCol !== col)
    return <ArrowUpDown className="size-3 inline ml-1 opacity-40" />;

  return direction === "desc" ? (
    <ArrowDown className={`size-3 inline ml-1 ${activeColor}`} />
  ) : (
    <ArrowUp className={`size-3 inline ml-1 ${activeColor}`} />
  );
}
