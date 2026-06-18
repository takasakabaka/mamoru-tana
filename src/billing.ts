export const subscriptionProducts = {
  plusMonthly: "mamoru_tana_plus_monthly",
  familyMonthly: "mamoru_tana_family_monthly",
} as const;

export const localPlanPreviewEnabled = process.env.EXPO_PUBLIC_LOCAL_PLAN_PREVIEW === "true";

export const paidPlansUnavailableMessage =
  "Plus/Familyはアプリ内課金の接続後に使えます。公開前の誤課金を防ぐため、今はFreeで動作します。";

export function canUsePaidPlans(): boolean {
  return localPlanPreviewEnabled;
}

export function isPaidPlanId(planId: string): boolean {
  return planId === "plus" || planId === "family";
}
