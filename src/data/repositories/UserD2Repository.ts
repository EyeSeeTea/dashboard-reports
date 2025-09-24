import { FutureData } from "../../domain/entities/Future";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

export class UserD2Repository implements UserRepository {
    constructor(private api: D2Api) {}

    public getCurrent(): FutureData<User> {
        return apiToFuture(
            this.api.currentUser.get({
                fields: userFields,
            })
        ).map(d2User => this.buildUser(d2User));
    }

    private buildUser(d2User: D2User) {
        const username = d2User.userCredentials?.username || d2User.username;
        const userRoles = d2User.userCredentials?.userRoles || d2User.userRoles;
        if (!username || !userRoles) {
            throw new Error("User data missing: username and userRoles are required");
        }
        return new User({
            id: d2User.id,
            name: d2User.displayName,
            userGroups: d2User.userGroups,
            username: username,
            userRoles: userRoles,
        });
    }
}

const userFields = {
    id: true,
    displayName: true,
    userGroups: { id: true, name: true },
    userCredentials: {
        username: true,
        userRoles: { id: true, name: true, authorities: true },
    },
    // v42+ is not returning userCredentials in the /me endpoint
    // but supports userRoles and username at root level
    userRoles: { id: true, name: true, authorities: true },
    username: true,
} as const;

type D2User = MetadataPick<{ users: { fields: typeof userFields } }>["users"][number] & {
    username?: string;
    userRoles?: { id: string; name: string; authorities: string[] }[];
};
