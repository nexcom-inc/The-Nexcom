export const clearObjectStore = (storeName: string) => {
    const request = indexedDB.open("Nexcom");

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      if (db.objectStoreNames.contains(storeName)) {
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        objectStore.clear();
      }
    };
  };


export const updateUserProfileInIndexedDB = (updatedUser: {
    email: string;
    name: string;
    id: string;
}) => {
    const request = indexedDB.open("Nexcom");

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      if (db.objectStoreNames.contains("profile")) {
        const transaction = db.transaction("profile", "readwrite");
        const objectStore = transaction.objectStore("profile");

        // Remplace l'utilisateur existant par les nouvelles données
        objectStore.put(updatedUser, "currentProfile");
      } else {
        console.error("L'object store 'profile' n'existe pas dans IndexedDB.");
      }
    };

    request.onerror = (event) => {
      console.error("Erreur lors de l'ouverture de la base de données:", event);
    };
  };
