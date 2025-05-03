import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { LogsAPI, LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';

const OTEL_ENDPOINT = window._env_ && window._env_.OTEL_EXPORTER_OTLP_ENDPOINT 
  ? window._env_.OTEL_EXPORTER_OTLP_ENDPOINT 
  : process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

// Initialize Tracer Provider
const traceProvider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
});

const traceExporter = new OTLPTraceExporter({
  url: OTEL_ENDPOINT,
});

traceProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
traceProvider.register();

// Initialize Metrics Provider
const metricExporter = new OTLPMetricExporter({
  url: OTEL_ENDPOINT,
});

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-service',
  }),
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
}));

// Initialize Logs Provider
const loggerProvider = new LoggerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-service',
  }),
});

const logExporter = new OTLPLogExporter({
  url: OTEL_ENDPOINT,
});

loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

// Register Instrumentations
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation(),
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
  ],
});

// Export APIs for use in the app
export const tracer = traceProvider.getTracer('todo-tracer');
export const meter = meterProvider.getMeter('todo-meter');
export const logger = LogsAPI.getLogger('todo-logger');