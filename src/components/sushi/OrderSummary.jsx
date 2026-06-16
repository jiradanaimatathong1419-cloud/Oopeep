import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @typedef {{ id: string; price: number; calories?: number; color_name: string; emoji: string; color_hex: string; }} Plate
 * @typedef {{ [plateId: string]: number; }} OrderCounts
 */

/**
 * @param {{ plates: Plate[]; orderCounts: OrderCounts; onClear: () => void }} props
 */
export default function OrderSummary({ plates, orderCounts, onClear }) {
  const orderedPlates = plates.filter((p) => (orderCounts[p.id] || 0) > 0);
  const subtotal = orderedPlates.reduce((sum, p) => sum + p.price * orderCounts[p.id], 0);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + serviceCharge;
  const totalCalories = orderedPlates.reduce((sum, p) => sum + (p.calories || 0) * orderCounts[p.id], 0);
  const totalPlates = orderedPlates.reduce((sum, p) => sum + orderCounts[p.id], 0);

  if (totalPlates === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl p-8 text-center"
        style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "2px dashed #f9a8d4" }}
      >
        <div className="text-4xl mb-3">🍽️</div>
        <p className="font-heading font-semibold text-sm" style={{ color: "#db2777" }}>ยังไม่มีรายการ</p>
        <p className="text-xs mt-1" style={{ color: "#f472b6" }}>แตะจานด้านบนเพื่อเริ่มนับ ✨</p>
      </motion.div>
    );
  }

  const caloriePercent = Math.min((totalCalories / 2000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden shadow-lg"
      style={{ border: "2px solid #fce7f3" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}
      >
        <div className="flex items-center gap-2 text-white">
          <ShoppingBag className="w-4 h-4" />
          <h3 className="font-heading font-bold text-sm">สรุปออเดอร์</h3>
          <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {totalPlates} จาน
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-white/80 hover:text-white text-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          ล้าง
        </button>
      </div>

      {/* Items list */}
      <div className="px-5 py-3 space-y-2 max-h-44 overflow-y-auto" style={{ background: "#fff8fb" }}>
        <AnimatePresence>
          {orderedPlates.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center justify-between text-sm py-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border-2 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: p.color_hex, borderColor: "#fce7f3" }}
                />
                <span className="font-medium" style={{ color: "#4c1d30" }}>
                  {p.emoji} {p.color_name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#fce7f3", color: "#db2777" }}>
                  ×{orderCounts[p.id]}
                </span>
              </div>
              <span className="font-bold" style={{ color: "#be185d" }}>
                ฿{(p.price * orderCounts[p.id]).toLocaleString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Price breakdown */}
      <div className="px-5 py-4 space-y-2.5" style={{ background: "#fff0f5" }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: "#9d174d" }}>ราคาอาหาร</span>
          <span className="font-semibold" style={{ color: "#4c1d30" }}>฿{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "#9d174d" }}>Service Charge 10%</span>
          <span className="font-semibold" style={{ color: "#f472b6" }}>+฿{serviceCharge.toLocaleString()}</span>
        </div>

        {/* Total */}
        <motion.div
          layout
          className="rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}
        >
          <div className="flex items-center gap-1.5 text-white">
            <Sparkles className="w-4 h-4" />
            <span className="font-heading font-bold text-sm">ยอดรวมทั้งหมด</span>
          </div>
          <motion.span
            key={total}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="font-heading font-extrabold text-2xl text-white"
          >
            ฿{total.toLocaleString()}
          </motion.span>
        </motion.div>
      </div>

      {/* Calorie section */}
      <div className="px-5 py-4" style={{ background: "#fff8fb", borderTop: "1px solid #fce7f3" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-heading font-semibold text-sm" style={{ color: "#be185d" }}>แคลอรี่รวม</span>
          </div>
          <span className="font-extrabold text-base" style={{ color: "#f97316" }}>
            {totalCalories.toLocaleString()} kcal
          </span>
 
       </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#fce7f3" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${caloriePercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: caloriePercent < 50
                ? "linear-gradient(90deg, #6ee7b7, #34d399)"
                : caloriePercent < 80
                ? "linear-gradient(90deg, #fde68a, #fbbf24)"
                : "linear-gradient(90deg, #fca5a5, #f87171)"
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs" style={{ color: "#f472b6" }}>
            {totalCalories <= 800 ? "🌿 เบาๆ สบายท้อง" :
              totalCalories <= 1500 ? "✨ อิ่มกำลังดี!" :
                "🔥 อิ่มมาก ระวังพุงนะจ๊ะ 😆"}
          </p>
          <p className="text-xs" style={{ color: "#db2777" }}>
            {caloriePercent.toFixed(0)}% / 2000 kcal
          </p>
        </div>
      </div>
    </motion.div>
  );
}