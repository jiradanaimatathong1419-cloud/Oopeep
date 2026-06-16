import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, RotateCcw, Sparkles, BarChart2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantSelector from "@/components/sushi/RestaurantSelector";
import PlateButton from "@/components/sushi/PlateButton";
import km01 from "@/assets/plates/km-01.svg";

const ORDER_HISTORY_STORAGE_KEY = "oopeep_order_history";

const loadLocalOrders = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLocalOrder = (order) => {
  if (typeof window === "undefined") return;
  try {
    const stored = loadLocalOrders();
    stored.unshift(order);
    window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(stored.slice(0, 200)));
  } catch (err) {
    console.error("Failed to save order locally:", err);
  }
};
import km02 from "@/assets/plates/km-02.svg";
import km03 from "@/assets/plates/km-03.svg";
import km04 from "@/assets/plates/km-04.svg";
import km05 from "@/assets/plates/km-05.svg";
import km06 from "@/assets/plates/km-06.svg";
import km07 from "@/assets/plates/km-07.svg";
import km08 from "@/assets/plates/km-08.svg";
import km09 from "@/assets/plates/km-09.svg";
import km10 from "@/assets/plates/km-10.svg";
import km11 from "@/assets/plates/km-11.svg";
import km12 from "@/assets/plates/km-12.svg";
import ss01 from "@/assets/plates/ss-01.svg";
import ss02 from "@/assets/plates/ss-02.svg";
import ss03 from "@/assets/plates/ss-03.svg";
import ss04 from "@/assets/plates/ss-04.svg";
import OrderSummary from "@/components/sushi/OrderSummary";

const samplePlatesByRestaurant = {
  "Katsu Midori": [
    { id: "km-01", price: 40, calories: 0, color_name: "🔴 สีแดง", emoji: "🔴", color_hex: "#ef4444", image: km01 },
    { id: "km-02", price: 50, calories: 0, color_name: "🔵 สีน้ำเงิน", emoji: "🔵", color_hex: "#3b82f6", image: km02 },
    { id: "km-03", price: 60, calories: 0, color_name: "🟢 สีเขียว", emoji: "🟢", color_hex: "#10b981", image: km03 },
    { id: "km-04", price: 70, calories: 0, color_name: "🟡 สีเหลือง", emoji: "🟡", color_hex: "#f59e0b", image: km04 },
    { id: "km-05", price: 80, calories: 0, color_name: "🟤 สีน้ำตาล", emoji: "🟤", color_hex: "#8b5e3c", image: km05 },
    { id: "km-06", price: 90, calories: 0, color_name: "⚪ สีขาว", emoji: "⚪", color_hex: "#ffffff", image: km06 },
    { id: "km-07", price: 100, calories: 0, color_name: "🟪 สีม่วง", emoji: "🟪", color_hex: "#7c3aed", image: km07 },
    { id: "km-08", price: 110, calories: 0, color_name: "🧡 สีส้ม", emoji: "🧡", color_hex: "#f97316", image: km08 },
    { id: "km-09", price: 120, calories: 0, color_name: "🩶 สีเงิน", emoji: "🩶", color_hex: "#9ca3af", image: km09 },
    { id: "km-10", price: 140, calories: 0, color_name: "🪙 สีทอง", emoji: "🪙", color_hex: "#d4af37", image: km10 },
    { id: "km-11", price: 160, calories: 0, color_name: "🌟 ลายทอง / ลายพิเศษ", emoji: "🌟", color_hex: "#fbbf24", image: km11 },
    { id: "km-12", price: 180, calories: 0, color_name: "⚫ สีดำ", emoji: "⚫", color_hex: "#000000", image: km12 },
  ],
  SUSHIRO: [
    { id: "ss-01", price: 40, calories: 0, color_name: "🔴 จานสีแดง (เมนูเบสิก: แซลมอน, ทูน่า)", emoji: "🔴", color_hex: "#ef4444", image: ss01 },
    { id: "ss-02", price: 60, calories: 0, color_name: "🪙 จานสีเงิน (เมนูอัปเกรด: โฮตาเตะ, เนื้อวัว)", emoji: "🪙", color_hex: "#9ca3af", image: ss02 },
    { id: "ss-03", price: 80, calories: 0, color_name: "🟡 จานสีทอง (เมนูพรีเมียม: ชูโทโร่, ปลาไหล)", emoji: "🟡", color_hex: "#f59e0b", image: ss03 },
    { id: "ss-04", price: 120, calories: 0, color_name: "⚫ จานสีดำ (เมนูสูงสุด: โอโทโร่, อูนิ)", emoji: "⚫", color_hex: "#000000", image: ss04 },
  ],
};

