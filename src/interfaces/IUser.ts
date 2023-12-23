interface INodeTest {
    id: string,
    created_at: Date,
    name: string
}

export interface LoginRequestBody {
    username: string;
    password: string;
    social?: string;
}