/**
 * Opciones disponibles para los canales de notificación, derivadas del enum `NotificationChannel` de Prisma.
 * Este array puede ser útil para validación o para presentar opciones en la interfaz de usuario.
 */
import { NotificationChannel } from '@prisma/client';

export const NotificationChannelOption = [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
    NotificationChannel.PUSH,
    NotificationChannel.SMS,
];
