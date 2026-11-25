import React, { useEffect, useRef } from 'react';
import availableAssets from '../../../data/availableAssets.json';
import {
  DEPARTMENTS,
  BRANCHES,
  getDeptStarInfo,
  getDeptSingleLevelCost,
  formatMoney
} from './tycoonConfig';
import {
  getParkingSlotCoord,
  getCheckoutLaneCoord,
  stepSimulation
} from './tycoonEngine';

const TILE_W = 36;
const TILE_H = 18;
const INK = '#4A3525';

// Ánh xạ ID công trình sang tên file Blender .webp trong public/assets/supermarket/
const DEPT_SPRITE_ID = {
  bakery: 'stall_bakery',
  produce: 'stall_produce',
  butcher: 'stall_meat',
  seafood: 'stall_fish',
  perfume: 'stall_perfume',
  electronics: 'stall_electronics'
};

function drawAnchoredSprite(ctx, img, anchorX, anchorY, targetW) {
  if (!img || !img.complete || !img.naturalWidth) return false;
  const aspect = img.naturalHeight / img.naturalWidth;
  const drawW = targetW;
  const drawH = targetW * aspect;
  ctx.drawImage(img, anchorX - drawW / 2, anchorY - drawH, drawW, drawH);
  return true;
}

function iso(gx, gy, gz = 0) {
  return {
    x: (gx - gy) * TILE_W,
    y: (gx + gy) * TILE_H - gz
  };
}

function invIso(wx, wy) {
  const gx = (wx / TILE_W + wy / TILE_H) * 0.5;
  const gy = (wy / TILE_H - wx / TILE_W) * 0.5;
  return { gx, gy };
}

function drawIsoPoly(ctx, pts, fill, stroke = null, lineWidth = 1.6) {
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

function drawIsoRect(ctx, gx, gy, gw, gh, fill, stroke = null, lw = 1.4) {
  const p1 = iso(gx, gy);
  const p2 = iso(gx + gw, gy);
  const p3 = iso(gx + gw, gy + gh);
  const p4 = iso(gx, gy + gh);
  drawIsoPoly(ctx, [p1, p2, p3, p4], fill, stroke, lw);
}

function drawIsoBox(ctx, gx, gy, gw, gh, height, topCol, leftCol, rightCol, stroke = INK) {
  const b1 = iso(gx, gy, 0);
  const b2 = iso(gx + gw, gy, 0);
  const b3 = iso(gx + gw, gy + gh, 0);
  const b4 = iso(gx, gy + gh, 0);
  const t1 = iso(gx, gy, height);
  const t2 = iso(gx + gw, gy, height);
  const t3 = iso(gx + gw, gy + gh, height);
  const t4 = iso(gx, gy + gh, height);

  // Mặt trái (y = gy + gh)
  drawIsoPoly(ctx, [b4, b3, t3, t4], leftCol, stroke, 1.5);
  // Mặt phải (x = gx + gw)
  drawIsoPoly(ctx, [b2, b3, t3, t2], rightCol, stroke, 1.5);
  // Mặt trên
  drawIsoPoly(ctx, [t1, t2, t3, t4], topCol, stroke, 1.5);
}

function drawPillLabel(ctx, x, y, text, bg = '#FFFDF9', fg = INK, border = INK, fontSize = 10) {
  ctx.font = `900 ${fontSize}px Nunito, sans-serif`;
  const w = ctx.measureText(text).width + 14;
  const h = fontSize + 9;
  const rx = x - w / 2;
  const ry = y - h / 2;

  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.5);
}

