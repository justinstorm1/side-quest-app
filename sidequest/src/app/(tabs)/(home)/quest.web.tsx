import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const DIFF: Record<string, { bg: string; text: string; dot: string }> = {
  easy:   { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  medium: { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  hard:   { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
};

type UserCoords = { latitude: number; longitude: number };

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Lazy-load Leaflet only on web
let leafletLoaded = false;
async function ensureLeaflet(): Promise<typeof import('leaflet')> {
  if (typeof window === 'undefined') throw new Error('Not browser');
  if (!(window as any).L) {
    // inject CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    await new Promise<void>((res, rej) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => res();
      script.onerror = rej;
      document.head.appendChild(script);
    });
  }
  return (window as any).L;
}

interface LeafletMapProps {
  userCoords: UserCoords;
  questCoords: UserCoords;
  questIcon: string;
  questTitle: string;
  thresholdMiles: number;
  inRange: boolean;
  distanceMiles: number;
  expanded: boolean;
  onToggleExpand: () => void;
}

function LeafletMap({
  userCoords,
  questCoords,
  questIcon,
  questTitle,
  thresholdMiles,
  inRange,
  distanceMiles,
  expanded,
  onToggleExpand,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let L: any;

    ensureLeaflet().then((l) => {
      L = l;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, { zoomControl: expanded });
      mapInstanceRef.current = map;

      // Fix default icon path issues with webpack/metro
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Threshold circle
      L.circle([questCoords.latitude, questCoords.longitude], {
        radius: thresholdMiles * 1609.34,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.07,
        weight: 1.5,
        opacity: 0.35,
      }).addTo(map);

      // Polyline user → quest
      L.polyline(
        [
          [userCoords.latitude, userCoords.longitude],
          [questCoords.latitude, questCoords.longitude],
        ],
        {
          color: inRange ? '#22c55e' : '#ef4444',
          weight: 2,
          dashArray: '6 4',
        }
      ).addTo(map);

      // Quest marker
      const questMarkerHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#6366f1;border-radius:12px;padding:4px 8px;border:2px solid white;font-size:18px;line-height:1.2;">${questIcon}</div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #6366f1;"></div>
        </div>`;
      const questIcon_ = L.divIcon({ html: questMarkerHtml, className: '', iconAnchor: [20, 32] });
      L.marker([questCoords.latitude, questCoords.longitude], { icon: questIcon_ })
        .addTo(map)
        .bindPopup(questTitle);

      // User marker
      const userMarkerHtml = `
        <div style="width:20px;height:20px;border-radius:50%;background:white;border:2.5px solid #6366f1;display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:#6366f1;"></div>
        </div>`;
      const userIcon = L.divIcon({ html: userMarkerHtml, className: '', iconAnchor: [10, 10] });
      L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('You');

      // Fit bounds to both markers
      map.fitBounds(
        [
          [userCoords.latitude, userCoords.longitude],
          [questCoords.latitude, questCoords.longitude],
        ],
        { padding: [50, 50] }
      );

      if (!expanded) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
      }
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // Re-init when expanded toggles so controls update
  }, [userCoords, questCoords, inRange, expanded]);

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 16, position: 'relative' }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: expanded ? 420 : 220 }}
      />

      {/* Expand/Collapse */}
      <button
        onClick={onToggleExpand}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 1000,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {expanded ? '⊡ Collapse' : '⊞ Expand'}
      </button>

      {/* Distance footer */}
      <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
          <span>🧍 You</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 1, background: inRange ? '#22c55e' : '#ef4444' }} />
            <span style={{
              padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: inRange ? '#dcfce7' : '#fee2e2',
              color: inRange ? '#15803d' : '#b91c1c',
              border: `1px solid ${inRange ? '#bbf7d0' : '#fecaca'}`,
            }}>{distanceMiles} mi</span>
            <div style={{ width: 20, height: 1, background: inRange ? '#22c55e' : '#ef4444' }} />
          </div>
          <span>{questIcon} Quest</span>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: inRange ? '#dcfce7' : '#fee2e2',
          color: inRange ? '#15803d' : '#b91c1c',
          border: `1px solid ${inRange ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {inRange ? '✓ In range' : `✗ ${distanceMiles - thresholdMiles} mi too far`}
        </span>
      </div>
    </div>
  );
}

export default function QuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const quest = useQuery(api.quests.getQuest, { questId: id as Id<'quests'> });
  const completeQuest = useMutation(api.quests.completeQuest);

  const [image, setImage] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [questCoords, setQuestCoords] = useState<UserCoords | null>(null);
  const [questAddress, setQuestAddress] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const threshold = quest?.locationThresholdMiles ?? 100;
  const inRange = locationStatus === 'ok';

  const locationRequired = quest?.needsLocationVerification ?? false;
  const imageRequired = quest?.needsImageVerification ?? false;
  const locationDone = !locationRequired || inRange;
  const imageDone = !imageRequired || !!image;
  const canSubmit = locationDone && imageDone;

  const d = DIFF[quest?.difficultly ?? 'easy'];

  useEffect(() => {
    if (!quest?.location) return;
    setQuestCoords({ latitude: quest.location.latitude, longitude: quest.location.longitude });

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${quest.location.latitude}&lon=${quest.location.longitude}&format=json`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.display_name) {
          const parts = data.display_name.split(', ').slice(0, 4);
          setQuestAddress(parts.join(', '));
        }
      })
      .catch(() => {});
  }, [quest?.location]);

  const checkLocation = () => {
    if (!questCoords) { alert('This quest has no location to verify against.'); return; }
    setLocationStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        const miles = haversineMiles(latitude, longitude, questCoords.latitude, questCoords.longitude);
        setDistanceMiles(Math.round(miles));
        setLocationStatus(miles <= threshold ? 'ok' : 'fail');
      },
      () => {
        alert('Location access denied or unavailable.');
        setLocationStatus('fail');
      },
      { enableHighAccuracy: false }
    );
  };

  const pickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setImage(URL.createObjectURL(file));
    };
    input.click();
  };

  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setImage(URL.createObjectURL(file));
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!canSubmit || !quest) return;
    setSubmitting(true);
    try {
      await completeQuest({ questId: quest._id });
      router.back();
      alert(`Quest Complete! 🎉\n+${quest.points ?? 0} XP earned`);
    } catch (e) {
      console.log('Error completing quest', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quest) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: '#f1f5f9' }}>
        <span style={{ color: '#94a3b8', fontSize: 15 }}>Loading…</span>
      </div>
    );
  }

  let stepNum = 1;
  const locationStep = locationRequired ? stepNum++ : null;
  const imageStep = imageRequired ? stepNum++ : null;

  return (
    <div style={{ minHeight: '100dvh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Back button */}
      <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0',
            border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#475569',
          }}
        >✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', paddingBottom: 100 }}>

        {/* Header */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: '#f8fafc',
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32, flexShrink: 0,
            }}>
              {quest.icon ?? '🎯'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', lineHeight: 1.2 }}>{quest.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{quest.description}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                {quest.difficultly && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 20,
                    background: d.bg, color: d.text, fontSize: 11, fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.dot, display: 'inline-block' }} />
                    {quest.difficultly.charAt(0).toUpperCase() + quest.difficultly.slice(1)}
                  </span>
                )}
                <span style={{
                  padding: '2px 10px', borderRadius: 20, background: '#eef2ff',
                  color: '#4f46e5', fontSize: 11, fontWeight: 700,
                  border: '1px solid #e0e7ff',
                }}>
                  +{quest.points} XP
                </span>
                {locationRequired && (
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2 }}>
                    📍 {threshold} mi
                  </span>
                )}
              </div>
            </div>
          </div>
          {questAddress && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
              background: '#f8fafc', borderRadius: 12, padding: '8px 12px',
              border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b',
            }}>
              📍 {questAddress}
            </div>
          )}
        </div>

        {/* Step: Location */}
        {locationRequired && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white',
                background: inRange ? '#22c55e' : '#e2e8f0',
              }}>
                {inRange ? '✓' : locationStep}
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a', flex: 1 }}>Verify Location</span>
              {locationStatus === 'ok' && (
                <span style={{ padding: '2px 10px', borderRadius: 20, background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  Within range
                </span>
              )}
              {locationStatus === 'fail' && (
                <span style={{ padding: '2px 10px', borderRadius: 20, background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 600, border: '1px solid #fecaca' }}>
                  Too far
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px' }}>
              You must be within {threshold} miles of the quest location.
            </p>
            {locationStatus !== 'ok' && (
              <button
                onClick={checkLocation}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid #c7d2fe',
                  background: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {locationStatus === 'checking' ? 'Locating you…' : '📍 Check My Location'}
              </button>
            )}
          </div>
        )}

        {/* Map */}
        {locationRequired && userCoords && questCoords && (
          <LeafletMap
            userCoords={userCoords}
            questCoords={questCoords}
            questIcon={quest.icon ?? '🎯'}
            questTitle={quest.title ?? ''}
            thresholdMiles={threshold}
            inRange={inRange}
            distanceMiles={distanceMiles ?? 0}
            expanded={mapExpanded}
            onToggleExpand={() => setMapExpanded((v) => !v)}
          />
        )}

        {/* Step: Photo */}
        {imageRequired && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white',
                background: image ? '#22c55e' : '#e2e8f0',
              }}>
                {image ? '✓' : imageStep}
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Submit Photo Proof</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px' }}>
              Take or upload a photo proving you completed the quest.
            </p>
            {image ? (
              <div>
                <img src={image} alt="Proof" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
                <button
                  onClick={() => setImage(null)}
                  style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
                >
                  Remove photo
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Camera', emoji: '📷', action: takePhoto },
                  { label: 'Library', emoji: '🖼️', action: pickImage },
                ].map(({ label, emoji, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e2e8f0',
                      background: '#f8fafc', cursor: 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 20px 20px', background: '#f1f5f9',
        borderTop: '1px solid #e2e8f0',
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            width: '100%', height: 56, borderRadius: 16, border: 'none', cursor: canSubmit && !submitting ? 'pointer' : 'default',
            background: canSubmit && !submitting ? '#6366f1' : '#e2e8f0',
            color: canSubmit && !submitting ? 'white' : '#94a3b8',
            fontSize: 15, fontWeight: 700,
          }}
        >
          {submitting ? 'Submitting…' : canSubmit ? '🎯 Complete Quest' : 'Complete steps above'}
        </button>
      </div>
    </div>
  );
}