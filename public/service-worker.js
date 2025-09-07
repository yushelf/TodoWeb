// 缓存名称和版本
const CACHE_NAME = 'todo-app-cache-v1';

// 需要缓存的资源列表
const CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

// 安装服务工作线程
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // 预缓存静态资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活服务工作线程
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
          return null;
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching');
  
  event.respondWith(
    // 尝试从缓存中获取资源
    caches.match(event.request)
      .then((response) => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request)
          .then((res) => {
            // 检查响应是否有效
            if (!res || res.status !== 200 || res.type !== 'basic') {
              return res;
            }
            
            // 克隆响应（因为响应流只能使用一次）
            const responseToCache = res.clone();
            
            // 将新响应添加到缓存
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return res;
          });
      })
      .catch(() => {
        // 如果网络请求失败且没有缓存，可以返回一个离线页面
        if (event.request.url.includes('.html')) {
          return caches.match('/offline.html');
        }
        return null;
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncData());
  }
});

// 模拟数据同步函数
async function syncData() {
  try {
    // 从IndexedDB获取待同步的数据
    const dataToSync = await getDataToSync();
    
    if (dataToSync && dataToSync.length > 0) {
      // 发送数据到服务器
      await sendToServer(dataToSync);
      
      // 更新同步状态
      await updateSyncStatus(dataToSync);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// 这些函数在实际应用中需要实现
function getDataToSync() {
  // 从IndexedDB获取待同步的数据
  return Promise.resolve([]);
}

function sendToServer(data) {
  // 发送数据到服务器
  return Promise.resolve();
}

function updateSyncStatus(data) {
  // 更新同步状态
  return Promise.resolve();
}