import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';

/**
 * Servicio para la gestión de usuarios.
 * Proporciona métodos para interactuar con los datos de usuario en la base de datos,
 * incluyendo la búsqueda por ID de Clerk y el registro de nuevos usuarios.
 */
@Injectable()
export class UsersService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Busca un usuario por su ID de Clerk.
     * @param clerkId El ID de Clerk del usuario a buscar.
     * @returns Una Promesa que resuelve con el objeto User si se encuentra, o null en caso contrario.
     */
    async findByClerkId(clerkId: string): Promise<User | null> {
        this.logger.log('Executed findByClerkId');
        return await this.prisma.user.findUnique({ where: { clerkId } });
    }

    /**
     * Registra un nuevo usuario en la base de datos utilizando su ID de Clerk.
     * @param clerkId El ID de Clerk del nuevo usuario a registrar.
     * @returns Una Promesa que resuelve con el objeto User recién creado.
     */
    async signUpNewUser(clerkId: string): Promise<User> {
        this.logger.log('Executed signUpNewUser');
        return await this.prisma.user.create({
            data: {
                clerkId,
            },
        });
    }
}
