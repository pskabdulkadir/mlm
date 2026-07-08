/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserNode } from "../../src/core/engine/types";
import { Users, UserPlus, GitFork, Compass, Layers, Calendar, ChevronRight } from "lucide-react";
import { CAREER_LEVELS } from "../../src/core/engine/config/career-config";

interface MlmTreeVisualizerProps {
  users: UserNode[];
  selectedUser: UserNode | null;
  onSelectUser: (user: UserNode) => void;
  onRefresh: () => void;
}

export default function MlmTreeVisualizer({
  users,
  selectedUser,
  onSelectUser,
  onRefresh,
}: MlmTreeVisualizerProps) {
  const [registeringParentId, setRegisteringParentId] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPosition, setNewUserPosition] = useState<"LEFT" | "RIGHT">("LEFT");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build map of users for fast lookups
  const usersMap = new Map<string, UserNode>();
  users.forEach((u) => usersMap.set(u.id, u));

  // Find root node (typically has no parent, or id is 101)
  const rootNode = users.find((u) => !u.parent_id) || users[0];

  // Let's compute coordinate-based tree node mapping
  // We'll calculate positions dynamically using a recursive layout
  interface RenderNode {
    user: UserNode;
    x: number;
    y: number;
    depth: number;
  }

  const renderedNodes: RenderNode[] = [];
  const connections: Array<{ fromX: number; fromY: number; toX: number; toY: number }> = [];

  const canvasWidth = 800;
  const canvasHeight = 420;

  function traverseAndLayout(
    nodeId: string | null,
    x: number,
    y: number,
    spread: number,
    depth: number
  ) {
    if (!nodeId) return;
    const user = usersMap.get(nodeId);
    if (!user) return;

    renderedNodes.push({ user, x, y, depth });

    // Binary children
    if (user.left_child_id) {
      const childX = x - spread;
      const childY = y + 85;
      connections.push({ fromX: x, fromY: y, toX: childX, toY: childY });
      traverseAndLayout(user.left_child_id, childX, childY, spread * 0.48, depth + 1);
    }

    if (user.right_child_id) {
      const childX = x + spread;
      const childY = y + 85;
      connections.push({ fromX: x, fromY: y, toX: childX, toY: childY });
      traverseAndLayout(user.right_child_id, childX, childY, spread * 0.48, depth + 1);
    }

    // Fallback for unilevel view or orphaned sublines:
    // If we're not using binary or if children aren't linked via left/right,
    // let's discover children that have this node as parent_id but aren't left_child or right_child
    const unlistedChildren = users.filter(
      (u) => u.parent_id === nodeId && u.id !== user.left_child_id && u.id !== user.right_child_id
    );

    if (unlistedChildren.length > 0) {
      const count = unlistedChildren.length;
      const totalSpread = spread * 1.2;
      unlistedChildren.forEach((child, idx) => {
        const offset = count === 1 ? 0 : (idx / (count - 1) - 0.5) * totalSpread;
        const childX = x + offset;
        const childY = y + 85;
        connections.push({ fromX: x, fromY: y, toX: childX, toY: childY });
        // Give a smaller spread to further descendants
        traverseAndLayout(child.id, childX, childY, spread * 0.35, depth + 1);
      });
    }
  }

  if (rootNode) {
    // Start traversal from root at the top center
    traverseAndLayout(rootNode.id, canvasWidth / 2, 40, 180, 0);
  }

  // Handle registering a new user node
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newUserId || !newUserName || !newUserUsername || !newUserEmail) {
      setFormError("All fields are required to register an affiliate.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newUserId,
          name: newUserName,
          username: newUserUsername,
          email: newUserEmail,
          parent_id: registeringParentId,
          position: newUserPosition,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to register affiliate");
      }

      setFormSuccess(`Successfully registered ${newUserName} in the tree ledger!`);
      // Reset form
      setNewUserId("");
      setNewUserName("");
      setNewUserUsername("");
      setNewUserEmail("");
      setRegisteringParentId(null);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full" id="mlm-tree-panel">
      {/* Visualizer Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 font-display flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            Etkileşimli MLM Ağaç Görselleştiricisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerçek zamanlı görsel düğüm haritalama. İşlem sahibi olarak seçmek için herhangi bir üyeye tıklayın.
          </p>
        </div>
        <button
          onClick={() => {
            // Set the first node with empty slots as target
            const emptyParent = users.find(u => !u.left_child_id || !u.right_child_id);
            if (emptyParent) {
              setRegisteringParentId(emptyParent.id);
              setNewUserId(String(Math.max(...users.map(u => parseInt(u.id) || 100)) + 1));
            }
          }}
          className="px-3.5 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-100"
          id="btn-quick-register"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Üye Kaydet
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-[420px] overflow-hidden">
        {/* SVG Tree Canvas Area */}
        <div className="flex-1 bg-slate-50/20 relative p-4 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 overflow-auto">
          <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ width: canvasWidth, height: canvasHeight }}
            >
              {/* Draw Connector Paths with Gradient/Sleek look */}
              {connections.map((c, i) => (
                <path
                  key={i}
                  d={`M ${c.fromX} ${c.fromY} C ${c.fromX} ${(c.fromY + c.toY) / 2}, ${c.toX} ${(c.fromY + c.toY) / 2}, ${c.toX} ${c.toY}`}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="1, 1"
                  className="transition-all duration-300"
                />
              ))}
            </svg>

            {/* Render Nodes */}
            {renderedNodes.map(({ user, x, y }) => {
              const isSelected = selectedUser?.id === user.id;
              const hasEmptySlots = !user.left_child_id || !user.right_child_id;

              return (
                <div
                  key={user.id}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-10 group"
                >
                  <div
                    onClick={() => onSelectUser(user)}
                    className={`cursor-pointer w-44 rounded-xl p-2.5 transition-all duration-300 text-center shadow-xs border ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-700 text-white ring-4 ring-indigo-100 scale-105"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-800 hover:-translate-y-0.5"
                    }`}
                    id={`tree-node-${user.id}`}
                  >
                    <div className="font-semibold text-xs truncate max-w-full">
                      {user.name}
                    </div>
                    <div
                      className={`text-[10px] font-mono mt-0.5 ${
                        isSelected ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      ID: {user.id} · @{user.username}
                    </div>

                    {/* Binary Leg Volume Subtext */}
                    <div
                      className={`mt-1.5 pt-1.5 border-t flex justify-around text-[9px] font-mono ${
                        isSelected ? "border-indigo-500 text-indigo-100" : "border-slate-100 text-slate-500"
                      }`}
                    >
                      <div className="text-center px-1">
                        <span className="block text-[8px] uppercase tracking-wider opacity-75">Sol Kol</span>
                        <span className="font-semibold">{user.group_pv_left}</span>
                      </div>
                      <div className="w-[1px] bg-slate-200 self-stretch opacity-30"></div>
                      <div className="text-center px-1">
                        <span className="block text-[8px] uppercase tracking-wider opacity-75">Sağ Kol</span>
                        <span className="font-semibold">{user.group_pv_right}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context quick additions */}
                  {hasEmptySlots && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegisteringParentId(user.id);
                        setNewUserId(String(Math.max(...users.map((u) => parseInt(u.id) || 100)) + 1));
                        setNewUserPosition(!user.left_child_id ? "LEFT" : "RIGHT");
                      }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-0.5 shadow-sm transition-all duration-200 pointer-events-auto cursor-pointer"
                      title="Buraya doğrudan alt hat üyesi kaydet"
                    >
                      <UserPlus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info & Register Sidebar */}
        <div className="w-full lg:w-80 bg-slate-50/50 p-5 flex flex-col justify-between overflow-y-auto max-h-[420px] lg:max-h-none border-t lg:border-t-0">
          {registeringParentId ? (
            /* Register Affiliate Form */
            <div className="animate-fade-in flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    Yeni Üye Yerleşimi
                  </h3>
                  <button
                    onClick={() => setRegisteringParentId(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    İptal
                  </button>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 text-xs text-emerald-800">
                  Doğrudan sponsor{" "}
                  <strong>
                    {usersMap.get(registeringParentId)?.name} (ID: {registeringParentId})
                  </strong>{" "}
                  altına kaydediliyor.
                </div>

                <form onSubmit={handleRegisterUser} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Üye ID</label>
                    <input
                      type="text"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Örn. 109"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Adı Soyadı</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Örn. Rachel Adams"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        className="mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="rachel_a"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Kol Pozisyonu</label>
                      <select
                        value={newUserPosition}
                        onChange={(e) => setNewUserPosition(e.target.value as "LEFT" | "RIGHT")}
                        className="mt-1 block w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="LEFT">Sol Kol</option>
                        <option value="RIGHT">Sağ Kol</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">E-posta Adresi</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="rachel@adams.com"
                      required
                    />
                  </div>

                  {formError && (
                    <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 mt-2">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "İşleniyor..." : "Kaydı Tamamla"}
                  </button>
                </form>
              </div>
            </div>
          ) : selectedUser ? (
            /* Selected Node Information Card */
            <div className="animate-fade-in flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{selectedUser.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedUser.id}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" /> Kullanıcı Adı:
                    </span>
                    <span className="font-mono text-slate-800">@{selectedUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">E-posta:</span>
                    <span className="truncate max-w-[160px] text-slate-800">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Üst Düğüm:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedUser.parent_id ? `ID ${selectedUser.parent_id}` : "Kök (Yok)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kol Tarafı:</span>
                    <span className="font-semibold text-indigo-600">{selectedUser.position === "LEFT" ? "SOL" : selectedUser.position === "RIGHT" ? "SAĞ" : "KÖK"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Kayıt Tarihi:
                    </span>
                    <span className="text-slate-800">
                      {new Date(selectedUser.joined_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* Leg volume specs */}
                <div className="mt-4 p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl">
                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-2">
                    Kol Birikimleri (PV)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white border border-indigo-100 p-2 rounded-lg">
                      <span className="block text-[9px] text-slate-400 uppercase">Sol Kol</span>
                      <strong className="text-slate-800 font-mono text-sm">{selectedUser.group_pv_left}</strong>
                    </div>
                    <div className="bg-white border border-indigo-100 p-2 rounded-lg">
                      <span className="block text-[9px] text-slate-400 uppercase">Sağ Kol</span>
                      <strong className="text-slate-800 font-mono text-sm">{selectedUser.group_pv_right}</strong>
                    </div>
                  </div>
                </div>

                {/* Kariyer İlerleme Çubuğu (Nefis Mertebeleri Career Progress Bar) */}
                <div className="mt-4 p-3 bg-amber-50/40 border border-amber-100/50 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Kariyer Gelişim Durumu
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded">
                      {CAREER_LEVELS[selectedUser.career_level - 1]?.name || "Seviye " + selectedUser.career_level}
                    </span>
                  </div>

                  {selectedUser.career_level < 10 ? (() => {
                    const nextLevel = selectedUser.career_level + 1;
                    const nextConfig = CAREER_LEVELS[nextLevel - 1];
                    const currentRefs = selectedUser.direct_references || 0;
                    const currentCiro = selectedUser.total_team_ciro || 0;
                    const targetRefs = nextConfig.minDirectRefs;
                    const targetCiro = nextConfig.minTeamCiro;

                    const refsPercent = Math.min(100, (currentRefs / targetRefs) * 100);
                    const ciroPercent = Math.min(100, (currentCiro / targetCiro) * 100);
                    
                    const refsLeft = Math.max(0, targetRefs - currentRefs);
                    const ciroLeft = Math.max(0, targetCiro - currentCiro);

                    return (
                      <div className="space-y-2.5 text-[11px]">
                        <div className="text-slate-500 font-medium flex justify-between items-center">
                          <span>Hedef Seviye: <strong className="text-slate-700">{nextConfig.name}</strong></span>
                          <span className="text-[9px] font-mono font-bold bg-slate-200/50 px-1 rounded">Lvl {nextLevel}</span>
                        </div>

                        {/* Direct References Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>Doğrudan Referans</span>
                            <span className="font-mono text-slate-700 font-bold">{currentRefs} / {targetRefs}</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${refsPercent}%` }}
                            ></div>
                          </div>
                          {refsLeft > 0 ? (
                            <span className="text-[9px] text-amber-700 font-semibold block">⚠️ {refsLeft} referans daha gerekiyor</span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-semibold block">✓ Referans hedefi tamamlandı</span>
                          )}
                        </div>

                        {/* Team Ciro Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>Unilevel Toplam Ciro</span>
                            <span className="font-mono text-slate-700 font-bold">${currentCiro.toLocaleString()} / ${targetCiro.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${ciroPercent}%` }}
                            ></div>
                          </div>
                          {ciroLeft > 0 ? (
                            <span className="text-[9px] text-amber-700 font-semibold block">⚠️ ${ciroLeft.toLocaleString()} USD ciro daha gerekiyor</span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-semibold block">✓ Ciro hedefi tamamlandı</span>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                      <span className="text-[11px] text-indigo-700 font-black block">✨ İNSAN-I KAMİL ✨</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Tüm kariyer basamakları başarıyla tamamlandı.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="bg-slate-100 border border-slate-200/50 text-slate-600 rounded-lg p-2 text-[10px] leading-relaxed">
                  💡 Bu kullanıcı şu anda Hak Ediş Oluşturucu bloğunda **İşlem Sahibi** olarak yüklüdür. Gerçek zamanlı hak ediş bonuslarını simüle etmek için işlemleri gerçekleştirin!
                </div>
              </div>
            </div>
          ) : (
            /* No user selected default state */
            <div className="flex flex-col items-center justify-center text-center py-10 h-full text-slate-400">
              <Compass className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-medium">Hiçbir Üye Seçilmedi</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Onları seçmek, puan kayıtlarını yapılandırmak ve simüle edilmiş hak ediş ödemelerini çalıştırmak için ağaç şemasındaki bir karta tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
