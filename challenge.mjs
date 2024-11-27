const pendingRequests = new Map();

const TIMEOUT_DURATION = 40000;

export async function blockingGet(key) {
  return new Promise((resolve) => {
    if (!pendingRequests.has(key)) {
      pendingRequests.set(key, []);
    }

    pendingRequests.get(key).push(resolve);

    setTimeout(() => {
      const queue = pendingRequests.get(key);
      if (queue) {
        const index = queue.indexOf(resolve);
        if (index !== -1) {
          queue.splice(index, 1);
        }

        if (queue.length === 0) {
          pendingRequests.delete(key);
        }

        resolve(null);
      }
    }, TIMEOUT_DURATION);
  });
}

export async function push(key, data) {
  const queue = pendingRequests.get(key);

  if (queue && queue.length > 0) {
    const resolve = queue.shift();

    if (queue.length === 0) {
      pendingRequests.delete(key);
    }

    resolve(data);
  }
}
