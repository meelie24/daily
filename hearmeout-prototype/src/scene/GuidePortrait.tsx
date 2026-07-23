/**
 * The HearMeOut Guide, as a prototype portrait treatment. Original
 * stylized art for this evaluation only; not final character design.
 * Calm adult man, charcoal coat, restrained teal and amber details.
 */
export function GuidePortrait({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="The Guide, a calm observer in a charcoal coat"
      style={{ borderRadius: 15, display: "block", flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="g-bg" cx="32%" cy="24%" r="95%">
          <stop offset="0%" stopColor="#F2FAF8" />
          <stop offset="55%" stopColor="#DCEEEA" />
          <stop offset="100%" stopColor="#BFD8D2" />
        </radialGradient>
        <linearGradient id="g-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6E3BC" stopOpacity="0" />
          <stop offset="100%" stopColor="#E8C98E" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="g-coat" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#454D55" />
          <stop offset="55%" stopColor="#31383f" />
          <stop offset="100%" stopColor="#22272c" />
        </linearGradient>
        <linearGradient id="g-lapel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a424a" />
          <stop offset="100%" stopColor="#272d33" />
        </linearGradient>
        <radialGradient id="g-skin" cx="36%" cy="30%" r="82%">
          <stop offset="0%" stopColor="#CB9668" />
          <stop offset="62%" stopColor="#B58052" />
          <stop offset="100%" stopColor="#92643C" />
        </radialGradient>
        <linearGradient id="g-hair" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3A3835" />
          <stop offset="100%" stopColor="#1E1C1A" />
        </linearGradient>
        <linearGradient id="g-scarf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#128086" />
          <stop offset="100%" stopColor="#0B5F63" />
        </linearGradient>
      </defs>

      <rect width="120" height="120" fill="url(#g-bg)" />
      {/* soft amber rim light from the right */}
      <rect width="120" height="120" fill="url(#g-rim)" />

      {/* coat, shoulders and lapels */}
      <path d="M16 120 C18 90 35 80 60 80 C85 80 102 90 104 120 Z" fill="url(#g-coat)" />
      <path d="M46 82 L57 96 L52 104 L40 88 Z" fill="url(#g-lapel)" />
      <path d="M74 82 L63 96 L68 104 L80 88 Z" fill="url(#g-lapel)" />
      {/* collar shadow */}
      <path d="M46 82 C52 88 68 88 74 82 L70 80 L50 80 Z" fill="#191d21" />

      {/* teal scarf tucked into the coat */}
      <path
        d="M50 83 C54 91 57 95 60 97 C63 95 66 91 70 83 L65 80 C63 85 61 88 60 89 C59 88 57 85 55 80 Z"
        fill="url(#g-scarf)"
      />
      {/* amber pin */}
      <circle cx="78" cy="95" r="2.8" fill="#C57800" />
      <circle cx="77.2" cy="94.2" r="0.9" fill="#EFC27E" />

      {/* neck */}
      <path d="M52 66 h16 v16 c0 5.5 -16 5.5 -16 0 Z" fill="#9A6B41" />
      <path d="M52 66 h16 v7 c-5 3.4 -11 3.4 -16 0 Z" fill="#7E5432" />

      {/* head */}
      <ellipse cx="60" cy="49" rx="20.5" ry="23.5" fill="url(#g-skin)" />
      {/* ears */}
      <ellipse cx="40" cy="51" rx="3.2" ry="5" fill="#A87647" />
      <ellipse cx="80" cy="51" rx="3.2" ry="5" fill="#A87647" />
      <ellipse cx="40.6" cy="51" rx="1.4" ry="2.6" fill="#8B5C33" />
      <ellipse cx="79.4" cy="51" rx="1.4" ry="2.6" fill="#8B5C33" />

      {/* short tidy hair with a clean hairline */}
      <path
        d="M39.5 47 C39 29 48 22.5 60 22.5 C72 22.5 81 29 80.5 47
           C80 41.5 77.5 38.2 73.5 37.2 C65.5 34.6 54.5 34.6 46.5 37.2
           C42.5 38.2 40 41.5 39.5 47 Z"
        fill="url(#g-hair)"
      />
      {/* temple fade */}
      <path d="M39.5 47 C40 42 42 39 45 38 C43 41 41.8 44 41.6 48 Z" fill="#2A2724" />
      <path d="M80.5 47 C80 42 78 39 75 38 C77 41 78.2 44 78.4 48 Z" fill="#2A2724" />

      {/* face shading: left side turned slightly from the light */}
      <path
        d="M42 42 C41 52 44 63 50 69 C45 62 43.5 52 44 42 Z"
        fill="rgba(90, 55, 25, 0.28)"
      />

      {/* brows: level, slightly drawn, observant */}
      <path d="M45.5 44.5 q5 -2.6 10.5 -0.8 l-0.5 2.6 q-5 -1.4 -9.6 0.6 Z" fill="#2B2A27" />
      <path d="M74.5 44.5 q-5 -2.6 -10.5 -0.8 l0.5 2.6 q5 -1.4 9.6 0.6 Z" fill="#2B2A27" />

      {/* eyes: steady, lidded, with catchlights */}
      <path d="M46.5 51 q5.5 -3.6 10.5 0 q-5 3.4 -10.5 0 Z" fill="#F4EFE8" />
      <path d="M63 51 q5.5 -3.6 10.5 0 q-5 3.4 -10.5 0 Z" fill="#F4EFE8" />
      <circle cx="52" cy="51" r="2.5" fill="#3A2A18" />
      <circle cx="68.2" cy="51" r="2.5" fill="#3A2A18" />
      <circle cx="52" cy="51" r="1.1" fill="#1B1410" />
      <circle cx="68.2" cy="51" r="1.1" fill="#1B1410" />
      <circle cx="52.9" cy="50.2" r="0.6" fill="#F4EFE8" />
      <circle cx="69.1" cy="50.2" r="0.6" fill="#F4EFE8" />
      {/* upper lids */}
      <path d="M46.5 50.6 q5.5 -3.4 10.5 -0.2 l0 -1.2 q-5 -3 -10.5 0 Z" fill="#8B5C33" />
      <path d="M63 50.6 q5.5 -3.4 10.5 -0.2 l0 -1.2 q-5 -3 -10.5 0 Z" fill="#8B5C33" />

      {/* nose with a soft shadow */}
      <path d="M60 52 L58.2 61.5 C58.2 63 61.8 63 61.8 61.5 L60 52 Z" fill="#A87647" />
      <path d="M58.4 61.8 q1.6 1 3.2 0 q-1.6 1.8 -3.2 0 Z" fill="#8B5C33" />

      {/* mouth: level, composed */}
      <path
        d="M54 68.5 C58 70 62 70 66 68.5"
        stroke="#6E4526"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
      {/* light beard shadow */}
      <path
        d="M45.5 60 C47 69.5 53 74.5 60 74.5 C67 74.5 73 69.5 74.5 60
           C73.5 71 67.5 77 60 77 C52.5 77 46.5 71 45.5 60 Z"
        fill="rgba(43, 42, 39, 0.22)"
      />
    </svg>
  );
}
