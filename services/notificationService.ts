// Push Notification Service for AgriHub
// Handles Web Push API integration for price alerts and updates

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    url?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string }>;
}

class NotificationService {
    private registration: ServiceWorkerRegistration | null = null;

    /**
     * Initialize notification service and request permission
     */
    async initialize(): Promise<boolean> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported');
            return false;
        }

        try {
            // Get service worker registration
            this.registration = await navigator.serviceWorker.ready;

            // Check current permission
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
            return false;
        }
    }

    /**
     * Request notification permission from user
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return 'denied';
        }

        return await Notification.requestPermission();
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled(): boolean {
        return Notification.permission === 'granted';
    }

    /**
     * Subscribe to push notifications
     * Note: Requires VAPID keys for production use
     */
    async subscribe(): Promise<PushSubscription | null> {
        if (!this.registration) {
            await this.initialize();
        }

        if (!this.registration) {
            return null;
        }

        try {
            // Check if already subscribed
            const existingSubscription = await this.registration.pushManager.getSubscription();
            if (existingSubscription) {
                return existingSubscription;
            }

            // Subscribe to push notifications
            // TODO: Replace with your VAPID public key
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE'
                )
            });

            // Send subscription to backend (implement your API endpoint)
            await this.sendSubscriptionToBackend(subscription);

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(): Promise<boolean> {
        if (!this.registration) {
            return false;
        }

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Remove subscription from backend
                await this.removeSubscriptionFromBackend(subscription);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            return false;
        }
    }

    /**
     * Show a local notification (doesn't require push subscription)
     */
    async showNotification(payload: NotificationPayload): Promise<void> {
        if (!this.registration) {
            await this.initialize();
        }

        if (!this.registration || !this.isEnabled()) {
            console.warn('Notifications not enabled');
            return;
        }

        await this.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/logo.webp',
            badge: '/logo.webp',
            tag: payload.tag || 'agrihub-notification',
            requireInteraction: payload.requireInteraction || false,
            vibrate: [200, 100, 200],
            data: {
                url: payload.url || '/',
                timestamp: Date.now()
            },
            actions: payload.actions || [
                { action: 'open', title: 'View' },
                { action: 'close', title: 'Dismiss' }
            ]
        } as any);
    }

    /**
     * Send price alert notification
     */
    async sendPriceAlert(commodity: string, oldPrice: number, newPrice: number): Promise<void> {
        const trend = newPrice > oldPrice ? '📈' : '📉';
        const change = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);

        await this.showNotification({
            title: `${trend} ${commodity} Price Alert`,
            body: `Price changed from GH₵${oldPrice} to GH₵${newPrice} (${change}%)`,
            tag: `price-alert-${commodity}`,
            url: '/prices',
            requireInteraction: true
        });
    }

    /**
     * Send weather warning notification
     */
    async sendWeatherWarning(warning: string, location: string): Promise<void> {
        await this.showNotification({
            title: '⚠️ Weather Warning',
            body: `${warning} in ${location}`,
            tag: 'weather-warning',
            url: '/dashboard',
            requireInteraction: true
        });
    }

    /**
     * Send marketplace notification
     */
    async sendMarketplaceNotification(title: string, message: string): Promise<void> {
        await this.showNotification({
            title: `🛒 ${title}`,
            body: message,
            tag: 'marketplace-notification',
            url: '/marketplace'
        });
    }

    /**
     * Helper: Convert VAPID key to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): any {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray as unknown as Uint8Array;
    }

    /**
     * Send subscription to backend (implement your API)
     */
    private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
        // TODO: Implement your backend API endpoint
        console.log('Subscription to send to backend:', JSON.stringify(subscription));

        // Example:
        // await fetch('/api/push-subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subscription)
        // });
    }

    /**
     * Remove subscription from backend
     */
    private async removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
        // TODO: Implement your backend API endpoint
        console.log('Subscription to remove from backend:', JSON.stringify(subscription));

        // Example:
        // await fetch('/api/push-unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subscription)
        // });
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
