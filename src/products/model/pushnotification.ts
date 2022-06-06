// should be split into several types for different push notification messages
// in the future
export type PushNotificationMessage = {
    event?: {
        type: 'ExactLocation' | 'Profile' | 'Shared';
        stream: string;
    };
    pn_apns: {
        aps: {
            alert: {
                title: string;
                body?: string;
            };
        };
        data?: {
            domain: string;
            type: string;
            from?: string;
            attributes?: object;
        };
    };
    pn_gcm: {
        data?: {
            title: string;
            body: string;
        };
        domain: string;
        type: string;
        from?: string;
        attributes?: object;
        notification?: {
            body: string;
        };
    };
};
