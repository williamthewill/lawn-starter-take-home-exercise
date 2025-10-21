import React, { useEffect, useState } from "react";
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
} from "recharts";
import { useQuery } from "@apollo/client/react";
import { StatisticsData } from "../types";
import GET_STATISTICS from "../graphql/statistics";

/**
 * StatisticsPage component displays usage statistics using various charts.
 * It fetches data via GraphQL and handles loading and error states.
 * The page includes:
 * - Most Used Schemas (Bar Chart)
 * - Average Response Time (Line Chart)
 * - Busiest Hours (per Day) (Line Chart)
 */
export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [topFields, setTopFields] = useState<any[]>([]);
    const [avg, setAvg] = useState<any[]>([]);
    const [busiest, setBusiest] = useState<any[]>([]);

    const { data, loading: gqlLoading, error } = useQuery<StatisticsData>(GET_STATISTICS, {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });

    useEffect(() => {
        if (data?.statistics) {
            const { topFields, AverageDuration, BusiestHourToday } = data.statistics;

            const parsedTop = (topFields ?? []).map((t: any) => ({
                root_field: t.root_field || "Desconhecido",
                count: Number(t.count ?? 0),
                created_at: t.created_at,
            }));

            const parsedAvg = (AverageDuration ?? []).map((d: any) => ({
                root_field: d.root_field || "Desconhecido",
                average_duration: Number(d.average_duration ?? 0),
                created_at: d.created_at,
            }));

            const parsedBusiest = (() => {
                const raw = (BusiestHourToday ?? []).map((b: any) => ({
                    count: Number(b.count ?? 0),
                    hour: Number(b.hour ?? 0),
                    created_at: b.created_at ?? "",
                    updated_at: b.updated_at ?? "",
                }));

                // agrupa por dia (pega a hora mais movimentada de cada)
                const byDay = new Map<
                    string,
                    { created_at: string; updated_at?: string; hour: number; count: number }
                >();

                for (const item of raw) {
                    const dayKey = item.created_at ? item.created_at.slice(0, 10) : "sem-data";
                    const current = byDay.get(dayKey);
                    if (!current || item.count > current.count) {
                        byDay.set(dayKey, item);
                    }
                }

                const arr = Array.from(byDay.entries())
                    .map(([dayKey, v]) => ({
                        ...v,
                        label:
                            new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                            }).format(new Date(v.created_at || dayKey)) +
                            ` ${String(v.hour).padStart(2, "0")}h`,
                    }))
                    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

                if (arr.length === 1) {
                    arr.push({ ...arr[0], label: arr[0].label + " (duplicated)" });
                }

                return arr;
            })();

            setTopFields(parsedTop);
            setAvg(parsedAvg);
            setBusiest(parsedBusiest);
            setLoading(false);
        } else if (!gqlLoading && !data) {
            setLoading(false);
        }
    }, [data, gqlLoading]);

    if (loading || gqlLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "#F9FAFB",
                    color: "#6B7280",
                    fontSize: 18,
                }}
            >
                ⏳ Loading Statistics...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "#F9FAFB",
                    color: "#DC2626",
                    fontSize: 18,
                }}
            >
                ❌ Error Loading Data: {error.message}
            </div>
        );
    }

    if (!topFields.length && !avg.length && !busiest.length) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "#F9FAFB",
                    color: "#6B7280",
                    fontSize: 18,
                }}
            >
                ⚠️ No Data Available.
            </div>
        );
    }

    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(
        new Date(
            topFields[0]?.created_at ||
            avg[0]?.created_at ||
            busiest[0]?.updated_at
        )
    );

    return (
        <div style={{ padding: 24, background: "#F9FAFB", minHeight: "100vh", color: "#111827" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>📊 Usage Statistics</h1>
            <p style={{ color: "#6B7280", marginBottom: 24 }}>
                Last Update: {formattedDate}
            </p>

            {/* --- Most Used Schemas --- */}
            <section style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                    Most Used Schemas
                </h2>
                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={topFields}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="count" domain={[0, "dataMax + 5"]} />
                            <YAxis dataKey="root_field" type="category" width={140} />
                            <Tooltip formatter={(v: any) => [`${v} accesses`, "Total"]} />
                            <Bar
                                dataKey="count"
                                barSize={24}
                                radius={[6, 6, 6, 6]}
                                fill="#3b82f6"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* --- Average Response Time --- */}
            <section style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                    Average Response Time
                </h2>
                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={avg}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="root_field" />
                            <YAxis />
                            <Tooltip formatter={(v: any) => [`${v}s`, "Average Response"]} />
                            <Line
                                type="monotone"
                                dataKey="average_duration"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* --- Busiest Hours (per Day) --- */}
            <section style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                    Busiest Hours (per Day)
                </h2>
                <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={busiest}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip
                                formatter={(v: any, _n: any, p: any) => [
                                    `${v} accesses`,
                                    p?.payload?.label ?? "",
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
};
