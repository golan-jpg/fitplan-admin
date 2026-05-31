import { progressReports as progressReportsMock } from "@/data/mockData";
import { GetProgressReportsRequest, GetProgressReportsResponse } from "@/contracts";

export async function getProgressReports(
  _params?: GetProgressReportsRequest
): Promise<GetProgressReportsResponse["data"]> {
  void _params;
  return progressReportsMock.map((report) => ({ ...report }));
}
