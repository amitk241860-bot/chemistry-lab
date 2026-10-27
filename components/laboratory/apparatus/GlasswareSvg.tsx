'use client';

import React from 'react';

export type ApparatusType =
  | 'beaker-250'
  | 'beaker-100'
  | 'conical-flask-250'
  | 'test-tube'
  | 'cylinder-100'
  | 'evaporating-dish'
  | 'filter-funnel'
  | 'foam-cup'
  | 'burette-50'
  | 'burner'
  | 'tripod'
  | 'retort-stand'
  | 'dropper-pipette'
  | 'thermometer'
  | 'glass-rod'
  | 'filter-paper'
  | 'analytical-balance'
  | 'separatory-funnel'
  | 'gas-syringe'
  | 'ph-meter'
  | 'conductivity-meter';

interface GlasswareSvgProps {
  type: ApparatusType | string;
  volume?: number;           // Current volume in mL
  maxVolume?: number;        // Maximum container volume in mL
  liquidColor?: string;      // CSS color of the liquid
  temperature?: number;      // Current liquid temperature (°C)
  isHeating?: boolean;       // Burner flame active / boiling state
  stopcockOpen?: boolean;    // For burette
  hasFilterPaper?: boolean;  // For funnel
  hasResidue?: boolean;      // For filtration
  hasSaltCrust?: boolean;    // For evaporating dish
  showGraduations?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onStopcockToggle?: () => void;
}

