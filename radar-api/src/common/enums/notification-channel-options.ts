import { NotificationChannel } from '@prisma/client';

export const NotificationChannelOption = [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
    NotificationChannel.PUSH,
    NotificationChannel.SMS,
];
