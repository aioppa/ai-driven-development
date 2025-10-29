// 크레딧 시스템 서비스

const DAILY_CREDITS = 20;
const STORAGE_KEY = 'user_credits';

export interface UserCredits {
  userId: string;
  credits: number;
  lastResetDate: string;
  totalGenerated: number;
}

// 로컬 스토리지에서 크레딧 정보 가져오기
export function getUserCredits(userId: string): UserCredits {
  if (typeof window === 'undefined') {
    return {
      userId,
      credits: DAILY_CREDITS,
      lastResetDate: new Date().toISOString().split('T')[0],
      totalGenerated: 0,
    };
  }

  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  if (!stored) {
    return {
      userId,
      credits: DAILY_CREDITS,
      lastResetDate: new Date().toISOString().split('T')[0],
      totalGenerated: 0,
    };
  }

  const data: UserCredits = JSON.parse(stored);
  
  // 날짜 확인 및 리셋
  const today = new Date().toISOString().split('T')[0];
  if (data.lastResetDate !== today) {
    data.credits = DAILY_CREDITS;
    data.lastResetDate = today;
    saveUserCredits(data);
  }

  return data;
}

// 크레딧 정보 저장
export function saveUserCredits(credits: UserCredits): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(
    `${STORAGE_KEY}_${credits.userId}`,
    JSON.stringify(credits)
  );
}

// 크레딧 사용
export function useCredit(userId: string, amount: number = 1): boolean {
  const credits = getUserCredits(userId);
  
  if (credits.credits < amount) {
    return false;
  }

  credits.credits -= amount;
  credits.totalGenerated += 1;
  saveUserCredits(credits);
  
  return true;
}

// 크레딧 확인
export function hasEnoughCredits(userId: string, amount: number = 1): boolean {
  const credits = getUserCredits(userId);
  return credits.credits >= amount;
}

// 크레딧 추가 (관리자용 또는 구매)
export function addCredits(userId: string, amount: number): void {
  const credits = getUserCredits(userId);
  credits.credits += amount;
  saveUserCredits(credits);
}

// 일일 리셋 확인
export function checkAndResetDailyCredits(userId: string): UserCredits {
  return getUserCredits(userId);
}

