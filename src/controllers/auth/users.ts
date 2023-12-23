import UserService from "../../services/user/userService";

export default class Users {
    public userService: UserService;

    public constructor() {
        this.userService = UserService.getInstance();
    }

    public async loginUser(username: string, password: string, social?: string) {
        try {
            const result = await this.userService.loginUser(username, password);
            return result
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
    
    public async registerUser(username: string, password: string, social?: string) {
        try {
            const result = await this.userService.registerUser(username, password);
            return result
        } catch (error) {
            console.error("Error during login:", error);
        }
    }

    


}
