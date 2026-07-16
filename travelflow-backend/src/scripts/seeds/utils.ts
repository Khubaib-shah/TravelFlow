

// Returns a random date between today and `daysAgo` days ago
export function getRandomDate(daysAgo = 120, businessHoursOnly = true): Date {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysAgo);

  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  const date = new Date(randomTime);

  // If business hours only, ensure time is between 10 AM and 8 PM
  if (businessHoursOnly) {
    const hours = Math.floor(Math.random() * 10) + 10; // 10 to 19
    const minutes = Math.floor(Math.random() * 60);
    date.setHours(hours, minutes, 0, 0);

    // If Sunday, move to Monday (Sunday is 0 in JS Date)
    if (date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    }
  }

  // Ensure we don't return a date in the future
  if (date.getTime() > now.getTime()) {
    return now;
  }
  
  return date;
}

export function generateRef(prefix: string, length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an array of multiple random items from an array
export function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
