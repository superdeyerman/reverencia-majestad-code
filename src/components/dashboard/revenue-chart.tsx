"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCLP } from "@/lib/utils";

export function RevenueChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="label" stroke="#78716c" />
          <YAxis stroke="#78716c" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
          <Tooltip formatter={(value) => formatCLP(Number(value ?? 0))} />
          <Bar dataKey="value" fill="#b98f53" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