export const GlasswareSvg: React.FC<GlasswareSvgProps> = ({
  type,
  volume = 0,
  maxVolume = 250,
  liquidColor = '#38bdf8',
  temperature = 25,
  isHeating = false,
  stopcockOpen = false,
  hasFilterPaper = false,
  hasResidue = false,
  hasSaltCrust = false,
  showGraduations = true,
  width = 160,
  height = 200,
  className = '',
  onStopcockToggle,
}) => {
  const fillFraction = Math.min(1, Math.max(0, volume / (maxVolume || 1)));
  const isBoiling = temperature >= 99.5 || (isHeating && temperature >= 95);

  // Helper: Beaker 250mL / 100mL
  if (type === 'beaker-250' || type === 'beaker-100' || type === 'beaker') {
    const liquidHeight = fillFraction * 130;
    const liquidY = 165 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id={`glass-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id={`liquid-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.75" />
            <stop offset="50%" stopColor={liquidColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.8" />
          </linearGradient>

          <clipPath id="beaker-clip">
            <path d="M 28 32 L 28 165 C 28 174 36 178 50 178 L 110 178 C 124 178 132 174 132 165 L 132 32 Z" />
          </clipPath>
        </defs>

        {/* Back glass wall shadow */}
        <path
          d="M 28 32 L 28 165 C 28 174 36 178 50 178 L 110 178 C 124 178 132 174 132 165 L 132 32 Z"
          fill="rgba(15, 23, 42, 0.45)"
        />

        {/* Liquid Body with Meniscus */}
        {fillFraction > 0 && (
          <g clipPath="url(#beaker-clip)">
            <rect
              x="25"
              y={liquidY}
              width="110"
              height={liquidHeight + 20}
              fill={`url(#liquid-grad-${type})`}
            />

            {/* Meniscus ellipse curve at surface */}
            <ellipse
              cx="80"
              cy={liquidY}
              rx="52"
              ry="5"
              fill={liquidColor}
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />

            {/* Boiling Bubbles Animation */}
            {isBoiling && (
              <g className="animate-pulse">
                <circle cx="55" cy={liquidY + 25} r="3" fill="#ffffff" fillOpacity="0.7" />
                <circle cx="75" cy={liquidY + 45} r="4" fill="#ffffff" fillOpacity="0.6" />
                <circle cx="95" cy={liquidY + 18} r="2.5" fill="#ffffff" fillOpacity="0.8" />
                <circle cx="65" cy={liquidY + 65} r="3.5" fill="#ffffff" fillOpacity="0.5" />
                <circle cx="105" cy={liquidY + 50} r="3" fill="#ffffff" fillOpacity="0.7" />
              </g>
            )}
          </g>
        )}

        {/* Graduation Marks */}
        {showGraduations && (
          <g stroke="rgba(255, 255, 255, 0.65)" strokeWidth="1">
            <line x1="32" y1="150" x2="48" y2="150" />
            <text x="52" y="153" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">50</text>
            <line x1="32" y1="125" x2="44" y2="125" />
            <line x1="32" y1="100" x2="48" y2="100" />
            <text x="52" y="103" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">100</text>
            <line x1="32" y1="75" x2="44" y2="75" />
            <line x1="32" y1="50" x2="48" y2="50" />
            <text x="52" y="53" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">200</text>
          </g>
        )}

        {/* Glass Outer Rim & Body Outline */}
        <path
          d="M 22 28 C 24 30 28 32 28 32 L 28 165 C 28 174 36 178 50 178 L 110 178 C 124 178 132 174 132 165 L 132 32 C 132 32 136 30 138 28"
          fill={`url(#glass-grad-${type})`}
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Pour Spout Lip on Left */}
        <path
          d="M 22 28 Q 18 25 24 22 L 28 32"
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.8"
        />

        {/* Specular Light Reflection Streak (Left & Right) */}
        <line
          x1="35"
          y1="38"
          x2="35"
          y2="162"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <line
          x1="125"
          y1="38"
          x2="125"
          y2="162"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* Steam Plume if Boiling or Hot */}
        {(isBoiling || temperature >= 80) && (
          <g className="animate-pulse" opacity="0.6">
            <path
              d="M 60 25 Q 50 12 65 2 Q 75 -6 65 -15"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <path
              d="M 80 25 Q 90 10 75 0 Q 65 -10 80 -18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="4,3"
            />
            <path
              d="M 100 25 Q 110 12 95 2 Q 85 -8 95 -15"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
          </g>
        )}
      </svg>
    );
  }

  // Helper: Conical Flask (Erlenmeyer) 250mL
  if (type === 'conical-flask-250' || type === 'conical-flask' || type === 'flask') {
    // Fill height 0 (at y=168) to 1 (at neck y=75)
    const liquidHeight = fillFraction * 95;
    const liquidY = 170 - liquidHeight;
    // Calculate cone width at liquidY: at y=170 width is 110 (x:25 to 135), at y=75 width is 30 (x:65 to 95)
    const currentHalfWidth = 15 + ((170 - liquidY) / 95) * 40;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id="flask-glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          <clipPath id="flask-clip">
            <path d="M 65 30 L 65 72 L 24 168 C 22 174 28 178 40 178 L 120 178 C 132 178 138 174 136 168 L 95 72 L 95 30 Z" />
          </clipPath>
        </defs>

        {/* Back glass fill */}
        <path
          d="M 65 30 L 65 72 L 24 168 C 22 174 28 178 40 178 L 120 178 C 132 178 138 174 136 168 L 95 72 L 95 30 Z"
          fill="rgba(15, 23, 42, 0.4)"
        />

        {/* Liquid Body */}
        {fillFraction > 0 && (
          <g clipPath="url(#flask-clip)">
            <rect
              x="15"
              y={liquidY}
              width="130"
              height={liquidHeight + 20}
              fill={liquidColor}
              fillOpacity="0.85"
            />
            {/* Curved Meniscus */}
            <ellipse
              cx="80"
              cy={liquidY}
              rx={currentHalfWidth}
              ry="4"
              fill={liquidColor}
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            {/* Boiling Bubbles */}
            {isBoiling && (
              <g className="animate-pulse">
                <circle cx="65" cy={liquidY + 20} r="3" fill="#ffffff" fillOpacity="0.7" />
                <circle cx="80" cy={liquidY + 35} r="3.5" fill="#ffffff" fillOpacity="0.6" />
                <circle cx="95" cy={liquidY + 15} r="2.5" fill="#ffffff" fillOpacity="0.8" />
              </g>
            )}
          </g>
        )}

        {/* Graduations */}
        {showGraduations && (
          <g stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1">
            <line x1="48" y1="150" x2="62" y2="150" />
            <text x="66" y="153" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">50</text>
            <line x1="56" y1="130" x2="68" y2="130" />
            <text x="72" y="133" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">100</text>
            <line x1="64" y1="110" x2="74" y2="110" />
            <text x="78" y="113" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="sans-serif">150</text>
          </g>
        )}

        {/* Glass Outer Rim & Body */}
        <path
          d="M 62 26 C 62 26 64 28 65 30 L 65 72 L 24 168 C 22 174 28 178 40 178 L 120 178 C 132 178 138 174 136 168 L 95 72 L 95 30 C 96 28 98 26 98 26"
          fill="url(#flask-glass-grad)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Flared lip rim */}
        <ellipse
          cx="80"
          cy="28"
          rx="18"
          ry="3.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeOpacity="0.8"
        />

        {/* Specular Highlight lines */}
        <path
          d="M 68 35 L 68 70 L 32 165"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Helper: Test Tube
  if (type === 'test-tube') {
    const liquidHeight = fillFraction * 130;
    const liquidY = 165 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id="test-tube-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          <clipPath id="test-tube-clip">
            <path d="M 68 30 L 68 160 C 68 174 92 174 92 160 L 92 30 Z" />
          </clipPath>
        </defs>

        {/* Liquid Body */}
        {fillFraction > 0 && (
          <g clipPath="url(#test-tube-clip)">
            <rect
              x="65"
              y={liquidY}
              width="30"
              height={liquidHeight + 20}
              fill={liquidColor}
              fillOpacity="0.85"
            />
            <ellipse
              cx="80"
              cy={liquidY}
              rx="12"
              ry="3"
              fill={liquidColor}
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />
            {isBoiling && (
              <g className="animate-pulse">
                <circle cx="76" cy={liquidY + 15} r="2" fill="#ffffff" fillOpacity="0.8" />
                <circle cx="83" cy={liquidY + 28} r="2.5" fill="#ffffff" fillOpacity="0.7" />
                <circle cx="78" cy={liquidY + 45} r="3" fill="#ffffff" fillOpacity="0.6" />
              </g>
            )}
          </g>
        )}

        {/* Test Tube Glass Contour with Round Bottom */}
        <path
          d="M 65 28 L 68 30 L 68 160 C 68 174 92 174 92 160 L 92 30 L 95 28"
          fill="url(#test-tube-grad)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Flared Rim */}
        <ellipse
          cx="80"
          cy="28"
          rx="15"
          ry="3"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeOpacity="0.8"
        />

        {/* Specular Highlight */}
        <line
          x1="71"
          y1="34"
          x2="71"
          y2="155"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Helper: Graduated Cylinder 100mL
  if (type === 'cylinder-100' || type === 'cylinder') {
    const liquidHeight = fillFraction * 135;
    const liquidY = 165 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <clipPath id="cylinder-clip">
            <rect x="68" y="25" width="24" height="145" rx="2" />
          </clipPath>
        </defs>

        {/* Base */}
        <path
          d="M 52 178 L 108 178 L 100 170 L 60 170 Z"
          fill="rgba(255, 255, 255, 0.25)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.5"
        />

        {/* Liquid */}
        {fillFraction > 0 && (
          <g clipPath="url(#cylinder-clip)">
            <rect
              x="68"
              y={liquidY}
              width="24"
              height={liquidHeight + 10}
              fill={liquidColor}
              fillOpacity="0.85"
            />
            <ellipse
              cx="80"
              cy={liquidY}
              rx="12"
              ry="2.5"
              fill={liquidColor}
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />
          </g>
        )}

        {/* Cylinder Body */}
        <rect
          x="68"
          y="25"
          width="24"
          height="145"
          rx="2"
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.6"
        />

        {/* Graduations */}
        {showGraduations && (
          <g stroke="rgba(255, 255, 255, 0.7)" strokeWidth="0.8">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v, i) => {
              const y = 165 - (i + 1) * 12.5;
              return (
                <g key={v}>
                  <line x1="78" y1={y} x2="91" y2={y} />
                  <text x="70" y={y + 2.5} fill="rgba(255,255,255,0.75)" fontSize="5.5" fontFamily="sans-serif">
                    {v}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    );
  }

  // Helper: Evaporating Dish (China dish)
  if (type === 'evaporating-dish') {
    const liquidHeight = fillFraction * 20;
    const liquidY = 135 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id="ceramic-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
          </linearGradient>
          <clipPath id="dish-clip">
            <path d="M 30 115 C 32 145 128 145 130 115 Z" />
          </clipPath>
        </defs>

        {/* Dish Basin Interior */}
        <path
          d="M 28 115 C 32 155 128 155 132 115 Z"
          fill="url(#ceramic-grad)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* Liquid in Dish */}
        {fillFraction > 0 && (
          <g clipPath="url(#dish-clip)">
            <rect x="25" y={liquidY} width="110" height={liquidHeight + 20} fill={liquidColor} fillOpacity="0.8" />
            <ellipse cx="80" cy={liquidY} rx="45" ry="5" fill={liquidColor} stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
          </g>
        )}

        {/* White Salt Crystalline Crust Formation upon Dryness */}
        {(hasSaltCrust || (fillFraction <= 0.05 && volume === 0)) && (
          <g>
            <path
              d="M 45 138 Q 60 144 80 144 Q 100 144 115 138 Q 100 133 80 133 Q 60 133 45 138 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              className="drop-shadow"
            />
            <circle cx="65" cy="138" r="2" fill="#f8fafc" />
            <circle cx="78" cy="140" r="2.5" fill="#f8fafc" />
            <circle cx="92" cy="137" r="2" fill="#f8fafc" />
            <rect x="83" y="135" width="4" height="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            <rect x="70" y="136" width="3.5" height="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
          </g>
        )}

        {/* Dish Rim Ellipse */}
        <ellipse cx="80" cy="115" rx="52" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />

        {/* Steam Plumes */}
        {(isBoiling || temperature >= 70) && (
          <g className="animate-pulse" opacity="0.65">
            <path d="M 60 110 Q 50 95 65 80 Q 75 70 65 55" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3,3" />
            <path d="M 80 110 Q 90 92 75 78 Q 65 65 80 50" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3,3" />
            <path d="M 100 110 Q 110 95 95 80 Q 85 68 95 55" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3,3" />
          </g>
        )}
      </svg>
    );
  }

  // Helper: Filter Funnel
  if (type === 'filter-funnel') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id="funnel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Filter Paper Cone */}
        {hasFilterPaper && (
          <path
            d="M 38 48 L 80 112 L 122 48 Q 80 58 38 48 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
        )}

        {/* Trapped Sand Residue */}
        {hasResidue && (
          <path
            d="M 60 78 L 80 110 L 100 78 Q 80 84 60 78 Z"
            fill="#d97706"
            fillOpacity="0.8"
            stroke="#b45309"
            strokeWidth="1"
          />
        )}

        {/* Glass Funnel Body and Stem */}
        <path
          d="M 30 40 L 76 115 L 76 175 L 84 175 L 84 115 L 130 40 Z"
          fill="url(#funnel-grad)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Funnel Rim */}
        <ellipse cx="80" cy="40" rx="50" ry="7" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.9" />

        {/* Drip Droplet Falling From Stem */}
        {volume > 0 && (
          <circle cx="80" cy="186" r="3" fill="#38bdf8" className="animate-bounce" />
        )}
      </svg>
    );
  }

  // Helper: Insulated Foam Cup (Calorimeter)
  if (type === 'foam-cup') {
    const liquidHeight = fillFraction * 100;
    const liquidY = 160 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-xl select-none ${className}`}
      >
        <defs>
          <linearGradient id="foam-cup-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <pattern id="styro-texture" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#e2e8f0" />
            <circle cx="6" cy="6" r="1.2" fill="#cbd5e1" />
          </pattern>
        </defs>

        {/* Polystyrene Cup Outer Contour */}
        <path
          d="M 38 48 L 50 172 C 52 178 60 180 80 180 C 100 180 108 178 110 172 L 122 48 Z"
          fill="url(#foam-cup-grad)"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Texture overlay */}
        <path
          d="M 38 48 L 50 172 C 52 178 60 180 80 180 C 100 180 108 178 110 172 L 122 48 Z"
          fill="url(#styro-texture)"
          opacity="0.35"
        />

        {/* Insulated System Label */}
        <rect x="52" y="105" width="56" height="18" rx="4" fill="#0284c7" fillOpacity="0.85" />
        <text x="80" y="117" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          INSULATED
        </text>

        {/* Liquid Level Indicator (Visible through cutout or interior) */}
        {fillFraction > 0 && (
          <rect x="58" y={liquidY} width="44" height={liquidHeight} fill={liquidColor} fillOpacity="0.75" rx="3" />
        )}

        {/* Calorimeter Lid with Hole */}
        <ellipse cx="80" cy="46" rx="44" ry="9" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="80" cy="46" r="4" fill="#334155" />
        <circle cx="95" cy="45" r="3" fill="#334155" />
      </svg>
    );
  }

  // Helper: Graduated Burette 50mL with Stopcock
  if (type === 'burette-50' || type === 'burette') {
    // Fill from 0 (at y=30) to 50mL (at y=145)
    const liquidHeight = fillFraction * 115;
    const liquidY = 145 - liquidHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <clipPath id="burette-tube-clip">
            <rect x="74" y="25" width="12" height="120" rx="1" />
          </clipPath>
        </defs>

        {/* Liquid Column */}
        {fillFraction > 0 && (
          <g clipPath="url(#burette-tube-clip)">
            <rect x="74" y={liquidY} width="12" height={liquidHeight + 5} fill={liquidColor} fillOpacity="0.85" />
          </g>
        )}

        {/* Glass Burette Tube */}
        <rect
          x="74"
          y="25"
          width="12"
          height="120"
          rx="1"
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.5"
        />

        {/* Numbered Graduation Ticks (0 at top to 50 at bottom) */}
        {showGraduations && (
          <g stroke="rgba(255, 255, 255, 0.75)" strokeWidth="0.8">
            {[0, 10, 20, 30, 40, 50].map((v, i) => {
              const y = 30 + i * 22;
              return (
                <g key={v}>
                  <line x1="79" y1={y} x2="86" y2={y} />
                  <text x="66" y={y + 2.5} fill="rgba(255,255,255,0.8)" fontSize="5.5" fontFamily="sans-serif">
                    {v}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Stopcock Valve Body & Interactive Handle */}
        <g
          className="cursor-pointer"
          onClick={onStopcockToggle}
        >
          <title>Click to toggle stopcock</title>
          {/* Glass barrel */}
          <rect x="71" y="145" width="18" height="8" rx="2" fill="#0284c7" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1" />
          {/* Handle (Horizontal = Closed, Vertical = Open) */}
          <rect
            x={stopcockOpen ? "78" : "66"}
            y={stopcockOpen ? "141" : "147"}
            width={stopcockOpen ? "4" : "28"}
            height={stopcockOpen ? "16" : "4"}
            rx="1.5"
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth="0.8"
            className="transition-all duration-200"
          />
        </g>

        {/* Burette Jet Tip */}
        <polygon points="76,153 84,153 81,175 79,175" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1" />

        {/* Droplets dripping when open */}
        {stopcockOpen && (
          <g className="animate-bounce">
            <circle cx="80" cy="184" r="2" fill={liquidColor} />
            <circle cx="80" cy="193" r="1.5" fill={liquidColor} />
          </g>
        )}
      </svg>
    );
  }

  // Helper: Bunsen Burner
  if (type === 'burner') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-xl select-none ${className}`}
      >
        <defs>
          {/* Multilayer Flame Gradients */}
          <radialGradient id="inner-flame-core" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="outer-flame-glow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="90%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="metal-barrel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Animated Burner Flame if isHeating */}
        {isHeating && (
          <g className="animate-pulse">
            {/* Outer Flame Glow */}
            <path
              d="M 68 115 C 62 85 70 50 80 32 C 90 50 98 85 92 115 Z"
              fill="url(#outer-flame-glow)"
              filter="blur(1px)"
            />
            {/* Inner Core Flame */}
            <path
              d="M 73 115 C 70 95 76 75 80 62 C 84 75 90 95 87 115 Z"
              fill="url(#inner-flame-core)"
            />
          </g>
        )}

        {/* Barrel Tube */}
        <rect x="74" y="115" width="12" height="50" rx="1" fill="url(#metal-barrel)" stroke="#334155" strokeWidth="1.2" />

        {/* Air Hole Collar */}
        <rect x="72" y="145" width="16" height="8" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <circle cx="80" cy="149" r="2.5" fill="#0f172a" />

        {/* Heavy Cast Iron Base */}
        <polygon points="45,182 115,182 105,165 55,165" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <rect x="42" y="182" width="76" height="6" rx="2" fill="#0f172a" />

        {/* Gas inlet nozzle */}
        <path d="M 55 170 L 40 170 L 36 174" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Helper: Tripod Stand & Wire Gauze
  if (type === 'tripod') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <pattern id="wire-mesh" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="#475569" strokeWidth="0.6" />
          </pattern>
        </defs>

        {/* Tripod Cast Iron Legs */}
        <g stroke="#334155" strokeWidth="4.5" strokeLinecap="round">
          <line x1="42" y1="95" x2="25" y2="185" />
          <line x1="80" y1="95" x2="80" y2="185" />
          <line x1="118" y1="95" x2="135" y2="185" />
        </g>

        {/* Cast Iron Ring */}
        <ellipse cx="80" cy="95" rx="44" ry="8" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />

        {/* Ceramic Wire Gauze on Top */}
        <rect x="36" y="85" width="88" height="12" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
        <rect x="40" y="87" width="80" height="8" fill="url(#wire-mesh)" />
        {/* Ceramic center circle */}
        <ellipse cx="80" cy="91" rx="18" ry="3.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    );
  }

  // Helper: Retort Stand & Clamp
  if (type === 'retort-stand' || type === 'stand') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        {/* Heavy Cast Iron Base */}
        <rect x="25" y="175" width="110" height="12" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

        {/* Vertical Steel Rod */}
        <rect x="35" y="15" width="6" height="162" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

        {/* Bosshead / Clamp Bracket */}
        <rect x="32" y="65" width="12" height="14" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        {/* Bosshead Screw Knob */}
        <circle cx="28" cy="72" r="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="1" />

        {/* Clamp Arm */}
        <rect x="44" y="70" width="35" height="4" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
        {/* Clamp Jaws / Fingers */}
        <path d="M 78 62 C 84 65 84 79 78 82" fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Helper: Dropper Pipette
  if (type === 'dropper-pipette' || type === 'dropper') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        {/* Rubber Squeeze Bulb */}
        <path d="M 72 40 C 65 30 65 18 80 18 C 95 18 95 30 88 40 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />

        {/* Glass Pipette Body */}
        <rect x="76" y="40" width="8" height="90" rx="1" fill="rgba(255, 255, 255, 0.25)" stroke="#ffffff" strokeWidth="1.2" />

        {/* Liquid in dropper */}
        <rect x="77" y="75" width="6" height="55" fill={liquidColor} fillOpacity="0.85" />

        {/* Tapered Jet Tip */}
        <polygon points="76,130 84,130 81,155 79,155" fill="rgba(255, 255, 255, 0.3)" stroke="#ffffff" strokeWidth="1" />

        {/* Suspended Droplet at Tip */}
        <circle cx="80" cy="162" r="2.5" fill={liquidColor} />
      </svg>
    );
  }

  // Helper: Thermometer
  if (type === 'thermometer') {
    // Height of mercury column mapped from 25 to 100°C: y=160 (bulb) to y=45
    const tempClamped = Math.min(100, Math.max(0, temperature));
    const columnHeight = (tempClamped / 100) * 115;
    const colY = 160 - columnHeight;

    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        {/* Glass Capillary Stem */}
        <rect x="76" y="30" width="8" height="135" rx="4" fill="rgba(255, 255, 255, 0.2)" stroke="#ffffff" strokeWidth="1.2" />

        {/* Red Mercury/Alcohol Bulb */}
        <circle cx="80" cy="165" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />

        {/* Liquid Column */}
        <rect x="78.5" y={colY} width="3" height={columnHeight + 5} fill="#ef4444" rx="1" />

        {/* Temperature Graduation Marks */}
        <g stroke="rgba(255, 255, 255, 0.7)" strokeWidth="0.8">
          {[0, 25, 50, 75, 100].map((t) => {
            const y = 160 - (t / 100) * 115;
            return (
              <g key={t}>
                <line x1="84" y1={y} x2="90" y2={y} />
                <text x="92" y={y + 2.5} fill="rgba(255,255,255,0.85)" fontSize="5.5" fontFamily="sans-serif">
                  {t}°
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  // Helper: Filter Paper (Circular Qualitative Disc & Quadrant Fold)
  if (type === 'filter-paper') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <radialGradient id="paper-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
          <filter id="paper-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Circular Filter Disc */}
        <circle
          cx="80"
          cy="100"
          r="54"
          fill="url(#paper-grad)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
          filter="url(#paper-shadow)"
        />

        {/* Paper Texture Rings */}
        <circle cx="80" cy="100" r="42" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2,2" />
        <circle cx="80" cy="100" r="26" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3,3" />

        {/* Fold Creases (Half & Quarter Folds) */}
        <line x1="80" y1="46" x2="80" y2="154" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.7" />
        <line x1="26" y1="100" x2="134" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.7" />

        {/* Fluted Cone Fold Flap */}
        <path
          d="M 80 100 L 118 62 A 54 54 0 0 1 134 100 Z"
          fill="#f8fafc"
          fillOpacity="0.5"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />

        {/* Sand / Solid Residue if filtered */}
        {hasResidue && (
          <g>
            <circle cx="78" cy="98" r="14" fill="#b45309" fillOpacity="0.45" />
            <circle cx="82" cy="103" r="10" fill="#92400e" fillOpacity="0.55" />
            <circle cx="76" cy="104" r="2" fill="#78350f" />
            <circle cx="83" cy="95" r="2.5" fill="#78350f" />
            <circle cx="72" cy="97" r="1.8" fill="#92400e" />
            <circle cx="87" cy="101" r="2" fill="#78350f" />
            <circle cx="80" cy="107" r="1.5" fill="#92400e" />
            <circle cx="79" cy="93" r="1.5" fill="#b45309" />
          </g>
        )}

        {/* Central Label */}
        <text
          x="80"
          y="166"
          textAnchor="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize="9"
          fontFamily="sans-serif"
          fontWeight="500"
        >
          {hasResidue ? 'Sand Residue' : 'Filter Paper'}
        </text>
      </svg>
    );
  }

  // Helper: Glass Stirring Rod
  if (type === 'glass-rod') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <linearGradient id="glass-rod-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#94a3b8" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Glass Rod Body */}
        <rect
          x="77"
          y="25"
          width="6"
          height="150"
          rx="3"
          fill="url(#glass-rod-grad)"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="0.8"
        />

        {/* Specular Highlight Streak */}
        <line
          x1="78.5"
          y1="28"
          x2="78.5"
          y2="172"
          stroke="#ffffff"
          strokeWidth="1"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />

        {/* Rounded End Tips */}
        <ellipse cx="80" cy="27" rx="2.5" ry="2" fill="#ffffff" fillOpacity="0.6" />
        <ellipse cx="80" cy="173" rx="2.5" ry="2" fill="#ffffff" fillOpacity="0.6" />
      </svg>
    );
  }

  // Helper: Digital Analytical Balance (0.001g Precision)
  if (type === 'analytical-balance' || type === 'balance') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-xl select-none ${className}`}
      >
        <defs>
          <linearGradient id="balance-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="pan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Stainless Steel Weighing Pan */}
        <ellipse cx="80" cy="85" rx="46" ry="10" fill="url(#pan-grad)" stroke="#64748b" strokeWidth="1.2" />
        <ellipse cx="80" cy="84" rx="42" ry="8" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" />
        {/* Central Pan Stem Support */}
        <rect x="76" y="92" width="8" height="12" fill="#475569" stroke="#334155" strokeWidth="1" />

        {/* Balance Main Body */}
        <rect
          x="18"
          y="102"
          width="124"
          height="76"
          rx="10"
          fill="url(#balance-body-grad)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Leveling Feet */}
        <rect x="26" y="178" width="12" height="5" rx="1.5" fill="#020617" />
        <rect x="122" y="178" width="12" height="5" rx="1.5" fill="#020617" />

        {/* Backlit Digital LCD Display */}
        <rect x="28" y="112" width="104" height="34" rx="5" fill="#020617" stroke="#1e293b" strokeWidth="1" />
        <text
          x="122"
          y="136"
          textAnchor="end"
          fill="#38bdf8"
          fontSize="18"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1"
        >
          {volume > 0 ? `${(volume * 1.025).toFixed(3)}` : '0.000'}
        </text>
        <text x="126" y="126" fill="#38bdf8" fontSize="8" fontFamily="sans-serif">
          g
        </text>

        {/* Control Buttons (TARE / CAL / ZERO) */}
        <g fontSize="7" fontFamily="sans-serif" fontWeight="bold">
          <rect x="30" y="152" width="28" height="15" rx="3" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          <text x="44" y="162" textAnchor="middle" fill="#94a3b8">ZERO</text>

          <rect x="66" y="152" width="28" height="15" rx="3" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          <text x="80" y="162" textAnchor="middle" fill="#94a3b8">CAL</text>

          <rect x="102" y="152" width="30" height="15" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
          <text x="117" y="162" textAnchor="middle" fill="#ffffff">TARE</text>
        </g>
      </svg>
    );
  }

  // Helper: Separatory Funnel (250 mL)
  if (type === 'separatory-funnel') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <defs>
          <linearGradient id="sep-glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Ground Glass Stopper */}
        <polygon points="73,15 87,15 84,32 76,32" fill="#94a3b8" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="80" cy="14" rx="10" ry="3.5" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" />

        {/* Pear-shaped Funnel Bulb */}
        <path
          d="M 75 32 L 85 32 L 85 45 C 115 58 116 105 87 136 L 85 152 L 75 152 L 73 136 C 44 105 45 58 75 45 Z"
          fill="rgba(15, 23, 42, 0.4)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Dual Phase Liquid Layers if volume > 0 */}
        {fillFraction > 0 && (
          <g>
            {/* Lower Aqueous Phase */}
            <path
              d="M 73 136 C 58 120 54 102 54 94 L 106 94 C 106 102 102 120 87 136 Z"
              fill={liquidColor}
              fillOpacity="0.85"
            />
            {/* Upper Organic Phase */}
            <path
              d="M 54 94 C 52 82 58 64 75 48 L 85 48 C 102 64 108 82 106 94 Z"
              fill="#fef08a"
              fillOpacity="0.75"
            />
            {/* Phase Boundary Interface */}
            <line x1="54" y1="94" x2="106" y2="94" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2,2" />
          </g>
        )}

        {/* Glass Wall Reflection Highlight */}
        <path
          d="M 75 32 L 85 32 L 85 45 C 115 58 116 105 87 136 L 85 152 L 75 152 L 73 136 C 44 105 45 58 75 45 Z"
          fill="url(#sep-glass-grad)"
          pointerEvents="none"
        />

        {/* PTFE Stopcock Valve */}
        <rect x="68" y="152" width="24" height="8" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="80" cy="156" r="3" fill="#ffffff" />

        {/* Delivery Stem Tip */}
        <polygon points="77,160 83,160 81,188 79,188" fill="rgba(255, 255, 255, 0.3)" stroke="#ffffff" strokeWidth="1.2" />
      </svg>
    );
  }

  // Helper: Gas Syringe (100 mL)
  if (type === 'gas-syringe') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        {/* Syringe Luer Nozzle Tip */}
        <rect x="77" y="170" width="6" height="18" fill="#94a3b8" stroke="#ffffff" strokeWidth="1" />

        {/* Main Syringe Glass Barrel */}
        <rect
          x="62"
          y="50"
          width="36"
          height="120"
          rx="4"
          fill="rgba(15, 23, 42, 0.4)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Graduations (0 to 100 mL) */}
        <g stroke="rgba(255, 255, 255, 0.7)" strokeWidth="0.8">
          {[0, 20, 40, 60, 80, 100].map((v) => {
            const y = 160 - (v / 100) * 100;
            return (
              <g key={v}>
                <line x1="62" y1={y} x2="70" y2={y} />
                <text x="73" y={y + 2.5} fill="#ffffff" fontSize="6" fontFamily="sans-serif">
                  {v}
                </text>
              </g>
            );
          })}
        </g>

        {/* Internal Plunger Seal & Piston */}
        <rect x="64" y="65" width="32" height="12" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
        {/* Plunger Shaft */}
        <rect x="77" y="15" width="6" height="50" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        {/* Plunger Thumb Flange */}
        <ellipse cx="80" cy="15" rx="14" ry="4" fill="#64748b" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  // Helper: Digital pH Meter Probe
  if (type === 'ph-meter') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        {/* Handheld Instrument Housing */}
        <rect x="48" y="25" width="64" height="95" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Digital LCD Backlit Screen */}
        <rect x="56" y="36" width="48" height="30" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1" />
        <text
          x="80"
          y="56"
          textAnchor="middle"
          fill="#34d399"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {temperature > 0 && Math.abs(temperature - 25) > 1 ? `pH 7.00` : 'pH 7.00'}
        </text>
        <text x="80" y="63" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">
          ATC 25.0°C
        </text>

        {/* Calibration Buttons */}
        <circle cx="68" cy="82" r="5" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        <circle cx="92" cy="82" r="5" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        <rect x="65" y="96" width="30" height="10" rx="2" fill="#0284c7" />
        <text x="80" y="103.5" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">
          CAL
        </text>

        {/* Coiled Flexible Sensor Lead */}
        <path d="M 80 120 C 80 135 115 135 115 150 C 115 165 80 160 80 175" fill="none" stroke="#475569" strokeWidth="2.5" />

        {/* Glass Bulb Electrode Tip */}
        <rect x="76" y="165" width="8" height="22" rx="4" fill="rgba(255, 255, 255, 0.4)" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="80" cy="188" r="4.5" fill="#38bdf8" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  // Helper: Electrical Conductivity Probe
  if (type === 'conductivity-meter') {
    return (
      <svg
        viewBox="0 0 160 200"
        width={width}
        height={height}
        className={`filter drop-shadow-lg select-none ${className}`}
      >
        <rect x="48" y="25" width="64" height="95" rx="10" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
        <rect x="56" y="36" width="48" height="30" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1" />
        <text x="80" y="56" textAnchor="middle" fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
          1413
        </text>
        <text x="80" y="63" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">
          µS/cm (25°C)
        </text>

        {/* Probe Stem & Platinum Electrodes */}
        <rect x="76" y="120" width="8" height="55" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <rect x="74" y="175" width="3" height="10" fill="#cbd5e1" />
        <rect x="83" y="175" width="3" height="10" fill="#cbd5e1" />
      </svg>
    );
  }

  // Fallback generic beaker
  return (
    <svg viewBox="0 0 160 200" width={width} height={height} className={className}>
      <rect x="40" y="40" width="80" height="120" rx="6" fill="rgba(255, 255, 255, 0.15)" stroke="#ffffff" strokeWidth="2" />
      <text x="80" y="105" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="sans-serif">
        {type}
      </text>
    </svg>
  );
};
