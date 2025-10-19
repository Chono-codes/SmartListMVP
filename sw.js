self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
});

function checkTasks() {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ action: 'check-tasks' });
        });
    });
}

// Set interval for periodic checking
setInterval(checkTasks, 15 * 60 * 1000);