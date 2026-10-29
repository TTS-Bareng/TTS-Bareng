import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Sparkles,
  Shield,
  Ban,
  RefreshCw,
  PenTool,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { revenueCatService, IAP_PRODUCT_IDS, type VipPlan } from '../lib/revenueCatService';
import { haptic } from '../lib/haptics';

interface PlanOption {
  id: VipPlan;
  title: string;
  price: string;
  approxIdr?: string;
  approxUsd?: string;
  period: string;
  subtext: string;
  badge?: string;
  isPopular?: boolean;
}

const VIP_PLANS: PlanOption[] = [
  {
    id: 'annual',
    title: 'Tahunan',
    price: 'Rp 199.000',
    approxIdr: 'Rp 199.000',
    approxUsd: '≈ $12.99',
    period: '/ tahun',
    subtext: 'Hemat 40% (~Rp 16.583/bln)',
    badge: 'HEMAT 40%',
    isPopular: true,
  },
  {
    id: 'monthly',
    title: 'Bulanan',
    price: 'Rp 29.000',
    approxIdr: 'Rp 29.000',
    approxUsd: '≈ $1.99',
    period: '/ bulan',
    subtext: 'Fleksibel bayar tiap bulan',
  },
  {
    id: 'lifetime',
    title: 'Seumur Hidup',
    price: 'Rp 499.000',
    approxIdr: 'Rp 499.000',
    approxUsd: '≈ $32.99',
    period: 'sekali bayar',
    subtext: 'Akses VIP selamanya tanpa tagihan lagi',
    badge: 'SEKALI BAYAR',
  },
];

