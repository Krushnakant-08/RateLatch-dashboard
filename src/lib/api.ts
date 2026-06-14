/**
 * Typed fetch wrapper for the Management API.
 * All dashboard data flows through these functions.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// ─── Types ──────────────────────────────────────────

export interface Tenant {
  id: string;
  email: string;
  plan: string;
  upstream_url: string;
  status: string;
  created_at: string;
}

export interface Rule {
  id: string;
  route: string;
  key_by: string;
  max_req: number;
  window_ms: number;
  priority: number;
  created_at: string;
}

export interface UsageHour {
  hour: string;
  allowed: number;
  blocked: number;
}

export interface UsageResponse {
  summary: {
    totalAllowed: number;
    totalBlocked: number;
    blockRate: string;
  };
  hourly: UsageHour[];
}

export interface RegisterResponse {
  tenantId: string;
  projectKey: string;
  dashboardToken: string;
}

export interface LoginResponse {
  tenantId: string;
  dashboardToken: string;
}

// ─── Fetch Helper ───────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ───────────────────────────────────────────

export async function register(data: {
  email: string;
  upstreamUrl: string;
  plan: string;
}): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/manage/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  projectKey: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/manage/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Rules ──────────────────────────────────────────

export async function fetchRules(token: string): Promise<{ rules: Rule[] }> {
  return apiFetch<{ rules: Rule[] }>('/manage/rules', {}, token);
}

export async function createRule(
  token: string,
  data: {
    route: string;
    keyBy: string;
    maxReq: number;
    windowMs: number;
    priority: number;
  }
): Promise<{ rule: Rule }> {
  return apiFetch<{ rule: Rule }>('/manage/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function updateRule(
  token: string,
  ruleId: string,
  data: Partial<{
    route: string;
    keyBy: string;
    maxReq: number;
    windowMs: number;
    priority: number;
  }>
): Promise<{ rule: Rule }> {
  return apiFetch<{ rule: Rule }>(`/manage/rules/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
}

export async function deleteRule(
  token: string,
  ruleId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/manage/rules/${ruleId}`, {
    method: 'DELETE',
  }, token);
}

// ─── Usage ──────────────────────────────────────────

export async function fetchUsage(
  token: string,
  params: { hours?: number; from?: string; to?: string } = {}
): Promise<UsageResponse> {
  const searchParams = new URLSearchParams();
  if (params.hours) searchParams.set('hours', String(params.hours));
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);

  const query = searchParams.toString();
  return apiFetch<UsageResponse>(
    `/manage/usage${query ? `?${query}` : ''}`,
    {},
    token
  );
}

// ─── Plan & Billing ─────────────────────────────────

export interface PlanLimits {
  maxRoutes: number;
  allowedKeyBy: string[];
  priorityAllowed: boolean;
  maxReqCap: number | null;
  priceInr: number;
  razorpayAmountPaise: number;
  label: string;
  description: string;
}

export interface PlanInfoResponse {
  plan: string;
  limits: PlanLimits;
  ruleCount: number;
}

export interface PlanOption {
  id: string;
  label: string;
  description: string;
  priceInr: number;
  maxRoutes: number;
  allowedKeyBy: string[];
  priorityAllowed: boolean;
  maxReqCap: number | null;
}

export interface SubscriptionInfo {
  id: string;
  razorpay_sub_id: string;
  razorpay_plan_id: string;
  plan: string;
  status: string;
  current_start: string | null;
  current_end: string | null;
  created_at: string;
}

export interface SubscriptionResponse {
  currentPlan: string;
  subscription: SubscriptionInfo | null;
}

export interface SubscribeResponse {
  subscriptionId: string;
  razorpayKeyId: string;
  plan: string;
  amount: number;
}

export interface DowngradePreview {
  targetPlan: string;
  totalRules: number;
  rulesToDelete: Rule[];
  reasons: string[];
  rulesAfter: number;
}

export async function fetchPlanInfo(token: string): Promise<PlanInfoResponse> {
  return apiFetch<PlanInfoResponse>('/manage/plan-info', {}, token);
}

export async function fetchPlans(): Promise<{ plans: PlanOption[] }> {
  return apiFetch<{ plans: PlanOption[] }>('/manage/billing/plans');
}

export async function fetchSubscription(token: string): Promise<SubscriptionResponse> {
  return apiFetch<SubscriptionResponse>('/manage/billing/subscription', {}, token);
}

export async function createSubscription(
  token: string,
  plan: string
): Promise<SubscribeResponse> {
  return apiFetch<SubscribeResponse>('/manage/billing/subscribe', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  }, token);
}

export async function cancelSubscription(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/manage/billing/cancel', {
    method: 'POST',
  }, token);
}

export async function fetchDowngradePreview(
  token: string,
  targetPlan: string
): Promise<DowngradePreview> {
  return apiFetch<DowngradePreview>(
    `/manage/billing/downgrade-preview?targetPlan=${targetPlan}`,
    {},
    token
  );
}

export async function confirmDowngrade(
  token: string,
  targetPlan: string
): Promise<{ message: string; deletedRules: number; remainingRules: number }> {
  return apiFetch<{ message: string; deletedRules: number; remainingRules: number }>(
    '/manage/billing/confirm-downgrade',
    {
      method: 'POST',
      body: JSON.stringify({ targetPlan }),
    },
    token
  );
}

// ─── Admin ──────────────────────────────────────────

export interface AdminTenant {
  id: string;
  email: string;
  plan: string;
  status: string;
  upstream_url: string;
  created_at: string;
  updated_at: string;
  rule_count: number;
  planLimits: PlanLimits;
}

export async function fetchAdminTenants(token: string): Promise<{ tenants: AdminTenant[] }> {
  return apiFetch<{ tenants: AdminTenant[] }>('/admin/tenants', {}, token);
}

export async function updateTenantPlan(
  token: string,
  tenantId: string,
  plan: string,
  force: boolean = false
): Promise<{ message: string; previousPlan: string; newPlan: string }> {
  return apiFetch<{ message: string; previousPlan: string; newPlan: string }>(
    `/admin/tenants/${tenantId}/plan`,
    {
      method: 'PUT',
      body: JSON.stringify({ plan, force }),
    },
    token
  );
}