export default function IsometricCanvas({
  worldRef,
  stateRef,
  isCoopShift,
  isVipBoost,
  zoom = 0.92,
  selectedTarget = null,
  onSelectTarget,
  onCashEarned,
  onVipArrive,
  onTapDeliveryVan,
  onTapVipCar
}) {
  const canvasRef = useRef(null);
  const spritesRef = useRef({});
  const camRef = useRef({
    x: 40,
    y: -155,
    vx: 0,
    vy: 0,
    zoom,
    dragging: false,
    movedDist: 0,
    lastX: 0,
    lastY: 0,
    pinchDist: 0
  });

  useEffect(() => {
    camRef.current.zoom = zoom;
  }, [zoom]);

  // Preload các sprite Blender Isometric .webp có sẵn trong public/assets/supermarket/
  useEffect(() => {
    const list = availableAssets?.supermarket || [];
    if (!Array.isArray(list) || list.length === 0) return;
    const base = import.meta.env.BASE_URL || './';
    const normBase = base.endsWith('/') ? base : `${base}/`;
    const cache = spritesRef.current;

    list.forEach((assetId) => {
      if (cache[assetId]) return;
      const img = new Image();
      img.src = `${normBase}assets/supermarket/${assetId}.webp`;
      cache[assetId] = img;
    });
  }, []);

  const propsRef = useRef({
    isCoopShift,
    isVipBoost,
    selectedTarget,
    onSelectTarget,
    onCashEarned,
    onVipArrive,
    onTapDeliveryVan,
    onTapVipCar
  });
  propsRef.current = {
    isCoopShift,
    isVipBoost,
    selectedTarget,
    onSelectTarget,
    onCashEarned,
    onVipArrive,
    onTapDeliveryVan,
    onTapVipCar
  };

  // Hit-test chính xác tọa độ Isometric chạm vào công trình nào
  const handleTapAtScreen = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const cam = camRef.current;
    const wx = (sx - rect.width / 2) / cam.zoom - cam.x;
    const wy = (sy - rect.height / 2) / cam.zoom - cam.y;
    const { gx, gy } = invIso(wx, wy);

    const { onSelectTarget: selectFn, onTapDeliveryVan: tapVan, onTapVipCar: tapVip } = propsRef.current;
    const world = worldRef.current;

    // 1. Xe Limousine VIP
    if (world.vipActive && Math.hypot(gx - 5.5, gy - 12.6) < 1.35) {
      if (tapVip) tapVip();
      return;
    }

    // 2. Xe tải giao hàng (góc trái mặt tiền)
    if (gx >= -0.6 && gx <= 2.3 && gy >= 8.3 && gy <= 11.4) {
      if (world.deliveryProgress >= 1 && tapVan) {
        tapVan();
      } else if (selectFn) {
        selectFn({ type: 'delivery' });
      }
      return;
    }

    // 3. 6 Gian hàng bên trong siêu thị
    for (const dept of DEPARTMENTS) {
      if (Math.abs(gx - dept.gx) <= 1.35 && Math.abs(gy - dept.gy) <= 1.25) {
        if (selectFn) selectFn({ type: 'department', id: dept.id });
        return;
      }
    }

    // 4. Khu Quầy Thu Ngân (gy: 5.8..7.6)
    if (gx >= 0.4 && gx <= 9.2 && gy >= 5.7 && gy <= 7.7) {
      if (selectFn) selectFn({ type: 'checkout' });
      return;
    }

    // 5. Bãi Đỗ Xe (gx: 2.3..10.2, gy: 8.3..12.8)
    if (gx >= 2.2 && gx <= 10.4 && gy >= 8.3 && gy <= 12.8) {
      if (selectFn) selectFn({ type: 'parking' });
      return;
    }

    // Chạm ra ngoài -> đóng thẻ nâng cấp
    if (selectFn) selectFn(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId = 0;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const state = stateRef.current;
      const world = worldRef.current;
      const cam = camRef.current;
      const {
        isCoopShift: coop,
        isVipBoost: vipBoost,
        selectedTarget: sel,
        onCashEarned: onEarn,
        onVipArrive: onVip
      } = propsRef.current;

      // Bước mô phỏng
      stepSimulation(world, state, dt, {
        isCoopShift: coop,
        isVipBoost: vipBoost,
        onCashEarned: onEarn,
        onVipArrive: onVip
      });

      // Quán tính kéo bản đồ
      if (!cam.dragging) {
        cam.x += cam.vx * dt;
        cam.y += cam.vy * dt;
        cam.vx *= Math.pow(0.08, dt);
        cam.vy *= Math.pow(0.08, dt);
      }
      // Giới hạn khung bản đồ để không trượt mất siêu thị
      cam.x = Math.max(-230, Math.min(310, cam.x));
      cam.y = Math.max(-360, Math.min(60, cam.y));

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);

      // Nền cỏ xanh tươi sáng kiểu Codigames
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#D4F0C8');
      skyGrad.addColorStop(1, '#AEE0A0');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(cam.x, cam.y);

      const branch = BRANCHES[state.branchIndex || 0] || BRANCHES[0];

      // 1. NỀN VỈA HÈ, ĐƯỜNG NHỰA & BÃI ĐỖ XE
      drawIsoRect(ctx, -2.5, 12.6, 15.5, 2.0, '#6B7280', '#4B5563', 1.4);
      // Vạch kẻ đường trắng đứt khúc
      for (let rx = -1.8; rx < 12; rx += 1.4) {
        drawIsoRect(ctx, rx, 13.52, 0.7, 0.14, '#FFFDF9');
      }

      // Sân bãi đỗ xe bê tông sáng
      drawIsoRect(ctx, 2.3, 8.4, 7.8, 4.2, '#DDE3EA', '#94A3B8', 1.8);
      if (sel?.type === 'parking') {
        drawIsoRect(ctx, 2.3, 8.4, 7.8, 4.2, 'rgba(255,224,130,0.28)', '#FF9B71', 3);
      }

      // Vẽ 24 ô đỗ xe
      const unlockedSlots = state.parking.slots || 4;
      for (let i = 0; i < 24; i++) {
        const sp = getParkingSlotCoord(i);
        const isUnlocked = i < unlockedSlots;
        drawIsoRect(
          ctx,
          sp.gx - 0.36,
          sp.gy - 0.44,
          0.72,
          0.88,
          isUnlocked ? '#EEF2F6' : '#CBD5E1',
          isUnlocked ? '#FFFFFF' : '#94A3B8',
          isUnlocked ? 1.8 : 1
        );
      }

      // Khu sân Xe Tải Giao Hàng (góc trái mặt tiền)
      drawIsoRect(ctx, -0.3, 8.6, 2.3, 2.6, '#E2E8F0', '#94A3B8', 1.6);
      if (sel?.type === 'delivery') {
        drawIsoRect(ctx, -0.3, 8.6, 2.3, 2.6, 'rgba(255,224,130,0.32)', '#FF9B71', 3);
      }

      // 2. MẶT BẰNG SÀN SIÊU THỊ (gx: 0..9.5, gy: 0..7.8)
      drawIsoRect(ctx, 0, 0, 9.5, 7.8, '#FFFDF9', INK, 2.2);
      // Lưới gạch sáng thanh lịch
      ctx.strokeStyle = 'rgba(74,53,37,0.06)';
      ctx.lineWidth = 1;
      for (let gx = 1; gx < 9.5; gx++) {
        const a = iso(gx, 0);
        const b = iso(gx, 7.8);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let gy = 1; gy < 7.8; gy++) {
        const a = iso(0, gy);
        const b = iso(9.5, gy);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Tường hậu 2 mặt (trên-trái & trên-phải) chuẩn màu Codigames
      drawIsoBox(ctx, 0, -0.25, 9.5, 0.25, 36, branch.roofColor, '#E2F1FA', '#C7E3F5', INK);
      drawIsoBox(ctx, -0.25, 0, 0.25, 7.8, 36, branch.roofColor, '#D4EAF7', '#B9DCF2', INK);

      // Biển hiệu MOCHI MART trên tường hậu
      const signPos = iso(4.75, -0.1, 46);
      drawPillLabel(ctx, signPos.x, signPos.y, `MOCHI MART • ${branch.name.toUpperCase()}`, branch.roofColor, '#FFFDF9', INK, 10.5);

      // 3. 6 GIAN HÀNG ISOMETRIC (DEPARTMENTS)
      DEPARTMENTS.forEach((dept) => {
        const ds = state.departments[dept.id] || { level: 0, staff: 1 };
        const isSelected = sel?.type === 'department' && sel.id === dept.id;
        const { stars } = getDeptStarInfo(ds.level);

        // Nền gian hàng
        drawIsoRect(
          ctx,
          dept.gx - 1.2,
          dept.gy - 0.95,
          2.4,
          1.9,
          ds.level > 0 ? dept.accent : '#EFECE6',
          isSelected ? '#FF9B71' : 'rgba(74,53,37,0.22)',
          isSelected ? 3.2 : 1.3
        );

        if (ds.level <= 0) {
          // Chưa mở khóa -> rào công trường + biển giá mở khóa
          drawIsoBox(ctx, dept.gx - 0.9, dept.gy - 0.5, 1.8, 1.0, 12, '#FFE066', '#E8A838', '#C98A28', INK);
          const lbl = iso(dept.gx, dept.gy, 26);
          const cost = getDeptSingleLevelCost(dept, 0, state.branchIndex || 0);
          drawPillLabel(ctx, lbl.x, lbl.y - 8, dept.name, '#FFFDF9', INK, INK, 9.5);
          drawPillLabel(ctx, lbl.x, lbl.y + 10, `Mở $${formatMoney(cost)}`, '#88C9A1', INK, INK, 9.5);
        } else {
          const spriteKey = DEPT_SPRITE_ID[dept.id];
          const spriteImg = spriteKey ? spritesRef.current[spriteKey] : null;
          const anchor = iso(dept.gx, dept.gy + 0.45, 0);
          const drewSprite = drawAnchoredSprite(ctx, spriteImg, anchor.x, anchor.y, 126);

          if (!drewSprite) {
            // Fallback: Quầy kệ 3D Isometric mặc định
            drawIsoBox(ctx, dept.gx - 0.95, dept.gy - 0.55, 1.9, 0.85, 18, dept.color, '#E6BD8E', '#C9986B', INK);
            if (stars >= 1) {
              drawIsoBox(ctx, dept.gx - 0.85, dept.gy - 0.82, 1.7, 0.25, 28, '#FFFDF9', dept.color, dept.color, INK);
            }
            if (stars >= 2) {
              drawIsoBox(ctx, dept.gx - 0.45, dept.gy + 0.4, 0.9, 0.35, 13, '#FFE082', dept.color, dept.color, INK);
            }
          }

          // Nhân viên đứng bán trong gian hàng (1..4 người)
          for (let st = 0; st < (ds.staff || 1); st++) {
            const sx = dept.gx - 0.6 + st * 0.42;
            const sy = dept.gy - 0.72;
            const sp = iso(sx, sy, 10);
            ctx.beginPath();
            ctx.arc(sp.x, sp.y - 6, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFDF9';
            ctx.fill();
            ctx.strokeStyle = INK;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(sp.x, sp.y + 1, 5.5, Math.PI, 0);
            ctx.fillStyle = dept.color;
            ctx.fill();
            ctx.stroke();
          }

          // Nhãn tên + cấp độ + sao
          const lbl = iso(dept.gx, dept.gy - 0.6, stars >= 1 ? 39 : 30);
          const starStr = stars > 0 ? ` ★${stars}` : '';
          drawPillLabel(ctx, lbl.x, lbl.y, `${dept.name} Lv.${ds.level}${starStr}`, '#FFFDF9', INK, INK, 9);
        }
      });

      // 4. HÀNG QUẦY THU NGÂN (1 -> 6 làn)
      if (sel?.type === 'checkout') {
        drawIsoRect(ctx, 0.9, 6.0, 7.8, 1.4, 'rgba(255,224,130,0.32)', '#FF9B71', 3);
      }
      const lanes = state.checkout.lanes || 1;
      const checkoutImg = spritesRef.current.checkout_counter || null;
      for (let l = 0; l < 6; l++) {
        const lp = getCheckoutLaneCoord(l);
        if (l < lanes) {
          const cAnchor = iso(lp.gx, lp.gy + 0.32, 0);
          const drewCheckout = drawAnchoredSprite(ctx, checkoutImg, cAnchor.x, cAnchor.y, 62);
          if (!drewCheckout) {
            drawIsoBox(ctx, lp.gx - 0.35, lp.gy - 0.25, 0.7, 0.55, 13, '#88C9A1', '#E6BD8E', '#C9986B', INK);
          }
          // Thu ngân ngồi trực
          const cp = iso(lp.gx + 0.18, lp.gy + 0.12, 12);
          ctx.beginPath();
          ctx.arc(cp.x, cp.y - 5, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFE082';
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        } else {
          // Ô thu ngân chưa mở
          drawIsoRect(ctx, lp.gx - 0.32, lp.gy - 0.22, 0.64, 0.46, 'rgba(148,163,184,0.22)', '#94A3B8', 1.2);
        }
      }

      // Cửa kính trượt tự động mặt tiền
      const slide = world.doorOpenAmount * 0.55;
      drawIsoBox(ctx, 4.1 - slide, 7.68, 0.65, 0.12, 22, '#CFEAF7', '#9AD6F5', '#78C2E6', INK);
      drawIsoBox(ctx, 4.85 + slide, 7.68, 0.65, 0.12, 22, '#CFEAF7', '#9AD6F5', '#78C2E6', INK);

      // 5. XE TẢI GIAO HÀNG (DELIVERY VAN)
      const vanImg = spritesRef.current.delivery_van || null;
      const vanAnchor = iso(world.deliveryVanX + 0.1, 10.35, 0);
      const drewVan = drawAnchoredSprite(ctx, vanImg, vanAnchor.x, vanAnchor.y, 96);
      if (!drewVan) {
        drawIsoBox(ctx, world.deliveryVanX - 0.55, 9.6, 1.3, 0.75, 19, '#FFFDF9', '#FF9B71', '#E87A4D', INK);
      }
      const vanTop = iso(world.deliveryVanX + 0.1, 9.95, 28);
      if (world.deliveryProgress >= 1 && !world.deliveryDispatching) {
        const bounce = Math.sin(now / 180) * 4;
        drawPillLabel(ctx, vanTop.x, vanTop.y - 10 + bounce, 'GIAO HÀNG! +$$', '#FFE066', INK, INK, 9.5);
      } else {
        // Thanh tiến độ nhỏ trên nóc xe tải
        ctx.fillStyle = '#FFFDF9';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(vanTop.x - 20, vanTop.y - 4, 40, 7, 3.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#88C9A1';
        ctx.beginPath();
        ctx.roundRect(vanTop.x - 19, vanTop.y - 3, 38 * world.deliveryProgress, 5, 2.5);
        ctx.fill();
      }

      // 6. XE LIMOUSINE VIP (nếu đang đậu trước cửa)
      if (world.vipActive) {
        drawIsoBox(ctx, 4.5, 12.2, 2.1, 0.65, 14, '#FFE066', '#E5B437', '#C9961D', INK);
        const vp = iso(5.55, 12.5, 28 + Math.sin(now / 200) * 3);
        drawPillLabel(ctx, vp.x, vp.y, 'VIP LIMO! CHẠM', '#FFE066', INK, INK, 9.5);
      }

      // 7. XE HƠI & KHÁCH HÀNG (sắp xếp theo độ sâu gx + gy)
      const actors = [
        ...world.cars.map((c) => ({ kind: 'car', depth: c.gx + c.gy, obj: c })),
        ...world.shoppers.map((s) => ({ kind: 'shopper', depth: s.gx + s.gy, obj: s }))
      ].sort((a, b) => a.depth - b.depth);

      actors.forEach(({ kind, obj }) => {
        if (kind === 'car') {
          drawIsoBox(ctx, obj.gx - 0.34, obj.gy - 0.38, 0.68, 0.76, 11, obj.color, obj.color, '#4A3525', INK);
          drawIsoBox(ctx, obj.gx - 0.22, obj.gy - 0.22, 0.44, 0.44, 16, '#DFF3FA', '#BBE3F5', '#95CCE6', INK);
          if (obj.bubble && obj.bubbleTimer > 0) {
            const bp = iso(obj.gx, obj.gy, 26);
            drawPillLabel(ctx, bp.x, bp.y, obj.bubble, '#FF5A5F', '#FFFDF9', INK, 9);
          }
        } else {
          const sp = iso(obj.gx, obj.gy, 0);
          // Bóng mềm
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y + 1, 6, 3, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(74,53,37,0.22)';
          ctx.fill();
          // Thân khách hàng
          ctx.beginPath();
          ctx.roundRect(sp.x - 4.5, sp.y - 12, 9, 11, 4);
          ctx.fillStyle = obj.color;
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          // Đầu tròn
          ctx.beginPath();
          ctx.arc(sp.x, sp.y - 15.5, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFE4C4';
          ctx.fill();
          ctx.stroke();
          // Xe đẩy siêu thị mini
          if (obj.hasCart) {
            ctx.fillStyle = '#CBD5E1';
            ctx.strokeStyle = INK;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.rect(sp.x + 4, sp.y - 8, 7, 5);
            ctx.fill();
            ctx.stroke();
          }
          // Vòng tròn tiến độ khi đang mua hàng hoặc thanh toán
          if (obj.state === 'shopping' || (obj.state === 'checkout' && obj.progress > 0)) {
            const pct = Math.min(1, obj.progress / Math.max(0.1, obj.maxProgress));
            ctx.beginPath();
            ctx.arc(sp.x, sp.y - 25, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFDF9';
            ctx.fill();
            ctx.strokeStyle = INK;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sp.x, sp.y - 25);
            ctx.arc(sp.x, sp.y - 25, 4.8, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = obj.state === 'checkout' ? '#4F9A6D' : '#FF9B71';
            ctx.fill();
          }
        }
      });

      // 8. CẢNH BÁO NÚT THẮT CỔ CHAI (Bãi đỗ xe đầy / Thu ngân ùn tắc)
      if (world.parkingFullTimer > 0) {
        const pp = iso(6.2, 10.5, 28);
        drawPillLabel(ctx, pp.x, pp.y, 'Bãi đỗ đầy! Mở thêm ô', '#FF5A5F', '#FFFDF9', INK, 9.5);
      }
      if (world.checkoutCongested) {
        const cp = iso(4.8, 6.7, 32);
        drawPillLabel(ctx, cp.x, cp.y, 'Ùn tắc thu ngân! Tuyển thêm', '#FFE066', INK, INK, 9.5);
      }

      // 9. BỤI CÔNG TRÌNH & CHỮ NỔI +$XX
      world.dustPuffs.forEach((d) => {
        const dp = iso(d.gx, d.gy, (1 - d.life / d.maxLife) * 20);
        ctx.globalAlpha = Math.max(0, d.life / d.maxLife);
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, 7 + (1 - d.life / d.maxLife) * 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8F0';
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      world.floaters.forEach((f) => {
        const fp = iso(f.gx, f.gy, 22);
        ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
        drawPillLabel(ctx, fp.x, fp.y, f.text, '#E6F7EC', f.color, '#4F9A6D', 10);
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [worldRef, stateRef]);

  // Xử lý kéo Pan mượt 1 ngón + Pinch Zoom 2 ngón + Tap chính xác
  const onPointerDown = (e) => {
    const cam = camRef.current;
    cam.dragging = true;
    cam.movedDist = 0;
    cam.lastX = e.clientX;
    cam.lastY = e.clientY;
    cam.vx = 0;
    cam.vy = 0;
  };

  const onPointerMove = (e) => {
    const cam = camRef.current;
    if (!cam.dragging) return;
    const dx = e.clientX - cam.lastX;
    const dy = e.clientY - cam.lastY;
    cam.lastX = e.clientX;
    cam.lastY = e.clientY;
    cam.movedDist += Math.hypot(dx, dy);
    cam.x += dx / cam.zoom;
    cam.y += dy / cam.zoom;
    cam.vx = (dx / cam.zoom) * 18;
    cam.vy = (dy / cam.zoom) * 18;
  };

  const onPointerUp = (e) => {
    const cam = camRef.current;
    const wasTap = cam.dragging && cam.movedDist < 10;
    cam.dragging = false;
    if (wasTap) {
      handleTapAtScreen(e.clientX, e.clientY);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const cam = camRef.current;
      if (cam.pinchDist > 0) {
        const factor = dist / cam.pinchDist;
        cam.zoom = Math.max(0.62, Math.min(1.35, cam.zoom * factor));
      }
      cam.pinchDist = dist;
    }
  };

  const onTouchEnd = () => {
    camRef.current.pinchDist = 0;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        camRef.current.dragging = false;
      }}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 w-full h-full touch-none cursor-grab active:cursor-grabbing"
    />
  );
}
