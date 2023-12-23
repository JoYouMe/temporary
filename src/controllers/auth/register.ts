import UserService from "../../services/user/userService";

export default class Register {
    private userService: UserService;

    private constructor() {
        this.userService = UserService.getInstance();
    }

    public async loginUser(username: string, password: string, social: string): Promise<void> {
        try {
            const isLoggedIn = await this.userService.loginUser(username, password, social);

            if (isLoggedIn) {
                console.log(`User ${username} logged in successfully.`);
            } else {
                console.log(`Login failed for user ${username}. Invalid credentials.`);
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
}
