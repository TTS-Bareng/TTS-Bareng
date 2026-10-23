// ======================================================================
// REVENUECAT NATIVE IN-APP PURCHASE SERVICE (TTS BARENG)
// Handles Apple In-App Purchases (StoreKit 2) via RevenueCat SDK
// Includes graceful fallback to Mock Sandbox on Web / Dev mode
// ======================================================================

import { Capacitor } from '@capacitor/core';
import {
  Purchases,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from '@revenuecat/purchases-capacitor';

export const REVENUECAT_ENTITLEMENT_VIP = 'tts_vip';

export const IAP_PRODUCT_IDS = {
  sachetStarter: 'com.syntheticae.ttsbareng.sachet_starter',
  customTicket1: 'com.syntheticae.ttsbareng.custom_ticket_1',
  customTicket5: 'com.syntheticae.ttsbareng.custom_ticket_5',
  vipMonthly: 'com.syntheticae.ttsbareng.vip.monthly',
  vipAnnual: 'com.syntheticae.ttsbareng.vip.annual',
  vipLifetime: 'com.syntheticae.ttsbareng.vip.lifetime',
} as const;

export const REVENUECAT_PACKAGE_IDS = {
  monthly: '$rc_monthly',
  annual: '$rc_annual',
  lifetime: '$rc_lifetime',
} as const;

export type VipPlan = 'annual' | 'monthly' | 'lifetime';

export type IapProductId = (typeof IAP_PRODUCT_IDS)[keyof typeof IAP_PRODUCT_IDS];

export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  customerInfo?: CustomerInfo | null;
  error?: string;
  productId?: string;
  entitlementUnlocked?: boolean;
}

class RevenueCatService {
  private isConfigured = false;
  private isMockMode = false;
  private currentUserId: string | null = null;

  /**
   * Menginisialisasi RevenueCat Purchases SDK.
   * Menggunakan mock mode otomatis bila dijalankan di browser (web) atau tanpa API key.
   */
  public async initialize(userId?: string): Promise<boolean> {
    if (this.isConfigured && this.currentUserId === (userId || null)) {
      return true;
    }

    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';

    const apiKey =
      platform === 'ios'
        ? (import.meta.env.VITE_REVENUECAT_APPLE_KEY as string | undefined)
        : (import.meta.env.VITE_REVENUECAT_GOOGLE_KEY as string | undefined);

    // Fallback ke Mock Sandbox jika dijalankan di Web atau key belum dimasukkan
    if (!isNative || !apiKey || apiKey.trim() === '') {
      this.isMockMode = true;
      this.isConfigured = true;
      this.currentUserId = userId || null;
      console.info(
        '[RevenueCat] Berjalan dalam mode Mock Sandbox (Web / Key belum diisi).'
      );
      return true;
    }

    try {
      await Purchases.configure({
        apiKey: apiKey.trim(),
        appUserID: userId && userId !== 'guest' ? userId : undefined,
      });

      this.isMockMode = false;
      this.isConfigured = true;
      this.currentUserId = userId || null;
      console.info('[RevenueCat] Native Purchases SDK berhasil diinisialisasi.');
      return true;
    } catch (err) {
      console.warn('[RevenueCat] Inisialisasi native gagal, beralih ke mock sandbox:', err);
      this.isMockMode = true;
      this.isConfigured = true;
      return false;
    }
  }

  /**
   * Mengikat identitas pengguna Supabase ke RevenueCat.
   */
  public async logIn(userId: string): Promise<boolean> {
    if (!userId || userId === 'guest') return false;
    this.currentUserId = userId;

    if (this.isMockMode || !this.isConfigured) {
      return true;
    }

    try {
      await Purchases.logIn({ appUserID: userId });
      return true;
    } catch (err) {
      console.warn('[RevenueCat] logIn gagal:', err);
      return false;
    }
  }

  /**
   * Log out pengguna aktif dari sesi RevenueCat.
   */
  public async logOut(): Promise<void> {
    this.currentUserId = null;
    if (this.isMockMode || !this.isConfigured) return;

    try {
      await Purchases.logOut();
    } catch (err) {
      console.warn('[RevenueCat] logOut gagal:', err);
    }
  }

  /**
   * Mengambil daftar Offering aktif dari RevenueCat / App Store Connect.
   */
  public async getOffering(): Promise<PurchasesOffering | null> {
    if (this.isMockMode || !this.isConfigured) {
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current || null;
    } catch (err) {
      console.warn('[RevenueCat] getOfferings gagal:', err);
      return null;
    }
  }

