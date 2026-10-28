import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScanLine, Image as ImageIcon, Zap, ZapOff, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { extractRoomCodeFromText, decodeCustomCrosswordParam } from '../lib/deeplink';
import { generateCustomCrossword } from '../lib/customCrosswordGenerator';
import { useGameStore } from '../store/useGameStore';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (roomCode: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { showGlobalToast, playCustomCrossword, saveUserCustomCrossword } = useGameStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasCameraError, setHasCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [torchSupported, setTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stop camera tracks cleanly (pure ref cleanup, zero setState calls)
  const stopMediaStreams = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopMediaStreams();
    setIsTorchOn(false);
    setTorchSupported(false);
    setHasCameraError(false);
    setErrorMessage('');
    onClose();
  }, [stopMediaStreams, onClose]);

  // Handle successful QR detection
  const handleDetectedCode = useCallback((rawText: string) => {
    // Check if QR contains custom crossword payload
    if (rawText.includes('custom=')) {
      try {
        const url = new URL(rawText.startsWith('http') ? rawText : `https://domain.com/${rawText}`);
        const customParam = url.searchParams.get('custom');
        if (customParam) {
          const decoded = decodeCustomCrosswordParam(customParam);
          if (decoded) {
            const level = generateCustomCrossword(
              decoded.title,
              decoded.category,
              decoded.wordsList.map((w) => ({ word: w.answer, clue: w.clue }))
            );
            stopMediaStreams();
            const customItem = {
              id: `custom_${Date.now()}`,
              title: decoded.title,
              category: decoded.category || 'Kreasi Teman',
              wordsList: decoded.wordsList.map((w) => ({ word: w.answer || w.word, clue: w.clue })),
              level,
              createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            };
            saveUserCustomCrossword(customItem);
            playCustomCrossword(customItem);
            showGlobalToast(`Membuka TTS Kustom: "${decoded.title}"`, 3500);
            onClose();
            return;
          }
        }
      } catch {}
    }

    const roomCode = extractRoomCodeFromText(rawText);
    if (roomCode) {
      stopMediaStreams();
      showGlobalToast(`Kode kamar terdeteksi: ${roomCode}`);
      onScanSuccess(roomCode);
      onClose();
    } else {
      showGlobalToast('Format QR tidak dikenali sebagai kode kamar atau TTS.');
    }
  }, [stopMediaStreams, showGlobalToast, onScanSuccess, onClose, playCustomCrossword]);

  // Frame processing loop with jsQR
  const startScanningFrames = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && ctx) {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDetectedCode(code.data);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [handleDetectedCode]);

  // Start rear environment camera
  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasCameraError(true);
      setErrorMessage('Kamera tidak didukung pada peramban ini.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities = track.getCapabilities() as { torch?: boolean };
        if (capabilities.torch) {
          setTorchSupported(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        startScanningFrames();
      }
    } catch (err: unknown) {
      setHasCameraError(true);
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setErrorMessage('Akses kamera ditolak. Silakan izinkan kamera di browser atau pilih gambar dari galeri.');
      } else {
        setErrorMessage('Tidak dapat mengakses kamera. Kamu bisa memilih tangkapan layar QR dari galeri.');
      }
    }
  }, [startScanningFrames]);

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && typeof track.applyConstraints === 'function') {
      try {
        const nextTorch = !isTorchOn;
        await track.applyConstraints({
          // @ts-expect-error torch constraint is valid in modern browsers
          advanced: [{ torch: nextTorch }],
        });
        setIsTorchOn(nextTorch);
      } catch {
        // Ignore torch failure
      }
    }
  };

  // Decode QR from uploaded image / screenshot
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsProcessing(false);
        if (code && code.data) {
          handleDetectedCode(code.data);
        } else {
          showGlobalToast('Tidak ditemukan kode QR pada gambar tersebut.');
        }
      };

      img.onerror = () => {
        setIsProcessing(false);
        showGlobalToast('Gagal memuat file gambar.');
      };

      img.src = result;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      showGlobalToast('Gagal membaca berkas.');
    };

    reader.readAsDataURL(file);
    // Reset file input value so user can pick the same file again if desired
    e.target.value = '';
  };

  useEffect(() => {
    if (!isOpen) {
      stopMediaStreams();
      return;
    }

    const timer = setTimeout(() => {
      startCamera();
    }, 0);

    return () => {
      clearTimeout(timer);
      stopMediaStreams();
    };
  }, [isOpen, startCamera, stopMediaStreams]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex flex-col justify-between items-center px-4 sm:px-6 pt-[max(24px,calc(16px+env(safe-area-inset-top)))] pb-[max(24px,calc(16px+env(safe-area-inset-bottom)))] select-none bg-black/85 backdrop-blur-xl text-white transition-opacity duration-300">
        {/* Top Header Row with Theme Accent Styling */}
        <div className="w-full max-w-[360px] flex items-center justify-between shrink-0 px-1">
          <div
            style={{ background: 'var(--accent-grad)' }}
            className="h-9 px-3.5 rounded-full text-white font-bold text-xs tracking-tight flex items-center gap-2 shadow-md border border-white/20 backdrop-blur-md"
          >
            <ScanLine className="w-4 h-4 stroke-[2.2]" />
            <span className="font-black">Pindai QR Kamar</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'var(--accent-grad)' }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer tactile-active shadow-md border border-white/20 hover:opacity-95 transition-all"
            title="Tutup Scanner"
          >
            <X className="w-4 h-4 stroke-[2.4] text-white" />
          </button>
        </div>

        {/* Viewfinder Center Section */}
        <div className="w-full max-w-[340px] flex flex-col items-center justify-center my-auto">
          {!hasCameraError ? (
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[32px] overflow-hidden border-2 border-white/25 shadow-2xl bg-black">
              {/* Video Camera Stream */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* 4 Viewfinder Corner Brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl border-[var(--accent-main)] pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl border-[var(--accent-main)] pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl border-[var(--accent-main)] pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 rounded-br-xl border-[var(--accent-main)] pointer-events-none" />

              {/* Animated Laser Scanning Beam */}
              <motion.div
                animate={{
                  y: [16, 230, 16],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-x-6 h-0.5 pointer-events-none shadow-lg"
                style={{
                  background: 'var(--accent-grad, #3b82f6)',
                  boxShadow: '0 0 12px var(--accent-main, #3b82f6)',
                }}
              />
            </div>
          ) : (
            /* Friendly Fallback View when Camera is Blocked/Unavailable */
            <div className="w-full rounded-[28px] p-6 bg-white/10 border border-white/15 backdrop-blur-md flex flex-col items-center text-center shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-black text-white mb-1.5">
                Kamera Tidak Dapat Dibuka
              </h3>
              <p className="text-[11px] text-white/80 leading-relaxed mb-4 max-w-[260px]">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'var(--accent-grad)' }}
                className="w-full py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active"
              >
                <ImageIcon className="w-4 h-4 stroke-[2.2]" />
                <span>Pilih Foto QR dari Galeri</span>
              </button>
            </div>
          )}

          {/* Subtitle Instructions */}
          {!hasCameraError && (
            <p className="text-[11px] font-bold text-white/85 text-center mt-5 px-4 leading-snug">
              Arahkan kamera tepat ke QR Code kamar teman pada layar atau tiket fisik
            </p>
          )}
        </div>

        {/* Bottom Actions Row: Gallery Upload & Torch Button */}
        <div className="w-full max-w-[340px] flex items-center justify-center gap-3 shrink-0 pb-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer tactile-active transition-all shadow-md backdrop-blur-md"
          >
            <ImageIcon className="w-4 h-4 stroke-[2.2]" />
            <span>{isProcessing ? 'Memeriksa...' : 'Pilih dari Galeri'}</span>
          </button>

          {torchSupported && !hasCameraError && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-3 rounded-2xl border transition-all cursor-pointer tactile-active shadow-md ${
                isTorchOn
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/15 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Lampu Kilat"
            >
              {isTorchOn ? (
                <ZapOff className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Zap className="w-5 h-5 stroke-[2.2]" />
              )}
            </button>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default QrScannerModal;
