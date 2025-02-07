import { Injectable } from '@nestjs/common';
// import {hash, compare} from 'bcrypt';

@Injectable()
export class BcryptService {
    async hashPassword(password: string): Promise<string> {
        return  password
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return true
    }
}