export const VipSubscriptionModal: React.FC = () => {
  const {
    isVipModalOpen,
    closeVipModal,
    isVip,
    setIsVip,
    openVipSuccessModal,
    openCancelSubModal,
    openLegalModal,
    openSachetModal,
    showGlobalToast,
    hapticEnabled,
  } = useGameStore();

  const [selectedPlan, setSelectedPlan] = useState<VipPlan>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isVipModalOpen) return;
    revenueCatService.getDynamicPriceMap().then((prices) => {
      if (prices && Object.keys(prices).length > 0) {
        setDynamicPrices(prices);
      }
    }).catch(() => {});
  }, [isVipModalOpen]);

  if (!isVipModalOpen) return null;

  const resolvedPlans = VIP_PLANS.map((p) => {
    const prodId =
      p.id === 'annual'
        ? IAP_PRODUCT_IDS.vipAnnual
        : p.id === 'monthly'
        ? IAP_PRODUCT_IDS.vipMonthly
        : IAP_PRODUCT_IDS.vipLifetime;
    const dynamicPrice = dynamicPrices[prodId];
    return dynamicPrice ? { ...p, price: dynamicPrice } : p;
  });

  const currentPlan = resolvedPlans.find((p) => p.id === selectedPlan) || resolvedPlans[0];

  const handlePurchaseVip = async () => {
    try {
      setIsProcessing(true);
      const res = await revenueCatService.purchaseVipPlan(selectedPlan);

      if (res.success || res.entitlementUnlocked) {
        setIsVip(true);
        closeVipModal();

        // Calculate friendly expiry date (1 month or 1 year) or undefined for lifetime
        let expiryFormatted: string | undefined;
        if (selectedPlan === 'annual') {
          const expiryDateObj = new Date();
          expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
          expiryFormatted = expiryDateObj.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        } else if (selectedPlan === 'monthly') {
          const expiryDateObj = new Date();
          expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
          expiryFormatted = expiryDateObj.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        } else {
          // Lifetime: No expiration date
          expiryFormatted = undefined;
        }

        openVipSuccessModal({
          planName: currentPlan.title,
          expiryDate: expiryFormatted,
        });
      } else if (res.cancelled) {
        showGlobalToast('Langganan dibatalkan.');
      } else if (res.error) {
        showGlobalToast(res.error);
      }
    } catch (err: any) {
      showGlobalToast(err?.message || 'Gagal memproses langganan VIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsProcessing(true);
      const res = await revenueCatService.restorePurchases();
      if (res.isVip) {
        setIsVip(true);
        closeVipModal();
        const details = await revenueCatService.getVipExpiryDetails();
        const isLifetimeProduct = details.productIdentifier?.includes('lifetime');
        openVipSuccessModal({
          planName: isLifetimeProduct ? 'TTS Pass VIP Seumur Hidup' : 'Keanggotaan VIP Apple ID',
          expiryDate: isLifetimeProduct ? undefined : details.expirationDateFormatted,
          isRestore: true,
        });
      } else if (res.success) {
        setIsVip(false);
        showGlobalToast('Tidak ada langganan aktif yang ditemukan pada akun Apple ID ini.', 3500);
      } else {
        showGlobalToast(res.error || 'Gagal memulihkan pembelian.', 3500);
      }
    } catch {
      showGlobalToast('Gagal memulihkan pembelian.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchToSachet = () => {
    closeVipModal();
    openSachetModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(12px,env(safe-area-inset-top))] pb-[max(12px,env(safe-area-inset-bottom))] select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          onClick={closeVipModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Card (Pure Liquid Glass - Adaptive to Active Theme) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[400px] max-h-[92vh] rounded-[32px] p-4 sm:p-5 flex flex-col items-center gap-3 shadow-2xl z-10 border border-black/10 dark:border-white/15 bg-[var(--bg-card)]/95 backdrop-blur-2xl liquid-glass-card overflow-y-auto no-scrollbar text-center"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[var(--accent-light)] blur-3xl pointer-events-none opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[var(--accent-main)]/10 blur-3xl pointer-events-none opacity-40" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeVipModal}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Mascot with Theme Crown */}
          <div className="relative w-20 h-20 mt-0.5 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 6, scale: 0.92 }}
              animate={{ y: [0, -3, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              src={MASCOTS.crosswordChampion}
              alt="TTS Pass VIP Champion"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
            {/* Animated Crown Badge matching Theme */}
            <motion.div
              animate={{ rotate: [-4, 4, -4], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute -top-1.5 -right-1 w-7 h-7 rounded-full shadow-md border border-white/20 flex items-center justify-center"
              style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
            >
              <Crown className="w-3.5 h-3.5 fill-current stroke-current" />
            </motion.div>
          </div>

          {/* Header & Title */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>PASPOR ANGGOTA EKSKLUSIF</span>
            </span>
            <h3 className="text-[19px] font-black tracking-tight text-[var(--text-primary)] mt-1.5 leading-tight">
              TTS Bareng VIP Pass
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug px-1">
              Kreasi tanpa batas, mahkota juara, dan proteksi streak eksklusif.
            </p>
          </div>

          {/* VIP Benefits (Compact Bento Cards) */}
          <div className="w-full rounded-2xl border border-[var(--accent-main)]/20 bg-black/20 dark:bg-black/30 p-2.5 grid grid-cols-2 gap-2 text-left">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <PenTool className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Studio Kreator
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight block truncate">
                  Bebas buat TTS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Mahkota Juara
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight block truncate">
                  Lencana di Arena
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Proteksi Streak
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight block truncate">
                  Anti-turun ELO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Bebas Iklan
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight block truncate">
                  100% tanpa jeda
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Plans Selector */}
          {isVip ? (
            <div className="w-full flex flex-col gap-2 mt-1">
              <div className="w-full py-3 px-4 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] font-bold text-[12.5px] flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 fill-current" />
                <span>Status VIP Anda Saat Ini Aktif</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeVipModal();
                  openCancelSubModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--accent-main)]/25 text-[var(--accent-main)] bg-[var(--accent-light)] hover:opacity-90 font-bold text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer tactile-active transition-all"
              >
                <span>Kelola atau Batalkan Langganan</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2 mt-1">
              {resolvedPlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      if (hapticEnabled) haptic.selection();
                      setSelectedPlan(plan.id);
                    }}
                    className={`relative w-full rounded-2xl p-2.5 sm:p-3 text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'border-2 border-[var(--accent-main)] bg-[var(--accent-light)]/40 dark:bg-[var(--accent-light)]/20 shadow-xs ring-1 ring-[var(--accent-main)]/30'
                        : 'border-black/10 dark:border-white/10 bg-black/20 dark:bg-black/30 hover:bg-black/25 dark:hover:bg-black/40'
                    }`}
                  >
                    {/* Badge for Popular / Lifetime */}
                    {plan.badge && (
                      <span
                        className="absolute -top-2 right-3 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs"
                        style={
                          isSelected
                            ? {
                                background: 'var(--accent-grad)',
                                color: 'var(--accent-contrast)',
                                borderColor: 'transparent',
                              }
                            : {
                                background: 'var(--accent-light)',
                                color: 'var(--accent-main)',
                                borderColor: 'var(--accent-main)',
                              }
                        }
                      >
                        {plan.badge}
                      </span>
                    )}

                    {/* Radio & Title Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 text-[var(--accent-main)]">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 fill-current text-white stroke-[2.5]" />
                        ) : (
                          <Circle className="w-4 h-4 stroke-[1.8] text-[var(--text-secondary)] opacity-40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[12px] font-black text-[var(--text-primary)] block leading-tight">
                          {plan.title}
                        </span>
                        <span className="text-[9.5px] text-[var(--text-secondary)] block leading-tight mt-0.5 truncate">
                          {plan.subtext}
                        </span>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-mono font-black text-[12.5px] text-[var(--text-primary)] block leading-tight">
                        {plan.price}
                      </span>
                      <span className="text-[8.5px] font-semibold text-[var(--text-secondary)] block leading-tight">
                        {plan.period}
                      </span>
                      {plan.price.includes('$') && plan.approxIdr && (
                        <span className="text-[7.5px] font-bold text-[var(--accent-main)] block leading-tight mt-0.5">
                          ≈ {plan.approxIdr}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Main CTA Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePurchaseVip}
                className="w-full mt-1 py-3 px-4 rounded-2xl font-black text-[13px] cursor-pointer tactile-active shadow-md flex items-center justify-between border border-white/20 disabled:opacity-50 transition-all"
                style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
              >
                <div className="flex items-center gap-2">
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 fill-current stroke-current" />
                  )}
                  <span>
                    {isProcessing
                      ? 'Menghubungkan StoreKit...'
                      : selectedPlan === 'lifetime'
                      ? 'Beli Akses Seumur Hidup'
                      : `Mulai Langganan ${currentPlan.title}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-[12.5px] block leading-tight">
                    {currentPlan.price}
                  </span>
                  {currentPlan.price.includes('$') && currentPlan.approxIdr && (
                    <span className="text-[8px] font-semibold opacity-85 block leading-tight">
                      ≈ {currentPlan.approxIdr}
                    </span>
                  )}
                </div>
              </button>

              {/* Apple StoreKit Indonesian E-Wallet Support Note */}
              <div className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-xl bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[8.5px] text-[var(--text-secondary)] mt-0.5">
                <Shield className="w-3 h-3 text-[var(--accent-main)] shrink-0" />
                <span>
                  Transaksi diproses aman melalui metode pembayaran resmi <strong>Akun Apple ID</strong>
                </span>
              </div>

              {/* Sachet Alternative Option */}
              <button
                type="button"
                onClick={handleSwitchToSachet}
                className="text-[10.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 mt-0.5"
              >
                <span>Cuma butuh 1x kreasi?</span>
                <span className="text-[var(--accent-main)] underline underline-offset-2">
                  Cek Paket Sachet Rp 5.000
                </span>
              </button>
            </div>
          )}

          {/* Apple Mandatory StoreKit Terms & Legal Links */}
          <div className="w-full flex flex-col gap-1 pt-1.5 border-t border-black/5 dark:border-white/10 text-[8.5px] text-[var(--text-secondary)] leading-tight">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRestore}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                Pulihkan Pembelian
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                Syarat Layanan
              </button>
              <span>•</span>
              <a
                href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                Apple EULA
              </a>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalModal('privacy')}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                Kebijakan Privasi
              </button>
            </div>
            <p className="text-[7.5px] text-[var(--text-secondary)]/70 mt-0.5">
              Langganan diperpanjang otomatis melalui akun Apple ID Anda dan dapat dibatalkan sewaktu-waktu di Pengaturan Akun Apple ID minimal 24 jam sebelum masa berlangganan berakhir.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipSubscriptionModal;
