const storageAdapter = {
  getItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('session_persistence') === 'session') {
      return window.sessionStorage.getItem(key);
    }
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('session_persistence') === 'session') {
      window.sessionStorage.setItem(key, value);
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    }
  }
}
console.log("Ready");
