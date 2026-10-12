import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Truck, Navigation, CheckCircle, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const ERROR_MESSAGES = {
  LINK_INVALID: 'This trip link is not valid or has been revoked.',
  LINK_EXPIRED: 'This trip link has expired. Please contact Zawaya Alkayan operations.',
  TRIP_COMPLETED: 'This trip has been completed. Location updates are no longer required.',
  TRIP_CANCELLED: 'This trip has been cancelled.',
  TRIP_INACTIVE: 'This trip is no longer active.',
  PERMISSION_DENIED: 'Location permission is required. Please enable Location in your browser/device settings and try again.',
  POSITION_UNAVAILABLE: 'Your location could not be determined. Please check that Location Services are enabled and try again.',
  TIMEOUT: 'Location request timed out. Please try again in an open area.',
  LOW_ACCURACY: 'Your location accuracy is low. Please move to an open area and try again.',
  NETWORK: 'No internet connection. Your location could not be uploaded. Please try again when you have connectivity.',
};

const STATUS_LABELS = {
  draft: 'Awaiting Start',
  assigned: 'Ready to Start',
  driver_link_sent: 'Ready to Start',
  driver_accepted: 'Ready to Start',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function DriverTripPage() {
  const { token } = useParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkError, setLinkError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastAccuracy, setLastAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [completeDialog, setCompleteDialog] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const autoRef = useRef(null);

  useEffect(() => {
    document.title = 'Trip Update — Zawaya Alkayan';
    api.get(`/driver/trip/${token}`)
      .then(r => setTripData(r.data.data))
      .catch(err => {
        const code = err?.response?.data?.error_code || 'LINK_INVALID';
        setLinkError({ code, message: err?.response?.data?.message || ERROR_MESSAGES[code] });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const sendLocation = async (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    if (accuracy > 500) {
      setGpsError(ERROR_MESSAGES.LOW_ACCURACY);
      return;
    }
    try {
      await api.post(`/driver/trip/${token}/location`, {
        latitude, longitude, accuracy,
        device_timestamp: new Date().toISOString(),
      });
      setLastUpdate(new Date());
      setLastAccuracy(Math.round(accuracy));
      setUpdateCount(c => c + 1);
      setGpsError(null);
      // Refresh trip status
      api.get(`/driver/trip/${token}`).then(r => setTripData(r.data.data)).catch(() => {});
    } catch (err) {
      const code = err?.response?.data?.error_code;
      if (code) setLinkError({ code, message: err?.response?.data?.message });
      else setGpsError(ERROR_MESSAGES.NETWORK);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setUpdating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async pos => { await sendLocation(pos); setUpdating(false); },
      err => {
        setUpdating(false);
        if (err.code === 1) setGpsError(ERROR_MESSAGES.PERMISSION_DENIED);
        else if (err.code === 2) setGpsError(ERROR_MESSAGES.POSITION_UNAVAILABLE);
        else setGpsError(ERROR_MESSAGES.TIMEOUT);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const toggleAutoUpdate = () => {
    if (autoMode) {
      clearInterval(autoRef.current);
      setAutoMode(false);
    } else {
      setAutoMode(true);
      autoRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          pos => sendLocation(pos),
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
      }, 30000);
    }
  };

  useEffect(() => () => { if (autoRef.current) clearInterval(autoRef.current); }, []);

  const handleComplete = async () => {
    try {
      await api.post(`/driver/trip/${token}/complete`);
      setCompleted(true);
      setCompleteDialog(false);
      if (autoRef.current) clearInterval(autoRef.current);
    } catch (err) {
      setLinkError({ code: 'ERROR', message: err?.response?.data?.message || 'Failed to complete trip.' });
    }
  };

  // Link error state
  if (loading) {
    return (
      <div className="driver-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-secondary/20 border-t-brand-secondary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="driver-page flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-400" size={32} />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Link Not Active</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">{linkError.message}</p>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary flex items-center justify-center mx-auto mb-2">
              <Truck className="text-brand-primary" size={20} />
            </div>
            <p className="text-brand-secondary text-xs font-bold tracking-wider">ZAWAYA ALKAYAN</p>
            <p className="text-gray-500 text-xs mt-0.5">Transportation & Haulage</p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="driver-page flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Trip Completed</h2>
          <p className="text-gray-300 text-sm">Thank you. This trip has been marked as completed. You can close this page.</p>
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[tripData?.status] || tripData?.status;
  const isActive = ['assigned', 'driver_link_sent', 'driver_accepted', 'in_progress'].includes(tripData?.status);

  return (
    <div className="driver-page flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-secondary flex items-center justify-center mx-auto mb-3">
          <Truck className="text-brand-primary" size={24} />
        </div>
        <p className="text-brand-secondary text-xs font-bold tracking-widest uppercase">ZAWAYA ALKAYAN</p>
      </div>

      {/* Trip card */}
      <div className="flex-1 px-5 pb-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-5">
          {/* Trip ID */}
          <div className="text-center mb-5">
            <p className="text-gray-400 text-xs font-medium mb-1">TRIP</p>
            <h1 className="text-white font-black text-3xl">{tripData?.trip_code}</h1>
          </div>

          <div className="space-y-3">
            {/* Driver */}
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-brand-secondary/20 flex items-center justify-center shrink-0">
                <span className="text-brand-secondary font-bold text-sm">{tripData?.driver_name?.charAt(0)}</span>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Driver</p>
                <p className="text-white font-semibold text-sm">{tripData?.driver_name}</p>
              </div>
            </div>

            {/* Truck */}
            {tripData?.truck_code && (
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-brand-secondary/20 flex items-center justify-center shrink-0">
                  <Truck className="text-brand-secondary" size={16} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Truck</p>
                  <p className="text-white font-semibold text-sm">{tripData.truck_code}</p>
                </div>
              </div>
            )}

            {/* Route */}
            <div className="bg-white/5 rounded-2xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-1">Route</p>
              <p className="text-white font-semibold text-sm">{tripData?.origin} <span className="text-brand-secondary">→</span> {tripData?.destination}</p>
            </div>

            {/* Status */}
            <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Status</p>
                <p className="text-white font-bold">{statusLabel}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            </div>
          </div>
        </div>

        {/* GPS error */}
        {gpsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="text-red-200 text-sm leading-relaxed">{gpsError}</p>
            </div>
          </div>
        )}

        {/* Last update */}
        {lastUpdate && (
          <div className="bg-green-500/15 border border-green-500/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <div>
                  <p className="text-green-300 text-xs font-semibold">Location Updated</p>
                  <p className="text-green-400/70 text-xs">{lastUpdate.toLocaleTimeString()} · Accuracy: {lastAccuracy}m</p>
                </div>
              </div>
              <span className="text-green-400 text-xs font-bold">{updateCount} updates</span>
            </div>
            {autoMode && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Auto update every 30 seconds
              </div>
            )}
          </div>
        )}

        {/* Main action */}
        {isActive && (
          <>
            <button
              onClick={handleUpdateLocation}
              disabled={updating}
              className="w-full py-5 rounded-2xl bg-brand-secondary text-brand-primary font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-brand-secondary/20 active:scale-95 transition-transform disabled:opacity-70"
            >
              {updating ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation size={24} />
                  UPDATE MY LOCATION
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-xs mt-3">
              Your location will only be shared for this assigned trip.
            </p>

            {/* Auto update toggle */}
            <button
              onClick={toggleAutoUpdate}
              className={`w-full mt-3 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${autoMode ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
            >
              <span className={`w-2 h-2 rounded-full ${autoMode ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              Auto Update {autoMode ? 'ON (every 30s)' : 'OFF'}
            </button>

            {/* Complete trip */}
            <button
              onClick={() => setCompleteDialog(true)}
              className="w-full mt-3 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 hover:text-white transition-colors"
            >
              Mark Trip Complete
            </button>
          </>
        )}

        {!isActive && tripData?.status === 'completed' && (
          <div className="text-center py-6">
            <CheckCircle className="text-green-400 mx-auto mb-2" size={40} />
            <p className="text-white font-semibold">This trip is completed.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 text-center">
        <p className="text-gray-600 text-xs">ZAWAYA ALKAYAN GENERAL CONTRACTING</p>
        <p className="text-gray-700 text-xs">Transportation & Haulage Services</p>
      </div>

      <ConfirmDialog
        open={completeDialog}
        onConfirm={handleComplete}
        onCancel={() => setCompleteDialog(false)}
        title="Complete Trip"
        message="Are you sure you want to complete this trip? Location updates will stop."
        confirmLabel="Complete Trip"
      />
    </div>
  );
}
