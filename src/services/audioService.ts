// 音频服务，用于播放番茄钟相关的音效

// 音频类型枚举
export enum AudioType {
  POMODORO_COMPLETE = 'pomodoro_complete',
  BREAK_COMPLETE = 'break_complete',
  BUTTON_CLICK = 'button_click'
}

// 音频URL映射
const audioUrls: Record<AudioType, string> = {
  [AudioType.POMODORO_COMPLETE]: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // 番茄钟完成音效
  [AudioType.BREAK_COMPLETE]: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',   // 休息完成音效
  [AudioType.BUTTON_CLICK]: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'      // 按钮点击音效
};

// 音频缓存
const audioCache: Record<AudioType, HTMLAudioElement> = {} as Record<AudioType, HTMLAudioElement>;

/**
 * 预加载所有音频文件
 */
export const preloadAudios = (): void => {
  Object.entries(audioUrls).forEach(([type, url]) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audioCache[type as AudioType] = audio;
  });
};

/**
 * 播放指定类型的音频
 * @param type 音频类型
 * @param volume 音量（0-1）
 */
export const playAudio = (type: AudioType, volume = 1): void => {
  // 如果音频未预加载，则先加载
  if (!audioCache[type]) {
    const audio = new Audio(audioUrls[type]);
    audioCache[type] = audio;
  }
  
  const audio = audioCache[type];
  audio.volume = volume;
  
  // 重置音频并播放
  audio.currentTime = 0;
  audio.play().catch(error => {
    console.error('播放音频失败:', error);
  });
};

/**
 * 停止播放指定类型的音频
 * @param type 音频类型
 */
export const stopAudio = (type: AudioType): void => {
  if (audioCache[type]) {
    audioCache[type].pause();
    audioCache[type].currentTime = 0;
  }
};

/**
 * 停止所有音频
 */
export const stopAllAudio = (): void => {
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
};