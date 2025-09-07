/**
 * 时间工具函数
 */

/**
 * 将秒数格式化为 MM:SS 格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * 将日期格式化为 YYYY-MM-DD 格式
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 将日期格式化为友好的显示格式
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDateFriendly = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  if (dateToCheck.getTime() === today.getTime()) {
    return '今天';
  } else if (dateToCheck.getTime() === yesterday.getTime()) {
    return '昨天';
  } else if (dateToCheck.getTime() === tomorrow.getTime()) {
    return '明天';
  } else {
    return formatDate(date);
  }
};

/**
 * 计算两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const date1Ms = new Date(date1).setHours(0, 0, 0, 0);
  const date2Ms = new Date(date2).setHours(0, 0, 0, 0);
  
  return Math.round(Math.abs((date1Ms - date2Ms) / oneDay));
};

/**
 * 检查日期是否已过期
 * @param date 要检查的日期
 * @returns 是否已过期
 */
export const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  return dateToCheck < today;
};