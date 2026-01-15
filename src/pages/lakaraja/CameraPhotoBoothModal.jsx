import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CameraPhotoBoothModal = ({ isOpen, onClose, onCapture, participantName }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Gagal mengakses kamera. Pastikan Anda memberikan izin kamera.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image as data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    
    // Stop camera after capture
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white text-2xl z-10"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Photo Booth Container */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-orange-500/30 rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <i className="fas fa-camera text-orange-500 text-2xl"></i>
              <h2 className="text-white text-2xl sm:text-3xl font-bold">Photo Booth</h2>
            </div>
            <p className="text-white/60 text-sm sm:text-base">Technical Meeting - Lakaraja 2026</p>
            <p className="text-orange-400 font-semibold mt-2">{participantName}</p>
          </div>

          {/* Camera/Photo Container - Polaroid Style */}
          <div className="relative mx-auto" style={{ maxWidth: '600px' }}>
            {/* Polaroid Frame - Enhanced Design */}
            <div className="relative">
              {/* Polaroid Paper with Shadow */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-3 sm:p-4 rounded-2xl shadow-2xl transform rotate-0 hover:rotate-1 transition-transform duration-300 border border-orange-100/50">
                {/* Decorative Corner Stickers */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-80 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                  ⭐
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-80 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
                  🔥
                </div>
                
                {/* Photo Area */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner" style={{ aspectRatio: '4/3' }}>
                  {!capturedImage ? (
                    <>
                      {/* Live Video */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Camera Overlay */}
                      {!isCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                          <div className="text-center">
                            <div className="relative">
                              <i className="fas fa-camera text-orange-500 text-5xl mb-3 animate-pulse"></i>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                              </div>
                            </div>
                            <p className="text-white font-semibold mt-6">Memulai kamera...</p>
                            <p className="text-white/60 text-sm">Bersiaplah untuk tersenyum! 😊</p>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Camera Frame Guides */}
                      {isCameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Gradient Overlay Edges */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
                          
                          {/* Corner Guides with Glow */}
                          <div className="absolute top-6 left-6 w-12 h-12 border-l-4 border-t-4 border-orange-500 rounded-tl-lg shadow-lg shadow-orange-500/50"></div>
                          <div className="absolute top-6 right-6 w-12 h-12 border-r-4 border-t-4 border-orange-500 rounded-tr-lg shadow-lg shadow-orange-500/50"></div>
                          <div className="absolute bottom-6 left-6 w-12 h-12 border-l-4 border-b-4 border-orange-500 rounded-bl-lg shadow-lg shadow-orange-500/50"></div>
                          <div className="absolute bottom-6 right-6 w-12 h-12 border-r-4 border-b-4 border-orange-500 rounded-br-lg shadow-lg shadow-orange-500/50"></div>
                          
                          {/* Center Face Guide with Animation */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative w-40 h-40 rounded-full border-4 border-orange-500/60 animate-pulse shadow-lg shadow-orange-500/30">
                              <div className="absolute inset-0 rounded-full border-4 border-orange-400/40 animate-ping"></div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
                              😊 Smile!
                            </div>
                          </div>

                          {/* Top Instruction Banner */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold">
                            <i className="fas fa-smile mr-2"></i>
                            Say "Lakaraja"! 📸
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Captured Image */
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Enhanced Polaroid Bottom Section */}
                <div className="mt-3 sm:mt-4 space-y-2 px-2 bg-gradient-to-b from-transparent to-orange-50/50 rounded-b-xl pt-2">
                  {/* Header with Logo */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img 
                          src="/logo_lakaraja.png" 
                          alt="Lakaraja Logo" 
                          className="w-10 h-10 object-contain"
                          style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-lg">
                          ⚡
                        </div>
                      </div>
                      <div>
                        <span className="text-transparent font-black text-xl bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text drop-shadow-sm">
                          LAKARAJA
                        </span>
                        <p className="text-orange-700 text-xs font-bold">2026 EDITION</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <img 
                        src="/logo_rj.png" 
                        alt="RJ Logo" 
                        className="w-12 h-12 object-contain"
                        style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}                      />
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>

                  {/* Event Info */}
                  <div className="text-center py-1">
                    <p className="text-orange-800 text-xs font-bold uppercase tracking-wide mb-1">
                      ⚡ Technical Meeting ⚡
                    </p>
                    <div className="flex items-center justify-center gap-2 text-orange-600 text-xs">
                      <i className="far fa-calendar-alt"></i>
                      <span className="font-semibold">
                        {new Date().toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Supported By Section */}
                  <div className="border-t border-orange-200 pt-2 mt-2">
                    <p className="text-orange-500 text-xs text-center mb-1 uppercase tracking-wide font-semibold">Supported by</p>
                    <div className="flex items-center justify-center">
                      <img 
                        src="/Logo%20SIMPASKOR.PNG" 
                        alt="SIMPASKOR Logo" 
                        className="h-8 object-contain"
                        style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="text-orange-700 font-bold text-sm" style={{display: 'none'}}>SIMPASKOR</span>
                    </div>
                  </div>

                  {/* Bottom Decorative Elements */}
                  <div className="flex items-center justify-center gap-1 text-xs pb-1">
                    <span className="text-orange-400">✨</span>
                    <span className="text-orange-600 font-medium italic">Captured with pride</span>
                    <span className="text-orange-400">✨</span>
                  </div>
                </div>

                {/* Decorative Tape Effect on Top */}
                <div className="absolute -top-3 left-1/4 w-20 h-6 bg-yellow-100/80 border border-yellow-200 rotate-3 shadow-md"></div>
                <div className="absolute -top-3 right-1/4 w-20 h-6 bg-yellow-100/80 border border-yellow-200 -rotate-3 shadow-md"></div>
              </div>

              {/* Multiple Shadow Layers for Depth */}
              <div className="absolute -bottom-3 left-6 right-6 h-6 bg-gradient-to-b from-black/20 to-transparent blur-xl rounded-full"></div>
              <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/10 blur-lg rounded-full"></div>
            </div>
          </div>

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mt-8">
            {!capturedImage ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-semibold"
                >
                  <i className="fas fa-times mr-2"></i>
                  Batal
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className={`px-8 py-3 rounded-lg transition-all font-semibold ${
                    isCameraReady
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <i className="fas fa-camera mr-2"></i>
                  Ambil Foto
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={retakePhoto}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-semibold"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Foto Ulang
                </button>
                <button
                  onClick={confirmPhoto}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-semibold"
                >
                  <i className="fas fa-check mr-2"></i>
                  Gunakan Foto
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              <i className="fas fa-info-circle mr-1"></i>
              Pastikan wajah terlihat jelas dan pencahayaan cukup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraPhotoBoothModal;