/**
 * @typedef {{ id: string; price: number; calories?: number; color_name: string; emoji: string; color_hex: string; }} Plate
 * @typedef {{ [plateId: string]: number; }} OrderCounts
 */

export default function Home() {
  const [restaurant, setRestaurant] = useState("Katsu Midori");
  const [plates, setPlates] = useState(/** @type {Plate[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [orderCounts, setOrderCounts] = useState(/** @type {OrderCounts} */ ({}));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [siteName, setSiteName] = useState("ซูชิแคลค");
  const [useMockData, setUseMockData] = useState(() => !appParams.appId || appParams.appId === "your_base44_app_id");

  useEffect(() => {
    loadPlates();
  }, [restaurant]);

  useEffect(() => {
    if (!appParams.appId || appParams.appId === "your_base44_app_id") {
      return;
    }

    base44.entities.AppConfig.filter({ key: "site_name" }, undefined, 1)
      .then(data => {
        if (data?.[0]?.value) setSiteName(data[0].value);
      })
      .catch((err) => {
        console.error("Failed to load site name:", err);
      });
  }, []);

  const loadPlates = async () => {
    setLoading(true);
    setError(null);

    if (useMockData) {
      setPlates(samplePlatesByRestaurant[restaurant] || []);
      setLoading(false);
      return;
    }

    try {
      const data = await base44.entities.PlateType.filter({ restaurant }, "sort_order", 50);
      setPlates(/** @type {Plate[]} */ (Array.isArray(data) ? data : []));
    } catch (err /** @type {unknown} */) {
      console.error("Failed to load plates:", err);
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดเมนูได้ในขณะนี้");
      setPlates(samplePlatesByRestaurant[restaurant] || []);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {string} plateId
   */
  /** @type {(plateId: string) => void} */
  const handleAdd = (plateId) => {
    setOrderCounts(prev => ({ ...prev, [plateId]: (prev[plateId] || 0) + 1 }));
  };

  /** @type {(plateId: string) => void} */
  const handleRemove = (plateId) => {
    setOrderCounts(prev => {
      const count = (prev[plateId] || 0) - 1;
      if (count <= 0) { const next = { ...prev }; delete next[plateId]; return next; }
      return { ...prev, [plateId]: count };
    });
  };

  const handleClear = () => setOrderCounts(/** @type {OrderCounts} */ ({}));

  /** @type {(r: string) => void} */
  const handleRestaurantChange = (r) => { setRestaurant(r); setOrderCounts(/** @type {OrderCounts} */ ({})); };

  const handleSaveOrder = async () => {
    setSaving(true);
    const orderedPlates = plates.filter(p => (orderCounts[p.id] || 0) > 0);
    const subtotal = orderedPlates.reduce((s, p) => s + p.price * orderCounts[p.id], 0);
    const serviceCharge = Math.round(subtotal * 0.1);
    const total = subtotal + serviceCharge;
    const totalCalories = orderedPlates.reduce((s, p) => s + (p.calories || 0) * orderCounts[p.id], 0);
    const totalPlatesCount = orderedPlates.reduce((s, p) => s + orderCounts[p.id], 0);
    const today = new Date().toISOString().split("T")[0];

    const orderData = {
      id: `local-${today}-${Math.random().toString(36).substring(2, 10)}`,
      restaurant,
      plates_json: JSON.stringify(orderedPlates.map(p => ({ name: p.color_name, emoji: p.emoji, qty: orderCounts[p.id], price: p.price }))),
      subtotal,
      service_charge: serviceCharge,
      total,
      total_calories: totalCalories,
      total_plates: totalPlatesCount,
      order_date: today,
    };

    if (useMockData) {
      console.info("Mock save order:", {
        restaurant,
        subtotal,
        serviceCharge,
        total,
        totalCalories,
        totalPlatesCount,
        orderedPlates,
      });
      saveLocalOrder(orderData);
      setSaving(false);
      setSavedMsg(true);
      handleClear();
      setTimeout(() => setSavedMsg(false), 2500);
      return;
    }

    try {
      await base44.entities.OrderHistory.create(orderData);
    } catch (err) {
      console.error("Failed to save order to backend, saving locally instead:", err);
      saveLocalOrder(orderData);
    }

    setSaving(false);
    setSavedMsg(true);
    handleClear();
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const totalPlates = Object.values(orderCounts).reduce((s, c) => s + c, 0);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff0f5 0%, #fce4ec 40%, #fdf2f8 100%)" }}>

      {/* Floating decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-10 left-8 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
        <div className="absolute top-32 right-4 w-20 h-20 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #f472b6, transparent)" }} />
        <div className="absolute bottom-40 left-6 w-24 h-24 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 pink-glass border-b border-pink-200/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-xl" style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}>
              🍣
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg leading-tight" style={{ color: "#be185d" }}>
                {siteName}
              </h1>
              <p className="text-xs font-body" style={{ color: "#f472b6" }}>SushiCalc 🌸 คำนวณราคา+แคลอรี่</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {totalPlates > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}
              >
                {totalPlates} จาน 🍽️
              </motion.span>
            )}
            <Link to="/stats">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100" style={{ color: "#db2777" }}>
                <BarChart2 className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100" style={{ color: "#db2777" }}>
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-5 space-y-5 pb-10">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 text-white shadow-lg overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)" }}
        >
          <div className="absolute -top-4 -right-4 text-6xl opacity-20 rotate-12">🍣</div>
          <div className="absolute -bottom-2 -left-2 text-5xl opacity-15 -rotate-12">🌸</div>
          <p className="text-xs font-body opacity-80 mb-1">ยินดีต้อนรับสู่</p>
          <h2 className="font-heading font-bold text-xl leading-snug">คำนวณราคาซูชิสายพาน</h2>
          <p className="text-xs opacity-80 mt-1">รวม Service Charge 10% + แคลอรี่ครบ ✨</p>
        </motion.div>

        {/* Restaurant Selector */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm">🏮</span>
            <div>
              <h2 className="font-heading font-semibold text-sm" style={{ color: "#be185d" }}>เลือกร้านที่ต้องการ</h2>
              {useMockData && (
                <p className="text-[10px] mt-1 text-pink-500">กำลังใช้เมนูสำรอง (mock data) เพราะยังไม่มี Base44 appId ที่ใช้งานได้</p>
              )}
            </div>
          </div>
          <RestaurantSelector selected={restaurant} onSelect={handleRestaurantChange} />
        </section>

        {/* Plate Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🎨</span>
              <h2 className="font-heading font-semibold text-sm" style={{ color: "#be185d" }}>
                เลือกจาน · {restaurant}
              </h2>
            </div>
            {Object.keys(orderCounts).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs rounded-full hover:bg-pink-100"
                style={{ color: "#db2777" }}
              >
                <RotateCcw className="w-3 h-3 mr-1" /> รีเซ็ต
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: restaurant === "Katsu Midori" ? 12 : 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }} />
              ))}
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
                  <p className="font-semibold">เกิดข้อผิดพลาดในการโหลดเมนู</p>
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={loadPlates}
                    className="mt-3 inline-flex items-center rounded-full bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                  >
                    โหลดอีกครั้ง
                  </button>
                </div>
              )}

              <motion.div
                key={restaurant}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-4 gap-3"
              >
                {plates.map(p => (
                  <PlateButton
                    key={p.id}
                    plate={p}
                    count={orderCounts[p.id] || 0}
                    onAdd={() => handleAdd(p.id)}
                    onRemove={() => handleRemove(p.id)}
                  />
                ))}
              </motion.div>
            </>
          )}
        </section>

        {/* Order Summary */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm">🧾</span>
            <h2 className="font-heading font-semibold text-sm" style={{ color: "#be185d" }}>สรุปออเดอร์</h2>
          </div>
          <OrderSummary plates={plates} orderCounts={orderCounts} onClear={handleClear} />

          {totalPlates > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSaveOrder}
              disabled={saving}
              className="mt-3 w-full py-3.5 rounded-3xl font-heading font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}
            >
              <Save className="w-4 h-4" />
              {saving ? "กำลังบันทึก..." : "💾 บันทึกออเดอร์นี้เข้าสถิติ"}
            </motion.button>
          )}

          {savedMsg && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-center text-sm font-heading font-semibold py-2 rounded-2xl"
              style={{ background: "#d1fae5", color: "#065f46" }}
            >
              ✅ บันทึกเรียบร้อยแล้ว! ดูสถิติได้เลย 📊
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}