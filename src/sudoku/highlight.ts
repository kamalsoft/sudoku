// Priority order: selected > error > same number > peer.
export type Tone = 'selected' | 'error' | 'same' | 'peer' | 'none';

const row = (i: number) => Math.floor(i / 9);
const col = (i: number) => i % 9;
const box = (i: number) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3);

// Whether `digit` could still go in this cell: it is empty and no cell in its row, column or block holds the digit.
export function canPlaceDigit(values: number[], index: number, digit: number): boolean {
  if (values[index] !== 0) return false;
  return !values.some((v, i) => v === digit && i !== index && (row(i) === row(index) || col(i) === col(index) || box(i) === box(index)));
}

export function cellTone(values: number[], errors: boolean[], selected: number | null, index: number): Tone {
  if (selected === null) return 'none';
  if (index === selected) return 'selected';
  if (errors[index]) return 'error';
  const selectedValue = values[selected];
  if (selectedValue && values[index] === selectedValue) return 'same';
  if (row(index) === row(selected) || col(index) === col(selected) || box(index) === box(selected)) return 'peer';
  return 'none';
}
