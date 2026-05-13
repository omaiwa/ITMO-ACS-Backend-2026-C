import { Type } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import jwt from 'jsonwebtoken';
import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import SETTINGS from '../config/settings';
import checkPassword from '../../../../utils/check-password';

class LoginDto {
    @IsEmail()
    @Type(() => String)
    email!: string;

    @IsString()
    @Type(() => String)
    password!: string;
}

class RegisterDto {
    @IsString()
    fullName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}

class LoginResponseDto {
    @IsString()
    @Type(() => String)
    accessToken!: string;
}

class ErrorResponseDto {
    @IsString()
    @Type(() => String)
    message!: string;
}

function userBase(): string {
    const u = process.env.USER_SERVICE_URL || 'http://127.0.0.1:8002';
    const p = process.env.APP_API_PREFIX || '/api';
    return `${u}${p}`;
}

function internalHeaders(): Record<string, string> {
    const t = process.env.INTERNAL_SERVICE_TOKEN || 'internal';
    return { 'x-internal-token': t };
}

@JsonController('/auth')
class AuthController {
    @Post('/register')
    async register(@Body() data: RegisterDto) {
        const res = await fetch(`${userBase()}/users`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        });
        const text = await res.text();
        let body: unknown;
        try {
            body = JSON.parse(text);
        } catch {
            body = { message: text };
        }
        if (!res.ok) {
            return body;
        }
        return body;
    }

    @Post('/login')
    @OpenAPI({ summary: 'Login' })
    @ResponseSchema(LoginResponseDto, { statusCode: 200 })
    @ResponseSchema(ErrorResponseDto, { statusCode: 400 })
    async login(
        @Body({ type: LoginDto }) loginData: LoginDto,
    ): Promise<LoginResponseDto | ErrorResponseDto> {
        const { email, password } = loginData;
        const res = await fetch(
            `${userBase()}/internal/users/by-email?email=${encodeURIComponent(
                email,
            )}`,
            { headers: internalHeaders() },
        );
        if (res.status === 404) {
            return { message: 'User is not found' };
        }
        if (!res.ok) {
            return { message: 'User lookup failed' };
        }
        const user = (await res.json()) as {
            id: number;
            email: string;
            password: string;
        };
        const isPasswordCorrect = checkPassword(user.password, password);
        if (!isPasswordCorrect) {
            return { message: 'Password or email is incorrect' };
        }
        const accessToken = jwt.sign(
            { user: { id: user.id } },
            SETTINGS.JWT_SECRET_KEY,
            { expiresIn: SETTINGS.JWT_ACCESS_TOKEN_LIFETIME },
        );
        return { accessToken };
    }
}

export default AuthController;