  /**
   * Melakukan pembelian produk berdasarkan Product ID.
   */
  public async purchaseProduct(productId: string): Promise<PurchaseResult> {
    // Mode Mock Sandbox jika di web/dev
    if (this.isMockMode || !this.isConfigured) {
      console.info(`[RevenueCat:Mock] Menjalankan simulasi Sandbox StoreKit untuk ${productId}...`);
      
      const productName =
        productId === IAP_PRODUCT_IDS.vipAnnual
          ? 'TTS Bareng VIP (Tahunan - Rp 199.000)'
          : productId === IAP_PRODUCT_IDS.vipMonthly
          ? 'TTS Bareng VIP (Bulanan - Rp 29.000)'
          : productId === IAP_PRODUCT_IDS.vipLifetime
          ? 'TTS Bareng VIP (Seumur Hidup - Rp 499.000)'
          : productId === IAP_PRODUCT_IDS.sachetStarter
          ? 'Paket Sachet Pemula (Rp 5.000)'
          : 'Produk Dalam Aplikasi';

      let userConfirmed = true;
      if (typeof window !== 'undefined') {
        userConfirmed = window.confirm(
          `🍎 [Apple StoreKit 2 — Simulasi Sandbox]\n\n` +
          `Konfirmasi Pembelian:\n${productName}\n\n` +
          `• Klik OK untuk Simulasi Pembelian Berhasil\n` +
          `• Klik Cancel untuk Simulasi Batalkan Transaksi`
        );
      }

      if (!userConfirmed) {
        return {
          success: false,
          cancelled: true,
          productId,
        };
      }

      const isVipProduct =
        productId === IAP_PRODUCT_IDS.vipMonthly ||
        productId === IAP_PRODUCT_IDS.vipAnnual ||
        productId === IAP_PRODUCT_IDS.vipLifetime;

      return {
        success: true,
        productId,
        entitlementUnlocked: isVipProduct,
      };
    }

    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      let packageToPurchase: PurchasesPackage | undefined = undefined;
      if (currentOffering && currentOffering.availablePackages) {
        packageToPurchase = currentOffering.availablePackages.find(
          (pkg) => pkg.product.identifier === productId || pkg.identifier === productId
        );
      }

      let customerInfo: CustomerInfo;
      if (packageToPurchase) {
        const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
        customerInfo = result.customerInfo;
      } else {
        // Fallback pembelian Store Product langsung
        const result = await Purchases.purchaseStoreProduct({
          product: { identifier: productId } as any,
        });
        customerInfo = result.customerInfo;
      }

      const hasVipEntitlement = Boolean(
        customerInfo.entitlements?.active &&
        (customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_VIP] ||
         customerInfo.entitlements.active['vip'] ||
         customerInfo.entitlements.active['pro'])
      );

      return {
        success: true,
        customerInfo,
        productId,
        entitlementUnlocked: hasVipEntitlement,
      };
    } catch (err: any) {
      const userCancelled =
        err?.userCancelled ||
        err?.code === '1' ||
        (err?.message && err.message.toLowerCase().includes('cancel'));

      if (userCancelled) {
        return { success: false, cancelled: true };
      }

      console.error('[RevenueCat] Pembelian gagal:', err);
      return {
        success: false,
        error: err?.message || 'Pembelian gagal diproses oleh Apple App Store.',
      };
    }
  }

  /**
   * Beli Paket Sachet Pemula (Rp 5.000)
   * Consumable: 1 Tiket Kustom TTS + 150 Bintang + 3 Proteksi Streak/ELO
   */
  public async purchaseSachetStarter(): Promise<PurchaseResult> {
    return this.purchaseProduct(IAP_PRODUCT_IDS.sachetStarter);
  }

  /**
   * Beli 1 Tiket Pembuatan TTS Kustom (Rp 5.000)
   */
  public async purchaseSingleCustomTicket(): Promise<PurchaseResult> {
    return this.purchaseProduct(IAP_PRODUCT_IDS.customTicket1);
  }

  /**
   * Langganan Bulanan VIP TTS Bareng (Rp 29.000 / bln)
   */
  public async purchaseVipMonthly(): Promise<PurchaseResult> {
    return this.purchaseProduct(IAP_PRODUCT_IDS.vipMonthly);
  }

  /**
   * Langganan Tahunan VIP TTS Bareng (Rp 199.000 / thn - Hemat ~40%)
   */
  public async purchaseVipAnnual(): Promise<PurchaseResult> {
    return this.purchaseProduct(IAP_PRODUCT_IDS.vipAnnual);
  }

  /**
   * Akses Seumur Hidup VIP TTS Bareng (Rp 499.000 - Sekali Bayar Selamanya)
   */
  public async purchaseVipLifetime(): Promise<PurchaseResult> {
    return this.purchaseProduct(IAP_PRODUCT_IDS.vipLifetime);
  }

  /**
   * Pembelian dinamis berdasarkan plan yang dipilih
   */
  public async purchaseVipPlan(plan: VipPlan): Promise<PurchaseResult> {
    switch (plan) {
      case 'annual':
        return this.purchaseVipAnnual();
      case 'monthly':
        return this.purchaseVipMonthly();
      case 'lifetime':
        return this.purchaseVipLifetime();
      default:
        return this.purchaseVipAnnual();
    }
  }

  /**
   * Kepatuhan Wajib Apple: Pulihkan Pembelian (Restore Purchases).
   */
  public async restorePurchases(): Promise<{
    success: boolean;
    isVip: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    if (this.isMockMode || !this.isConfigured) {
      const isVip = typeof window !== 'undefined' && localStorage.getItem('tts_quest_is_vip') === 'true';
      return { success: true, isVip };
    }

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const isVip = Boolean(
        customerInfo.entitlements?.active &&
        (customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_VIP] ||
         customerInfo.entitlements.active['vip'] ||
         customerInfo.entitlements.active['pro'])
      );

      return {
        success: true,
        isVip,
        customerInfo,
      };
    } catch (err: any) {
      console.warn('[RevenueCat] restorePurchases gagal:', err);
      return {
        success: false,
        isVip: false,
        error: err?.message || 'Gagal memulihkan pembelian dari Apple ID Anda.',
      };
    }
  }

  /**
   * Cek status keanggotaan VIP dari Apple receipt cache.
   */
  public async checkVipStatus(): Promise<boolean> {
    if (this.isMockMode || !this.isConfigured) return false;

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return Boolean(
        customerInfo.entitlements?.active &&
        (customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_VIP] ||
         customerInfo.entitlements.active['vip'] ||
         customerInfo.entitlements.active['pro'])
      );
    } catch (err) {
      console.warn('[RevenueCat] checkVipStatus gagal:', err);
      return false;
    }
  }
}

export const revenueCatService = new RevenueCatService();
