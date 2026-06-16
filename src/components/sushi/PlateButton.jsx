import React from "react";
import { motion } from "framer-motion";
import { Minus } from "lucide-react";
import plateWhite from "@/assets/plates/plate-white.svg";
import plateGeneric from "@/assets/plates/plate-generic.svg";
import "@/styles/plates.css";

export default function PlateButton({ plate, count, onAdd, onRemove }) {
  const isWhite = (plate.color_hex || "").toLowerCase() === "#ffffff" || (plate.color_name || "").includes("สีขาว") || plate.emoji === "⚪";
  const isLight = ["#F5F5F4", "#EAB308", "#D4A017", "#FFD700", "#A8A29E"].map(s => s.toLowerCase()).includes((plate.color_hex || "").toLowerCase());

  const getTextColor = () => {
    if (isWhite || (plate.color_hex || "").toLowerCase() === "#f5f5f4") return "#1f2937";
    if (isLight) return "#1c1917";
    return "#ffffff";
  };

  const getShadow = () => {
    if (plate.color_hex === "#FFD700" || plate.color_hex === "#D4A017") return "0 4px 14px rgba(212,160,23,0.45)";
    if (plate.color_hex === "#1C1917") return "0 4px 14px rgba(0,0,0,0.4)";
    return `0 4px 14px ${plate.color_hex}55`;
  };

  const buttonClass = `plate-btn ${isWhite ? "plate-btn--white" : ""}`;
  const imgOpacity = isWhite ? 1 : 0.95;

  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -3, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      <button onClick={onAdd} className={`${buttonClass} w-full p-0`}>
        <div className="w-full h-20 relative flex items-center justify-center">
          <img src={isWhite ? plateWhite : (plate.image || plateGeneric)} alt="" className="plate-img" style={{ opacity: imgOpacity }} />
          <div className="plate-content" style={{ color: getTextColor() }}>
            <span className="text-2xl leading-none">{plate.emoji}</span>
            <span className={`plate-name ${(isWhite || isLight) ? 'plate-badge-light' : 'plate-badge-dark'}`}>{plate.color_name}</span>
            <span className="plate-price">฿{plate.price}</span>
          </div>
        </div>
      </button>

      {count > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2.5 -right-2.5 flex items-center gap-0.5"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="plate-count-btn"
            style={{ background: "linear-gradient(135deg, #fb7185, #e11d48)", color: "#fff" }}
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <motion.span
            key={count}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="plate-count"
            style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)", color: '#fff' }}
          >
            {count}
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}