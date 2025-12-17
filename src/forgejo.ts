import type { GithubUser, GithubOrg } from "./types.js";
import axios, { AxiosInstance } from "axios";

export class ForgejoClient {
    private api: AxiosInstance;

    constructor(baseURL: string, token: string) {
        this.api = axios.create({
            baseURL: baseURL.endsWith("/") ? `${baseURL}api/v1` : `${baseURL}/api/v1`,
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json",
            },
        });
    }

    async ensureUser(user: GithubUser): Promise<void> {
        try {
            await this.api.get(`/users/${user.login}`);
            await this.updateUser(user);
            await this.updateAvatar(user.login, user.avatar_url, false);
        } catch (err: any) {
            if (err.response?.status === 404) {
                await this.api.post("/admin/users", {
                    email: user.email || `${user.login}@example.com`,
                    login_name: user.login,
                    username: user.login,
                    password: process.env.DEFAULT_PASSWORD || "ChangeMe123!",
                    must_change_password: false,
                    full_name: user.name || user.login,
                    visibility: "limited",
                });

                await this.updateUser(user);
                await this.updateAvatar(user.login, user.avatar_url, false);
            } else {
                throw err;
            }
        }
    }

    async ensureOrg(org: GithubOrg): Promise<void> {
        try {
            await this.api.get(`/orgs/${org.login}`);
            await this.updateOrg(org);
            await this.updateAvatar(org.login, org.avatar_url, true);
        } catch (err: any) {
            if (err.response?.status === 404) {
                await this.api.post(`/orgs`, {
                    username: org.login,
                    full_name: org.name || org.login,
                    description: org.description,
                    website: org.websiteUrl,
                    visibility: "private",
                });

                await this.updateAvatar(org.login, org.avatar_url, true);
            } else {
                throw err;
            }
        }
    }

    async migrateRepo(
        originalUrl: string,
        repoName: string,
        targetOwner: string,
        description: string | null,
        accessToken?: string
    ): Promise<string> {
        try {
            const { data: repo } = await this.api.get(`/repos/${targetOwner}/${repoName}`);


            if (repo.mirror) {
                try {
                    await this.api.post(`/repos/${targetOwner}/${repoName}/mirror-sync`);
                } catch { }
            }

            try {
                await this.api.patch(`/repos/${targetOwner}/${repoName}`, {
                    private: true,
                    description: description || "",
                });

                return "updated_private";
            } catch (err: any) {
                return `error: patch failed: ${err.message}`;
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                await this.api.post("/repos/migrate", {
                    clone_addr: originalUrl,
                    mirror: true,
                    repo_name: repoName,
                    repo_owner: targetOwner,
                    description: description || "",
                    private: true,
                    service: "github",
                    auth_token: accessToken || "",
                });

                return "migrated";
            } else {
                return `error: ${err.message}`;
            }
        }
    }

    private async updateUser(user: GithubUser): Promise<void> {
        try {
            await this.api.patch(`/admin/users/${user.login}`, {
                full_name: user.name || user.login,
                website: user.websiteUrl || "",
                location: user.location || "",
                description: user.bio || "",
                visibility: "limited",
            });
        } catch { }
    }

    private async updateOrg(org: GithubOrg): Promise<void> {
        try {
            await this.api.patch(`/orgs/${org.login}`, {
                full_name: org.name || org.login,
                description: org.description || "",
                website: org.websiteUrl || "",
                visibility: "private",
            });
        } catch { }
    }

    private async updateAvatar(name: string, avatarUrl: string, isOrg: boolean): Promise<void> {
        if (!avatarUrl) return;
        try {
            const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
            const data = Buffer.from(response.data).toString('base64');

            if (isOrg) {
                await this.api.post(`/orgs/${name}/avatar`, {
                    image: data
                });
            } else {
                await this.api.post(`/user/avatar`, {
                    image: data
                }, {
                    headers: {
                        "Sudo": name
                    }
                });
            }
        } catch { }
    }
}
