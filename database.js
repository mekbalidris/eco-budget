const DATABASE_NAME = 'ecobudget';
const DATABASE_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('transactions')) {
        database.createObjectStore('transactions', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('budgets')) {
        database.createObjectStore('budgets', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('savingsGoals')) {
        database.createObjectStore('savingsGoals', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings');
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadCollection(storeName) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
      database.close();
    };
  });
}

export async function saveCollection(storeName, items) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    store.clear();
    items.forEach((item) => store.put(item));

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function loadSetting(key) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const request = transaction.objectStore('settings').get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
      database.close();
    };
  });
}

export async function saveSetting(key, value) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readwrite');
    transaction.objectStore('settings').put(value, key);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
