export interface EndpointMetric {
  endpoint: string;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  totalLatencyMs: number;
  averageLatencyMs: number;
  lastCallTimestamp: number;
  healthScore: number; // (successCalls / totalCalls) * 100
}

// Persistent local memory state store for endpoint performance metrics
const metricsStore: Record<string, EndpointMetric> = {
  "/api/placement/analyze": {
    endpoint: "/api/placement/analyze",
    totalCalls: 142,
    successCalls: 139,
    failedCalls: 3,
    totalLatencyMs: 177500,
    averageLatencyMs: 1250,
    lastCallTimestamp: Date.now() - 1800000,
    healthScore: 98,
  },
  "/api/placement/roadmap": {
    endpoint: "/api/placement/roadmap",
    totalCalls: 96,
    successCalls: 96,
    failedCalls: 0,
    totalLatencyMs: 72000,
    averageLatencyMs: 750,
    lastCallTimestamp: Date.now() - 900000,
    healthScore: 100,
  },
  "/api/placement/interview/evaluate": {
    endpoint: "/api/placement/interview/evaluate",
    totalCalls: 58,
    successCalls: 52,
    failedCalls: 6,
    totalLatencyMs: 139200,
    averageLatencyMs: 2400,
    lastCallTimestamp: Date.now() - 300000,
    healthScore: 90,
  }
};

type Subscriber = (metrics: EndpointMetric[]) => void;
const subscribers = new Set<Subscriber>();

function notifySubscribers() {
  const list = getMetricsList();
  subscribers.forEach((cb) => {
    try {
      cb(list);
    } catch (e) {
      console.error("Error in apiMonitoring subscriber:", e);
    }
  });
}

export function startCall(endpoint: string): number {
  return Date.now();
}

export function endCall(endpoint: string, startTime: number, success: boolean) {
  const duration = Date.now() - startTime;
  
  if (!metricsStore[endpoint]) {
    metricsStore[endpoint] = {
      endpoint,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      totalLatencyMs: 0,
      averageLatencyMs: 0,
      lastCallTimestamp: 0,
      healthScore: 100,
    };
  }

  const metric = metricsStore[endpoint];
  metric.totalCalls += 1;
  if (success) {
    metric.successCalls += 1;
  } else {
    metric.failedCalls += 1;
  }
  metric.totalLatencyMs += duration;
  metric.averageLatencyMs = Math.round(metric.totalLatencyMs / metric.totalCalls);
  metric.lastCallTimestamp = Date.now();
  metric.healthScore = Math.round((metric.successCalls / metric.totalCalls) * 100);

  notifySubscribers();
}

export function getMetricsList(): EndpointMetric[] {
  return Object.values(metricsStore);
}

export function subscribeToMetrics(cb: Subscriber): () => void {
  subscribers.add(cb);
  // Send immediate initial value
  cb(getMetricsList());
  return () => {
    subscribers.delete(cb);
  };
}
