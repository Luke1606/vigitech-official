import {
    CanActivate,
    ExecutionContext,
    Injectable,
    // UnauthorizedException,
    // Request
} from '@nestjs/common';

@Injectable()
export class Guard implements CanActivate {
    // constructor () {}

    canActivate(context: ExecutionContext): boolean {
        return context ? true : false;
    }
    // private extractToken (token: string) {
    //     return
    // }
}
