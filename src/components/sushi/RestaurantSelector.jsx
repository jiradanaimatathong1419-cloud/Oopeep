import React from "react";
import { motion } from "framer-motion";

const restaurants = [
  {
    id: "Katsu Midori",
    name: "Katsu Midori",
    subtitle: "かつ緑",
    emoji: "🍣",
    desc: "12 สีจาน · ซูชิพรีเมียม",
    grad: "linear-gradient(135deg, #fce7f3, #fbcfe8)"
  },
  {
    id: "SUSHIRO",
    name: "SUSHIRO",
    subtitle: "スシロー",
    emoji: "🏮",
    desc: "4 สีจาน · สายพานซูชิ",
    grad: "linear-gradient(135deg, #fdf2f8, #fce4ec)"
  }
];

export default function RestaurantSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {restaurants.map((r) => {
        const isActive = selected === r.id;
        return (
          <motion.button
            key={r.id}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(r.id)}
            className="relative rounded-3xl p-4 text-left transition-all duration-200 overflow-hidden"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #f9a8d4, #f472b6)"
                : r.grad,
              boxShadow: isActive
                ? "0 8px 24px rgba(244,114,182,0.35)"
                : "0 2px 8px rgba(244,114,182,0.15)",
              border: isActive ? "2px solid #f472b6" : "2px solid #fce7f3"
            }}
          >
            {/* Decorative circle */}
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
              style={{ background: isActive ? "rgba(255,255,255,0.5)" : "#f9a8d4" }}
            />
            <span className="text-3xl relative z-10">{r.emoji}</span>
            <h3
              className="font-heading font-bold text-sm mt-2 relative z-10"
              style={{ color: isActive ? "#fff" : "#be185d" }}
            >
              {r.name}
            </h3>
            <p
              className="text-xs font-body relative z-10 mt-0.5"
              style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#f472b6" }}
            >
              {r.subtitle}
            </p>
            <p
              className="text-xs relative z-10 mt-1"
              style={{ color: isActive ? "rgba(255,255,255,0.7)" : "#db2777" }}
            >
              {r.desc}
            </p>
            {isActive && (
              <motion.div
                layoutId="activeCheck"
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}