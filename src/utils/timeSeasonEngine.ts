// Real-World Earth Time, Date, Year & Season Synchronization Engine

export type SeasonType = 'summer' | 'autumn' | 'winter' | 'spring';
export type TimeOfDayType = 'dawn' | 'day' | 'sunset' | 'night';

export interface WorldTimeSeasonState {
  // Real Date & Time
  localDateString: string;
  localTimeString: string;
  dayOfWeek: string;
  year: number;
  monthName: string;
  dayOfMonth: number;
  hours: number;
  minutes: number;
  seconds: number;
  timezone: string;
  stardate: string;

  // Real-world Season & Time of Day
  season: SeasonType;
  seasonName: string;
  seasonIcon: string;
  seasonDescription: string;
  timeOfDay: TimeOfDayType;
  timeOfDayName: string;
  timeOfDayIcon: string;

  // Environmental Visual Parameters
  ambientLightingColor: string;
  skyTint: string;
  particleType: 'solar_flares' | 'amber_leaves' | 'quantum_snow' | 'sakura_petals';
  isRealWorldSynced: boolean;
}

export function getCurrentSeason(monthIndex: number, isNorthernHemisphere: boolean = true): {
  season: SeasonType;
  name: string;
  icon: string;
  desc: string;
  particle: 'solar_flares' | 'amber_leaves' | 'quantum_snow' | 'sakura_petals';
} {
  // monthIndex: 0 = January, 11 = December
  // Northern Hemisphere:
  // Dec, Jan, Feb -> Winter
  // Mar, Apr, May -> Spring
  // Jun, Jul, Aug -> Summer
  // Sep, Oct, Nov -> Autumn

  let season: SeasonType;

  if (monthIndex >= 5 && monthIndex <= 7) {
    season = isNorthernHemisphere ? 'summer' : 'winter';
  } else if (monthIndex >= 8 && monthIndex <= 10) {
    season = isNorthernHemisphere ? 'autumn' : 'spring';
  } else if (monthIndex === 11 || monthIndex <= 1) {
    season = isNorthernHemisphere ? 'winter' : 'summer';
  } else {
    season = isNorthernHemisphere ? 'spring' : 'autumn';
  }

  const seasonMap = {
    summer: {
      name: 'Summer (Grishma Ritu)',
      icon: '☀️',
      desc: 'Radiant golden solar energy, vibrant turquoise fountains, clear cosmic nebulae, and maximum solar power.',
      particle: 'solar_flares' as const,
    },
    autumn: {
      name: 'Autumn / Fall (Sharad Ritu)',
      icon: '🍂',
      desc: 'Amber twilight skies, floating golden cyber leaves, harvesting galactic starlight, and soothing golden hour haze.',
      particle: 'amber_leaves' as const,
    },
    winter: {
      name: 'Winter (Shishir / Hemant Ritu)',
      icon: '❄️',
      desc: 'Gently falling quantum snowflakes, frosted crystal palace arches, crisp celestial air, and glowing arctic cyan auroras.',
      particle: 'quantum_snow' as const,
    },
    spring: {
      name: 'Spring (Vasant Ritu)',
      icon: '🌸',
      desc: 'Drifting neon sakura blossoms, quantum rejuvenation energy, gentle ambient rain, and revitalizing emerald aurora.',
      particle: 'sakura_petals' as const,
    },
  };

  return {
    season,
    ...seasonMap[season],
  };
}

export function getTimeOfDay(hours: number): {
  timeOfDay: TimeOfDayType;
  name: string;
  icon: string;
  ambientColor: string;
  skyTint: string;
} {
  if (hours >= 5 && hours < 8) {
    return {
      timeOfDay: 'dawn',
      name: 'Dawn / Golden Sunrise',
      icon: '🌅',
      ambientColor: 'rgba(255, 180, 80, 0.15)',
      skyTint: 'rgba(255, 120, 50, 0.2)',
    };
  } else if (hours >= 8 && hours < 17) {
    return {
      timeOfDay: 'day',
      name: 'Daylight / High Noon',
      icon: '☀️',
      ambientColor: 'rgba(0, 240, 255, 0.1)',
      skyTint: 'rgba(0, 180, 255, 0.15)',
    };
  } else if (hours >= 17 && hours < 20) {
    return {
      timeOfDay: 'sunset',
      name: 'Twilight / Sunset Glow',
      icon: '🌇',
      ambientColor: 'rgba(255, 80, 120, 0.2)',
      skyTint: 'rgba(180, 40, 120, 0.25)',
    };
  } else {
    return {
      timeOfDay: 'night',
      name: 'Cosmic Midnight',
      icon: '🌙',
      ambientColor: 'rgba(10, 20, 50, 0.3)',
      skyTint: 'rgba(2, 6, 20, 0.4)',
    };
  }
}

export function getLiveWorldTimeSeason(customDate?: Date, overrideSeason?: SeasonType): WorldTimeSeasonState {
  const now = customDate || new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const dayOfMonth = now.getDate();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayOfWeek = days[now.getDay()];
  const monthName = months[monthIndex];

  // Season & Time of Day
  const seasonInfo = getCurrentSeason(monthIndex, true);
  const activeSeason = overrideSeason || seasonInfo.season;
  const timeOfDayInfo = getTimeOfDay(hours);

  // Formatted date and time strings
  const pad = (n: number) => n.toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const localTimeString = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  const localDateString = `${dayOfWeek}, ${dayOfMonth} ${monthName} ${year}`;

  // Stardate calculation
  const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const stardate = `${year}.${pad(dayOfYear)}.${pad(hours)}${pad(minutes)}`;

  return {
    localDateString,
    localTimeString,
    dayOfWeek,
    year,
    monthName,
    dayOfMonth,
    hours,
    minutes,
    seconds,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
    stardate,
    season: activeSeason,
    seasonName: seasonInfo.name,
    seasonIcon: seasonInfo.icon,
    seasonDescription: seasonInfo.desc,
    timeOfDay: timeOfDayInfo.timeOfDay,
    timeOfDayName: timeOfDayInfo.name,
    timeOfDayIcon: timeOfDayInfo.icon,
    ambientLightingColor: timeOfDayInfo.ambientColor,
    skyTint: timeOfDayInfo.skyTint,
    particleType: seasonInfo.particle,
    isRealWorldSynced: !overrideSeason,
  };
}
