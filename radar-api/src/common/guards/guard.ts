import {
    CanActivate,
    ExecutionContext,
    Injectable,
    // UnauthorizedException,
    // Request
} from '@nestjs/common';
// import { SupabaseService } from '../services';

@Injectable()
export class SupabaseGuard implements CanActivate {
    // constructor (private readonly supabase: SupabaseService) {}

    canActivate(context: ExecutionContext): boolean {
        return context ? true : false;
    }
    // private extractToken (token: string) {
    //     return
    // }
}
