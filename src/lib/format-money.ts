const takaFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 2,
});

export function formatMoney(value: number) {
  return `৳${takaFormatter.format(value)}`;
}
