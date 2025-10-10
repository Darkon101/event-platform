import { User } from "../../../types";

export const userData: User[] = [
    {
        username: "testuser",
        name: "Test User",
        email: "testuser@test.com",
        password: "password123",
        isAdmin: false,
    },
    {
        username: "testadmin",
        name: "Test Admin",
        email: "testadmin@test.com",
        password: "admin123",
        isAdmin: true,
    }
]
