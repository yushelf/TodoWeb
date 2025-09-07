// 通知服务，用于显示系统通知

/**
 * 请求通知权限
 * @returns 返回一个Promise，解析为通知权限状态
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  // 检查浏览器是否支持通知
  if (!('Notification' in window)) {
    console.warn('此浏览器不支持桌面通知');
    return 'denied';
  }

  // 如果已经有权限，直接返回
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // 如果之前没有拒绝过，请求权限
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * 显示通知
 * @param title 通知标题
 * @param options 通知选项
 * @returns 返回创建的通知对象，如果没有权限则返回null
 */
export const showNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  // 检查是否有通知权限
  if (Notification.permission !== 'granted') {
    console.warn('没有通知权限');
    return null;
  }

  try {
    // 创建并返回通知
    const notification = new Notification(title, options);
    
    // 设置通知点击事件
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    return null;
  }
};

/**
 * 显示番茄钟完成通知
 */
export const showPomodoroCompleteNotification = (): void => {
  showNotification('番茄钟完成！', {
    body: '恭喜你完成了一个番茄钟，现在可以休息一下了。',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    silent: false,
  });
};

/**
 * 显示休息完成通知
 */
export const showBreakCompleteNotification = (): void => {
  showNotification('休息时间结束', {
    body: '休息时间已结束，准备开始新的番茄钟吧！',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    silent: false,
  });
};