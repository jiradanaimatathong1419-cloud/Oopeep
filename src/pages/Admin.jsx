import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const emptyPlate = {
  restaurant: "Katsu Midori",
  color_name: "",
  color_hex: "#f472b6",
  emoji: "🔴",
  price: 0,
  calories: 0,
  description: "",
  sort_order: 1
};

export default function Admin() {
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPlate, setCurrentPlate] = useState(null);
  const [formData, setFormData] = useState(emptyPlate);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState("ซูชิแคลค");
  const [siteNameEdit, setSiteNameEdit] = useState(false);
  const [siteNameInput, setSiteNameInput] = useState("ซูชิแคลค");
  const [siteNameConfigId, setSiteNameConfigId] = useState(null);

  useEffect(() => { loadPlates(); loadSiteName(); }, []);

  const loadSiteName = async () => {
    const data = await base44.entities.AppConfig.filter({ key: "site_name" }, null, 1);
    if (data?.[0]) {
      setSiteName(data[0].value);
      setSiteNameInput(data[0].value);
      setSiteNameConfigId(data[0].id);
    }
  };

  const handleSaveSiteName = async () => {
    if (siteNameConfigId) {
      await base44.entities.AppConfig.update(siteNameConfigId, { key: "site_name", value: siteNameInput });
    } else {
      const created = await base44.entities.AppConfig.create({ key: "site_name", value: siteNameInput });
      setSiteNameConfigId(created.id);
    }
    setSiteName(siteNameInput);
    setSiteNameEdit(false);
  };

  const loadPlates = async () => {
    setLoading(true);
    const data = await base44.entities.PlateType.list("sort_order", 100);
    setPlates(data);
    setLoading(false);
  };

  const filtered = filter === "all" ? plates : plates.filter(p => p.restaurant === filter);

  const openCreate = () => {
    setCurrentPlate(null);
    setFormData({ ...emptyPlate, sort_order: plates.length + 1 });
    setEditOpen(true);
  };

  const openEdit = (plate) => {
    setCurrentPlate(plate);
    setFormData({
      restaurant: plate.restaurant,
      color_name: plate.color_name,
      color_hex: plate.color_hex || "#f472b6",
      emoji: plate.emoji || "",
      price: plate.price,
      calories: plate.calories || 0,
      description: plate.description || "",
      sort_order: plate.sort_order || 1
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (currentPlate) {
      await base44.entities.PlateType.update(currentPlate.id, formData);
    } else {
      await base44.entities.PlateType.create(formData);
    }
    setSaving(false);
    setEditOpen(false);
    loadPlates();
  };

  const handleDelete = async () => {
    if (!currentPlate) return;
    await base44.entities.PlateType.delete(currentPlate.id);
    setDeleteOpen(false);
    setCurrentPlate(null);
    loadPlates();
  };

  const openDeleteConfirm = (plate) => {
    setCurrentPlate(plate);
    setDeleteOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff0f5 0%, #fce4ec 40%, #fdf2f8 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 pink-glass border-b border-pink-200/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100" style={{ color: "#db2777" }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #f9a8d4, #f472b6)" }}>
            ⚙️
          </div>
          <div>
            <h1 className="font-heading font-bold text-base" style={{ color: "#be185d" }}>จัดการเมนูจาน</h1>
            <p className="text-xs" style={{ color: "#f472b6" }}>เพิ่ม แก้ไข ลบ สีจานและราคา</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Site Name Editor */}
        <div className="rounded-3xl p-4" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
          <p className="text-xs font-heading font-semibold mb-2" style={{ color: "#db2777" }}>🏷️ ชื่อเว็บไซต์</p>
          {siteNameEdit ? (
            <div className="flex items-center gap-2">
              <Input
                value={siteNameInput}
                onChange={e => setSiteNameInput(e.target.value)}
                className="rounded-xl border-pink-200 font-heading font-bold flex-1"
                autoFocus
              />
              <button
                onClick={handleSaveSiteName}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSiteNameEdit(false); setSiteNameInput(siteName); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-pink-100"
                style={{ color: "#db2777" }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-base" style={{ color: "#be185d" }}>{siteName}</span>
              <button
                onClick={() => setSiteNameEdit(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl hover:bg-pink-100 transition-colors"
                style={{ color: "#db2777" }}
              >
                <Pencil className="w-3 h-3" /> แก้ไข
              </button>
            </div>
          )}
        </div>

        {/* Filter + Add */}
        <div className="flex items-center justify-between gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 rounded-2xl border-pink-200" style={{ background: "#fff0f5" }}>
              <SelectValue placeholder="กรองตามร้าน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🍽️ ทุกร้าน</SelectItem>
              <SelectItem value="Katsu Midori">🍣 Katsu Midori</SelectItem>
              <SelectItem value="SUSHIRO">🏮 SUSHIRO</SelectItem>
            </SelectContent>
          </Select>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-heading font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}
          >
            <Plus className="w-4 h-4" /> เพิ่มจาน
          </motion.button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "จานทั้งหมด", value: plates.length, emoji: "🍽️" },
            { label: "Katsu Midori", value: plates.filter(p => p.restaurant === "Katsu Midori").length, emoji: "🍣" },
            { label: "SUSHIRO", value: plates.filter(p => p.restaurant === "SUSHIRO").length, emoji: "🏮" }
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={{ background: "#fff0f5", border: "1.5px solid #fce7f3" }}>
              <div className="text-xl">{s.emoji}</div>
              <div className="font-heading font-extrabold text-lg mt-1" style={{ color: "#be185d" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#f472b6" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plate list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "#fce7f3" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((plate) => (
                <motion.div
                  key={plate.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: "#fff8fb", border: "1.5px solid #fce7f3" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm border-2"
                      style={{ backgroundColor: plate.color_hex, borderColor: "#fce7f3" }}
                    >
                      {plate.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm" style={{ color: "#4c1d30" }}>
                          {plate.color_name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#fce7f3", color: "#db2777" }}>
                          {plate.restaurant}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "#f472b6" }}>
                        <span className="font-semibold" style={{ color: "#be185d" }}>฿{plate.price}</span>
                        <span>🔥 {plate.calories || 0} kcal</span>
                        {plate.description && <span>· {plate.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(plate)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-pink-100 transition-colors"
                      style={{ color: "#db2777" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(plate)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-14" style={{ color: "#f472b6" }}>
                <div className="text-4xl mb-3">🍽️</div>
                <p className="font-heading font-semibold text-sm">ยังไม่มีจาน</p>
                <p className="text-xs mt-1">กดปุ่ม "เพิ่มจาน" เพื่อเริ่มต้น</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-3xl" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
          <DialogHeader>
            <DialogTitle className="font-heading" style={{ color: "#be185d" }}>
              {currentPlate ? "✏️ แก้ไขจาน" : "✨ เพิ่มจานใหม่"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>ร้าน</Label>
              <Select value={formData.restaurant} onValueChange={(v) => setFormData(d => ({ ...d, restaurant: v }))}>
                <SelectTrigger className="rounded-xl border-pink-200 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Katsu Midori">🍣 Katsu Midori</SelectItem>
                  <SelectItem value="SUSHIRO">🏮 SUSHIRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>ชื่อสี</Label>
                <Input
                  value={formData.color_name}
                  onChange={e => setFormData(d => ({ ...d, color_name: e.target.value }))}
                  placeholder="เช่น แดง"
                  className="rounded-xl border-pink-200 mt-1"
                />
              </div>
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>Emoji</Label>
                <Input
                  value={formData.emoji}
                  onChange={e => setFormData(d => ({ ...d, emoji: e.target.value }))}
                  placeholder="🔴"
                  className="rounded-xl border-pink-200 mt-1 text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>สีจาน (Hex)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.color_hex}
                    onChange={e => setFormData(d => ({ ...d, color_hex: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-pink-200 cursor-pointer"
                  />
                  <Input
                    value={formData.color_hex}
                    onChange={e => setFormData(d => ({ ...d, color_hex: e.target.value }))}
                    className="flex-1 rounded-xl border-pink-200 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>ลำดับ</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData(d => ({ ...d, sort_order: Number(e.target.value) }))}
                  className="rounded-xl border-pink-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>ราคา (บาท)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData(d => ({ ...d, price: Number(e.target.value) }))}
                  className="rounded-xl border-pink-200 mt-1"
                />
              </div>
              <div>
                <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>แคลอรี่ (kcal)</Label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={e => setFormData(d => ({ ...d, calories: Number(e.target.value) }))}
                  className="rounded-xl border-pink-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="font-heading text-xs font-semibold" style={{ color: "#db2777" }}>คำอธิบาย (ไม่จำเป็น)</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                placeholder="เช่น เมนูเบสิก แซลมอน"
                className="rounded-xl border-pink-200 mt-1"
              />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#fff0f5" }}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2"
                style={{ backgroundColor: formData.color_hex, borderColor: "#fce7f3" }}
              >
                {formData.emoji}
              </div>
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: "#be185d" }}>
                  {formData.color_name || "ชื่อสี"}
                </p>
                <p className="text-xs" style={{ color: "#f472b6" }}>
                  ฿{formData.price} · {formData.calories} kcal
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-2xl border-pink-200">
              ยกเลิก
            </Button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.color_name}
              className="px-5 py-2 rounded-2xl text-sm font-heading font-bold text-white disabled:opacity-50 transition-opacity"
              style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl" style={{ background: "#fff8fb", border: "2px solid #fce7f3" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading" style={{ color: "#be185d" }}>
              ยืนยันการลบ 🗑️
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#f472b6" }}>
              ต้องการลบจาน "{currentPlate?.emoji} {currentPlate?.color_name}" ({currentPlate?.restaurant}) หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl border-pink-200">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-2xl bg-red-500 hover:bg-red-600"
            >
              ลบเลย
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}