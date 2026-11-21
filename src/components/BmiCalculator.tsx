import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  RotateCcw,
} from 'lucide-react';

interface BmiCalculatorProps {
  storedHeightCm: number;
  storedWeightKg: number;
}

interface BmiCategoryInfo {
  label: string;
  rangeText: string;
  guidance: string;
  textColor: string;
  barAccent: string;
  icon: typeof CheckCircle2;
}

const BMI_RANGES: Array<{
  min: number;
  max: number | null;
  label: string;
  rangeLabel: string;
  segmentColor: string;
}> = [
  {
    min: 0,
    max: 18.5,
    label: 'Underweight',
    rangeLabel: '< 18.5',
    segmentColor: 'bg-sky-500',
  },
  {
    min: 18.5,
    max: 25,
    label: 'Normal Weight',
    rangeLabel: '18.5 – 24.9',
    segmentColor: 'bg-emerald-600',
  },
  {
    min: 25,
    max: 30,
    label: 'Overweight',
    rangeLabel: '25.0 – 29.9',
    segmentColor: 'bg-amber-500',
  },
  {
    min: 30,
    max: null,
    label: 'Obese',
    rangeLabel: '≥ 30.0',
    segmentColor: 'bg-red-600',
  },
];

function classifyBmi(bmi: number): BmiCategoryInfo {
  if (bmi < 18.5) {
    return {
      label: 'Underweight',
      rangeText: 'Below 18.5 kg/m²',
      guidance:
        'Below the standard healthy weight range for your height. Follow your assigned nutrition schedule consistently.',
      textColor: 'text-sky-700',
      barAccent: 'bg-sky-600',
      icon: Info,
    };
  }
  if (bmi < 25) {
    return {
      label: 'Normal Weight',
      rangeText: '18.5 – 24.9 kg/m²',
      guidance:
        'Within the standard healthy BMI range for your recorded height and weight.',
      textColor: 'text-emerald-700',
      barAccent: 'bg-emerald-600',
      icon: CheckCircle2,
    };
  }
  if (bmi < 30) {
    return {
      label: 'Overweight',
      rangeText: '25.0 – 29.9 kg/m²',
      guidance:
        'Slightly above the standard healthy weight range. Stay aligned with your assigned meal plan.',
      textColor: 'text-amber-700',
      barAccent: 'bg-amber-600',
      icon: AlertCircle,
    };
  }
  return {
    label: 'Obese',
    rangeText: '30.0 kg/m² and above',
    guidance:
      'Significantly above the standard healthy weight range. Consult your nutrition administrator for guidance.',
    textColor: 'text-red-700',
    barAccent: 'bg-red-600',
    icon: AlertCircle,
  };
}

