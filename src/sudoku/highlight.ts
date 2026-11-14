// Priority order: selected > error > same number > peer.
export type Tone = 'selected' | 'error' | 'same' | 'peer' | 'none';

const row = (i: number) => Math.floor(i / 9);
const col = (i: number) => i % 9;
const box = (i: number) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3);

export function cellTone(values: number[], conflicts: boolean[], selected: number | null, index: number): Tone {
  if (selected === null) return 'none';
  if (index === selected) return 'selected';
  if (conflicts[index]) return 'error';
  const selectedValue = values[selected];
  if (selectedValue && values[index] === selectedValue) return 'same';
  if (row(index) === row(selected) || col(index) === col(selected) || box(index) === box(selected)) return 'peer';
  return 'none';
}
