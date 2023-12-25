export interface LoginRequestBody {
    username: string;
    password: string;
    social?: string;
}

export interface DecodedToken {
    username: string;
}
