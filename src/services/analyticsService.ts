import { analytics as analyticsMock } from "@/data/mockData";
import { GetAnalyticsSummaryRequest, GetAnalyticsSummaryResponse } from "@/contracts";

export async function getAnalyticsSummary(
  _params?: GetAnalyticsSummaryRequest
): Promise<GetAnalyticsSummaryResponse["data"]> {
  void _params;
  return analyticsMock.map((item) => ({ ...item }));
}