export function BmiCalculator({
  storedHeightCm,
  storedWeightKg,
}: BmiCalculatorProps) {
  const [heightInput, setHeightInput] = useState(String(storedHeightCm));
  const [weightInput, setWeightInput] = useState(String(storedWeightKg));

  useEffect(() => {
    setHeightInput(String(storedHeightCm));
    setWeightInput(String(storedWeightKg));
  }, [storedHeightCm, storedWeightKg]);

  const parsedHeight = Number(heightInput);
  const parsedWeight = Number(weightInput);

  const isModified =
    parsedHeight !== storedHeightCm || parsedWeight !== storedWeightKg;

  const isValid =
    Number.isFinite(parsedHeight) &&
    parsedHeight > 0 &&
    parsedHeight <= 300 &&
    Number.isFinite(parsedWeight) &&
    parsedWeight > 0 &&
    parsedWeight <= 500;

  const result = useMemo(() => {
    if (!isValid) return null;
    const heightM = parsedHeight / 100;
    const bmi = parsedWeight / (heightM * heightM);
    const minHealthyKg = 18.5 * heightM * heightM;
    const maxHealthyKg = 24.9 * heightM * heightM;
    // Clamp indicator position between BMI 14 and 40 across the scale track
    const clamped = Math.min(40, Math.max(14, bmi));
    const markerPercent = ((clamped - 14) / (40 - 14)) * 100;

    return {
      bmi,
      category: classifyBmi(bmi),
      minHealthyKg,
      maxHealthyKg,
      markerPercent,
    };
  }, [isValid, parsedHeight, parsedWeight]);

  function handleReset() {
    setHeightInput(String(storedHeightCm));
    setWeightInput(String(storedWeightKg));
  }

  const StatusIcon = result ? result.category.icon : Activity;

  return (
    <section
      aria-labelledby="bmi-calculator-heading"
      className="rounded-xl border border-slate-200 bg-white"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-white">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2
              id="bmi-calculator-heading"
              className="text-base font-bold text-slate-900"
            >
              Body Mass Index (BMI) Calculator
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isModified
                ? 'Showing preview calculation · Stored profile values remain unchanged'
                : 'Calculated automatically from your stored height and weight'}
            </p>
          </div>
        </div>

        {isModified && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Stored Metrics</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12">
        {/* Left: Primary BMI Readout & Health Range Bar */}
        <div className="space-y-6 lg:col-span-7">
          {result ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Calculated BMI Score
                  </p>
                  <div className="mt-1 flex items-baseline gap-2.5">
                    <span className="font-mono text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                      {result.bmi.toFixed(1)}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      kg/m²
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${result.category.textColor}`}
                  >
                    <StatusIcon className="h-4 w-4 shrink-0" />
                    <span>{result.category.label}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
                    Range: {result.category.rangeText}
                  </p>
                </div>
              </div>

              {/* Segmented BMI Spectrum Indicator */}
              <div>
                <div className="relative pt-3">
                  {/* Pointer */}
                  <div
                    className="absolute top-0 -translate-x-1/2 transition-all duration-200"
                    style={{ left: `${result.markerPercent}%` }}
                  >
                    <div className="h-3 w-1 rounded-full bg-[#0F172A]" />
                  </div>

                  {/* Proportional Segments across 14–40 */}
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${((18.5 - 14) / 26) * 100}%` }}
                      title="Underweight (< 18.5)"
                    />
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${((25 - 18.5) / 26) * 100}%` }}
                      title="Normal Weight (18.5 – 24.9)"
                    />
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${((30 - 25) / 26) * 100}%` }}
                      title="Overweight (25.0 – 29.9)"
                    />
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${((40 - 30) / 26) * 100}%` }}
                      title="Obese (≥ 30.0)"
                    />
                  </div>
                </div>

                {/* Health Range Reference Legend */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-100 pt-4 sm:grid-cols-4">
                  {BMI_RANGES.map((range) => {
                    const isCurrent = result.category.label === range.label;
                    return (
                      <div key={range.label} className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-xs ${range.segmentColor}`}
                            aria-hidden="true"
                          />
                          <span
                            className={`truncate text-xs ${
                              isCurrent
                                ? 'font-bold text-slate-900'
                                : 'font-medium text-slate-600'
                            }`}
                          >
                            {range.label}
                          </span>
                        </div>
                        <p className="mt-0.5 pl-3.5 font-mono text-xs text-slate-500 tabular-nums">
                          {range.rangeLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {result.category.guidance}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Reference healthy weight for{' '}
                  <span className="font-mono font-medium text-slate-700 tabular-nums">
                    {parsedHeight} cm
                  </span>
                  :{' '}
                  <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                    {result.minHealthyKg.toFixed(1)} –{' '}
                    {result.maxHealthyKg.toFixed(1)} kg
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="py-6 text-sm text-red-700">
              Enter a valid positive height (1–300 cm) and weight (1–500 kg) to
              calculate BMI.
            </div>
          )}
        </div>

        {/* Right: Height & Weight Inputs (pre-filled from stored profile) */}
        <div className="flex flex-col justify-between border-t border-slate-100 pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Measurement Inputs
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Pre-loaded from your profile. Adjust values to test target
                weights without changing your official record.
              </p>
            </div>

            <div>
              <label
                htmlFor="bmi-height-input"
                className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <span>Height (cm)</span>
                <span className="font-mono text-slate-400 tabular-nums">
                  Stored: {storedHeightCm} cm
                </span>
              </label>
              <input
                id="bmi-height-input"
                type="number"
                step="0.1"
                min="1"
                max="300"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="bmi-weight-input"
                className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <span>Weight (kg)</span>
                <span className="font-mono text-slate-400 tabular-nums">
                  Stored: {storedWeightKg} kg
                </span>
              </label>
              <input
                id="bmi-weight-input"
                type="number"
                step="0.1"
                min="1"
                max="500"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>
          </div>

          <p className="mt-5 border-t border-slate-100 pt-3 font-mono text-xs text-slate-400">
            Formula: weight (kg) / [height (m)]²
          </p>
        </div>
      </div>
    </section>
  );
}
