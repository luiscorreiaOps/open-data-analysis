"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, AlertTriangle, DollarSign, Users, Calculator } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { YearComparisonData } from "@/data/get-members";
import { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/utils";
import { Footer } from "@/components/footer";

interface ComparativoClientProps {
  year1: number;
  year2: number;
  availableYears: { value: string; label: string }[];
  comparison: {
    year1: YearComparisonData;
    year2: YearComparisonData;
    growth: {
      membersAboveTeto: number;
      totalAboveTeto: number;
      averageAboveTeto: number;
    };
  } | null;
  trend: YearComparisonData[];
  yearMonthCounts: { year: number; monthCount: number }[];
}

function formatMillions(v: number): string {
  return `${Math.round(v / 1_000_000)}M`;
}

function GrowthBadge({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  const iconSize = size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3";
  const padding = size === "lg" ? "px-2.5 py-1" : "px-2 py-0.5";

  if (value > 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-red-100 ${padding} ${textSize} font-bold text-red-700`}>
        <TrendingUp className={iconSize} />
        +{value.toFixed(1)}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-green-100 ${padding} ${textSize} font-bold text-green-700`}>
        <TrendingDown className={iconSize} />
        {value.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gray-100 ${padding} ${textSize} font-bold text-gray-500`}>
      <Minus className={iconSize} />
      0%
    </span>
  );
}

function KPICard({
  label,
  year1Value,
  year2Value,
  year1Label,
  year2Label,
  growth,
  format,
  icon: Icon,
  gradientFrom,
  borderColor,
  iconBg,
  iconColor,
}: {
  label: string;
  year1Value: number;
  year2Value: number;
  year1Label: string;
  year2Label: string;
  growth: number;
  format: (v: number) => string;
  icon: React.ElementType;
  gradientFrom: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br to-white p-4 shadow-sm hover:shadow-md transition-shadow ${gradientFrom} ${borderColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`flex-shrink-0 rounded-lg p-1.5 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <span className="text-xs font-semibold leading-tight text-gray-500">{label}</span>
        </div>
        <GrowthBadge value={growth} />
      </div>
      <div className="mt-3 pl-0.5">
        <div className="text-sm text-gray-500">
          {year1Label}: <span className="font-bold text-gray-600">{format(year1Value)}</span>
          <span className="mx-1.5 text-gray-300">→</span>
          {year2Label}: <span className="font-bold text-navy">{format(year2Value)}</span>
        </div>
      </div>
    </div>
  );
}

export function ComparativoClient({
  year1,
  year2,
  availableYears,
  comparison,
  trend,
  yearMonthCounts,
}: ComparativoClientProps) {
  const router = useRouter();
  const [showAllOrgaos, setShowAllOrgaos] = useState(false);

  type SortKey = "orgao" | "y1" | "y2" | "variation";
  type SortDir = "asc" | "desc";
  const [sortBy, setSortBy] = useState<SortKey>("y1");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir(key === "orgao" ? "asc" : "desc");
    }
  };

  const yearMonthMap = new Map(yearMonthCounts.map((y) => [y.year, y.monthCount]));
  const currentYear = new Date().getFullYear();
  const incompleteYears = yearMonthCounts
    .filter((y) => y.monthCount < 12)
    .map((y) => ({
      year: y.year,
      monthCount: y.monthCount,
      isCurrentYear: y.year === currentYear,
    }));

  const getMonthCountWarning = (year: number) => {
    const count = yearMonthMap.get(year);
    if (!count || count >= 12) return null;
    const isCurrent = year === currentYear;
    return { count, isCurrent };
  };

  const organChartData = useMemo(() => {
    if (!comparison) return [];
    const y1Map = new Map(comparison.year1.topOrgans.map((o) => [o.orgao, o.total]));
    const y2Map = new Map(comparison.year2.topOrgans.map((o) => [o.orgao, o.total]));
    const allOrgs = new Set([...y1Map.keys(), ...y2Map.keys()]);
    return Array.from(allOrgs)
      .map((orgao) => ({
        orgao,
        year1Val: y1Map.get(orgao) || 0,
        year2Val: y2Map.get(orgao) || 0,
      }))
      .sort((a, b) => b.year2Val - a.year2Val)
      .slice(0, 10);
  }, [comparison]);

  const trendData = trend.map((t) => ({
    year: t.year,
    "Total Acima do Teto": t.totalAboveTeto,
    "Membros Acima do Teto": t.membersAboveTeto,
    "Média por Membro": t.averageAboveTeto,
  }));

  function handleYearChange(yearParam: string, newYear: string) {
    if (yearParam === "ano1") {
      router.push(`/comparativo?ano1=${newYear}&ano2=${year2}`);
    } else {
      router.push(`/comparativo?ano1=${year1}&ano2=${newYear}`);
    }
  }

  const allOrgaos = useMemo(() => {
    if (!comparison) return [];
    const y1Map = new Map(comparison.year1.topOrgans.map((o) => [o.orgao, o.total]));
    const y2Map = new Map(comparison.year2.topOrgans.map((o) => [o.orgao, o.total]));
    const allOrgaosSet = new Set([...y1Map.keys(), ...y2Map.keys()]);
    const mapped = Array.from(allOrgaosSet)
      .map((orgao) => ({
        orgao,
        y1: y1Map.get(orgao) || 0,
        y2: y2Map.get(orgao) || 0,
        variation: 0,
      }))
      .map((row) => ({
        ...row,
        variation: row.y1 > 0 ? ((row.y2 - row.y1) / row.y1) * 100 : 0,
      }));

    return mapped.sort((a, b) => {
      const modifier = sortDir === "asc" ? 1 : -1;
      if (sortBy === "orgao") {
        return a.orgao.localeCompare(b.orgao, "pt-BR") * modifier;
      }
      const aVal = a[sortBy] as number;
      const bVal = b[sortBy] as number;
      return (aVal - bVal) * modifier;
    });
  }, [comparison, sortBy, sortDir]);

  const topOrgansTable = useMemo(() => {
    return showAllOrgaos ? allOrgaos : allOrgaos.slice(0, 5);
  }, [allOrgaos, showAllOrgaos]);

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao ranking
          </Link>
          <div className="rounded-lg border border-gray-100 bg-white p-8 text-center">
            <p className="text-gray-500">Dados não disponíveis para comparação.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-red-primary" />
            <h1 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
              Comparativo Anual
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ShareButtons title="ExtraTeto — Comparativo Anual" />
          </div>
        </div>

        {/* Warning about incomplete years */}
        {incompleteYears.length > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <span className="font-medium">Nota: </span>
              {incompleteYears.map((y, i) => (
                <span key={y.year}>
                  {i > 0 && ", "}
                  O ano de {y.year} possui dados de {y.monthCount} mês{y.monthCount > 1 ? "es" : ""}
                  {y.isCurrentYear ? " (esperado para ano atual)" : " (incompleto)"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section Label: Historical Trend */}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Tendência Histórica
        </h2>

        {/* Trend Chart - shows all years, placed before year selectors */}
        {trendData.length > 1 && (
          <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-bold text-navy">
              Evolução ao Longo dos Anos
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    tickFormatter={formatMillions}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const numValue = Number(value);
                      if (name === "Membros Acima do Teto") {
                        return formatNumber(numValue);
                      }
                      if (numValue > 1000000) {
                        return formatCompactCurrency(numValue);
                      }
                      return formatNumber(numValue);
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Total Acima do Teto"
                    stroke="#DC2626"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#DC2626" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Membros Acima do Teto"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Section Label + Year Selectors */}
        <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Comparativo específico
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={year1}
                onChange={(e) => handleYearChange("ano1", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-sm font-semibold text-navy shadow-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                {availableYears.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
              {getMonthCountWarning(year1) && (
                <div
                  className="flex items-center"
                  title={getMonthCountWarning(year1)?.isCurrent ? `Dados de ${getMonthCountWarning(year1)?.count} meses (esperado para ano atual)` : `Dados de ${getMonthCountWarning(year1)?.count} meses (incompleto)`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-gray-400">vs</span>
            <div className="flex items-center gap-1.5">
              <select
                value={year2}
                onChange={(e) => handleYearChange("ano2", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-sm font-semibold text-navy shadow-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                {availableYears.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
              {getMonthCountWarning(year2) && (
                <div
                  className="flex items-center"
                  title={getMonthCountWarning(year2)?.isCurrent ? `Dados de ${getMonthCountWarning(year2)?.count} meses (esperado para ano atual)` : `Dados de ${getMonthCountWarning(year2)?.count} meses (incompleto)`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <KPICard
            label="Total Acima do Teto"
            year1Value={comparison.year1.totalAboveTeto}
            year2Value={comparison.year2.totalAboveTeto}
            year1Label={String(year1)}
            year2Label={String(year2)}
            growth={comparison.growth.totalAboveTeto}
            format={formatCompactCurrency}
            icon={DollarSign}
            gradientFrom="from-red-50"
            borderColor="border-red-200"
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />
          <KPICard
            label="Membros Acima do Teto"
            year1Value={comparison.year1.membersAboveTeto}
            year2Value={comparison.year2.membersAboveTeto}
            year1Label={String(year1)}
            year2Label={String(year2)}
            growth={comparison.growth.membersAboveTeto}
            format={formatNumber}
            icon={Users}
            gradientFrom="from-blue-50"
            borderColor="border-blue-200"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <KPICard
            label="Média por Membro"
            year1Value={comparison.year1.averageAboveTeto}
            year2Value={comparison.year2.averageAboveTeto}
            year1Label={String(year1)}
            year2Label={String(year2)}
            growth={comparison.growth.averageAboveTeto}
            format={formatCurrency}
            icon={Calculator}
            gradientFrom="from-amber-50"
            borderColor="border-amber-200"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>

        {/* Top Organs Chart */}
        {organChartData.length > 0 && (
          <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy">
                Top 10 Órgãos — Média Mensal Acima do Teto
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#CBD5E1]" />
                  {year1}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-primary" />
                  {year2}
                </span>
              </div>
            </div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={organChartData}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                  barSize={14}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    tickFormatter={(v) => formatCompactCurrency(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="orgao"
                    tick={{ fontSize: 12, fill: "#1E293B", fontWeight: 500, textAnchor: "start", dx: -105 }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const orgao = payload[0]?.payload?.orgao;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                          <div className="mb-1.5 text-xs font-bold text-navy">{orgao}</div>
                          {payload.map((entry) => (
                            <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-gray-500">{entry.name}:</span>
                              <span className="font-semibold text-gray-700">
                                {formatCurrency(Number(entry.value))}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="year1Val" fill="#CBD5E1" name={String(year1)} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="year2Val" fill="#DC2626" name={String(year2)} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Top Organs Table */}
        <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-bold text-navy">
            Órgãos por Média Mensal Acima do Teto
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    className="cursor-pointer pb-2 text-left font-semibold text-gray-600 transition-colors hover:text-navy"
                    onClick={() => handleSort("orgao")}
                  >
                    <span className="flex items-center gap-1">
                      Órgão
                      {sortBy === "orgao" && (
                        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer pb-2 text-right font-semibold text-gray-600 transition-colors hover:text-navy"
                    onClick={() => handleSort("y1")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {year1}
                      {sortBy === "y1" && (
                        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer pb-2 text-right font-semibold text-gray-600 transition-colors hover:text-navy"
                    onClick={() => handleSort("y2")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {year2}
                      {sortBy === "y2" && (
                        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer pb-2 text-right font-semibold text-gray-600 transition-colors hover:text-navy"
                    onClick={() => handleSort("variation")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Variação
                      {sortBy === "variation" && (
                        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {topOrgansTable.map((row) => (
                    <tr key={row.orgao} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 font-medium text-navy">{row.orgao}</td>
                      <td className="py-2 text-right text-gray-600">
                        {formatCompactCurrency(row.y1)}
                      </td>
                      <td className="py-2 text-right font-bold text-navy">
                        {formatCompactCurrency(row.y2)}
                      </td>
                      <td className="py-2 text-right">
                        <GrowthBadge value={row.variation} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {allOrgaos.length > 5 && (
            <button
              onClick={() => setShowAllOrgaos(!showAllOrgaos)}
              className="mt-3 flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              {showAllOrgaos ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Ver todos os {allOrgaos.length} órgãos
                </>
              )}
            </button>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
