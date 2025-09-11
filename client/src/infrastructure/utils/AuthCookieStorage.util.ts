export const AuthCookieStorage = {
  	getItem: (key: string): string | null => {
    	if (typeof document === 'undefined') return null;
		
		const cookies = document.cookie.split(';');
    	
		for (const cookie of cookies) {
			const [cookieKey, cookieValue] = cookie.trim().split('=');
      
			if (cookieKey === key) {
				return decodeURIComponent(cookieValue);
      		}
		}
    return null;
  	},
  	
	setItem: (key: string, value: string): void => {
    	if (typeof document === 'undefined') return;

		document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
	},

  	removeItem: (key: string): void => {
    	if (typeof document === 'undefined') return;
    	
		document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  	},
};