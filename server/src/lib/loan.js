export function calculateEmi(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100
  if (!monthlyRate) return principal / months
  const power = (1 + monthlyRate) ** months
  return (principal * monthlyRate * power) / (power - 1)
}

export function buildOffer(lender, amount, tenure, creditScore = 750) {
  const adjustment = creditScore >= 780 ? -0.35 : creditScore >= 730 ? 0 : creditScore >= 680 ? 0.7 : 1.4
  const annualRate = Math.max(8.5, Number(lender.baseRate) + adjustment)
  const emi = calculateEmi(amount, annualRate, tenure)
  const totalPayable = emi * tenure
  const totalInterest = totalPayable - amount
  const processingFee = amount * Number(lender.processingFee) / 100
  const fitScore = Math.max(48, Math.min(99, Math.round(100 - (annualRate - 8.5) * 8 - Number(lender.processingFee) * 3)))
  return { annualRate, emi, totalPayable: totalPayable + processingFee, totalInterest, processingFee, fitScore }
}
