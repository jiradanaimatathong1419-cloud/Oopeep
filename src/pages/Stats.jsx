import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Utensils, Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, startOfWeek, addDays, subWeeks, startOfMonth } from "date-fns";
import { th } from "date-fns/locale";

const PINK = "#f472b6";
const DEEP_PINK = "#ec4899";
const LIGHT_PINK = "#fce7f3";

function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const start = startOfWeek(d, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return `${format(start, "d MMM", { locale: th })} - ${format(end, "d MMM", { locale: th })}`;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const start = startOfWeek(d, { weekStartsOn: 1 });
  return format(start, "yyyy-MM-dd");
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3 shadow-lg text-sm" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
      <p className="font-heading font-bold mb-1" style={{ color: "#be185d" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === "ยอดรวม (฿)" ? `฿${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Stats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week"); // week | month

  useEffect(() => {
    const loadOrders = async () => {
      let data = [];
      try {
        data = await base44.entities.OrderHistory.list("-order_date", 200);
      } catch (err) {
        console.warn("Failed to load OrderHistory from backend, using local history:", err);
      }

      const localData = [];
      try {
        const stored = window.localStorage.getItem("oopeep_order_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localData.push(...parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load local order history:", err);
      }

      const merged = [...localData, ...data].sort((a, b) => b.order_date.localeCompare(a.order_date)).slice(0, 200);
      setOrders(merged);
      setLoading(false);
    };

    loadOrders();
  }, []);

  // --- aggregate by week ---
  const weekMap = {};
  orders.forEach(o => {
    const key = getWeekKey(o.order_date);
    if (!weekMap[key]) weekMap[key] = { week: key, label: getWeekLabel(o.order_date), total: 0, plates: 0, calories: 0, sessions: 0 };
    weekMap[key].total += o.total || 0;
    weekMap[key].plates += o.total_plates || 0;
    weekMap[key].calories += o.total_calories || 0;
    weekMap[key].sessions += 1;
  });
  const weekData = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

  // --- aggregate by month ---
  const monthMap = {};
  orders.forEach(o => {
    const key = format(new Date(o.order_date), "yyyy-MM");
    const label = format(new Date(o.order_date), "MMM yy", { locale: th });
    if (!monthMap[key]) monthMap[key] = { key, label, total: 0, plates: 0, calories: 0, sessions: 0 };
    monthMap[key].total += o.total || 0;
    monthMap[key].plates += o.total_plates || 0;
    monthMap[key].calories += o.total_calories || 0;
    monthMap[key].sessions += 1;
  });
  const monthData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);

  const chartData = (view === "week" ? weekData : monthData).map(d => ({
    name: d.label,
    "ยอดรวม (฿)": d.total,
    "จำนวนจาน": d.plates,
  }));

  const displayData = view === "week" ? weekData : monthData;

  // summary stats
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalPlates = orders.reduce((s, o) => s + (o.total_plates || 0), 0);
  const totalCalories = orders.reduce((s, o) => s + (o.total_calories || 0), 0);

  // this month
  const thisMonthKey = format(new Date(), "yyyy-MM");
  const thisMonthOrders = orders.filter(o => format(new Date(o.order_date), "yyyy-MM") === thisMonthKey);
  const thisMonthTotal = thisMonthOrders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff0f5 0%, #fce4ec 40%, #fdf2f8 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 pink-glass border-b border-pink-200/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors" style={{ color: "#db2777" }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}>
            📊
          </div>
          <div>
            <h1 className="font-heading font-bold text-base" style={{ color: "#be185d" }}>สถิติการกินซูชิ</h1>
            <p className="text-xs" style={{ color: "#f472b6" }}>ดูยอดรวมรายสัปดาห์และรายเดือน</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-10">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "💸", label: "เดือนนี้", value: `฿${thisMonthTotal.toLocaleString()}`, sub: "ยอดรวม (รวม SC)" },
            { emoji: "🍣", label: "จานทั้งหมด", value: `${totalPlates.toLocaleString()}`, sub: "จานสะสม" },
            { emoji: "💰", label: "ใช้ไปทั้งหมด", value: `฿${totalSpent.toLocaleString()}`, sub: "ตั้งแต่เริ่มต้น" },
            { emoji: "🔥", label: "แคลอรี่รวม", value: `${totalCalories.toLocaleString()}`, sub: "kcal สะสม" }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-3xl p-4"
              style={{ background: i % 2 === 0 ? "linear-gradient(135deg, #f9a8d4, #f472b6)" : "#fff8fb", border: i % 2 !== 0 ? "2px solid #fce7f3" : "none" }}
            >
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="font-heading font-extrabold text-xl" style={{ color: i % 2 === 0 ? "#fff" : "#be185d" }}>
                {s.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: i % 2 === 0 ? "rgba(255,255,255,0.8)" : "#f472b6" }}>{s.label}</div>
              <div className="text-xs" style={{ color: i % 2 === 0 ? "rgba(255,255,255,0.6)" : "#fba8c9" }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "#fce7f3" }}>
          {[["week", "รายสัปดาห์"], ["month", "รายเดือน"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2 rounded-xl text-sm font-heading font-bold transition-all duration-200"
              style={view === v
                ? { background: "linear-gradient(135deg, #f472b6, #ec4899)", color: "#fff", boxShadow: "0 4px 12px rgba(244,114,182,0.35)" }
                : { color: "#db2777", background: "transparent" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-56 rounded-3xl animate-pulse" style={{ background: "#fce7f3" }} />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl p-10 text-center" style={{ background: "#fff8fb", border: "2px dashed #f9a8d4" }}>
            <div className="text-4xl mb-3">📊</div>
            <p className="font-heading font-semibold text-sm" style={{ color: "#be185d" }}>ยังไม่มีข้อมูล</p>
            <p className="text-xs mt-1" style={{ color: "#f472b6" }}>บันทึกออเดอร์แรกจากหน้าหลักก่อนนะ 🍣</p>
          </div>
        ) : (
          <>
            {/* Chart - spending */}
            <div className="rounded-3xl p-5" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
              <h3 className="font-heading font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#be185d" }}>
                <TrendingUp className="w-4 h-4" /> ยอดค่าใช้จ่าย (฿)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#f472b6" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#f472b6" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ยอดรวม (฿)" fill="url(#pinkGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#fda4af" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart - plates */}
            <div className="rounded-3xl p-5" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
              <h3 className="font-heading font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#be185d" }}>
                <Utensils className="w-4 h-4" /> จำนวนจาน
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#f472b6" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#f472b6" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="จำนวนจาน" fill="url(#purpleGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#e9d5ff" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* History list */}
            <div className="rounded-3xl overflow-hidden" style={{ border: "2px solid #fce7f3" }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}>
                <Calendar className="w-4 h-4 text-white" />
                <h3 className="font-heading font-bold text-sm text-white">ประวัติออเดอร์</h3>
              </div>
              <div className="divide-y" style={{ background: "#fff8fb", borderColor: "#fce7f3" }}>
                {orders.slice(0, 20).map((o, i) => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-heading font-semibold text-sm" style={{ color: "#4c1d30" }}>
                        {o.restaurant} · {o.order_date}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#f472b6" }}>
                        {o.total_plates || 0} จาน · 🔥 {o.total_calories || 0} kcal
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-extrabold text-base" style={{ color: "#be185d" }}>฿{o.total.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: "#fba8c9" }}>SC รวมแล้ว</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}