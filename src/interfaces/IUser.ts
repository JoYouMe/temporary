export interface LoginRequest {
    username: string;
    password: string;
}

export interface DecodedToken {
    username: string;
}

export interface UserDetails {
    id: number;
    username: string;
    profileImg: string

}

export interface KaKaoData {
    id: number;
    username: string;
    kakaoid: string;
    profileimg: string;
    created: Date;
    updated?: Date;
}