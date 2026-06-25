export function calcNetProfitLoss(revenue, operatingCosts) {
  const totalCosts = Number(operatingCosts) || 0;
  const totalRevenue = Number(revenue) || 0;
  const netResult = totalRevenue - totalCosts;

  return {
    totalOperatingCosts: totalCosts,
    netResult,
    profit: netResult > 0 ? netResult : 0,
    loss: netResult < 0 ? Math.abs(netResult) : 0,
  };
}
