import type { GithubUser, GithubOrg, GithubRepo } from "./types.js";
import { Octokit } from "@octokit/rest";

export class GithubClient {
    private octokit: Octokit;
    private authUser: string | null = null;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    async getAuthenticatedUser(): Promise<string> {
        if (this.authUser) return this.authUser;

        const { data } = await this.octokit.rest.users.getAuthenticated();
        this.authUser = data.login;

        return this.authUser;
    }

    async getUser(username: string): Promise<GithubUser> {
        const { data } = await this.octokit.rest.users.getByUsername({ username });

        return {
            login: data.login,
            name: data.name ?? null,
            bio: data.bio ?? null,
            avatar_url: data.avatar_url,
            email: data.email ?? null,
            websiteUrl: data.blog ?? null,
            location: data.location ?? null,
        };
    }

    async getOrg(org: string): Promise<GithubOrg> {
        const { data } = await this.octokit.rest.orgs.get({ org });

        return {
            login: data.login,
            name: data.name ?? null,
            description: data.description ?? null,
            avatar_url: data.avatar_url,
            websiteUrl: data.blog ?? null,
            location: null,
        };
    }

    async getUserRepos(username: string): Promise<GithubRepo[]> {
        const authUser = await this.getAuthenticatedUser().catch(() => null);
        let repos;

        if (authUser && authUser.toLowerCase() === username.toLowerCase()) {
            repos = await this.octokit.paginate(this.octokit.rest.repos.listForAuthenticatedUser, {
                visibility: 'all',
                affiliation: 'owner',
                sort: 'pushed',
                direction: 'asc',
                per_page: 100,
            });
        } else {
            repos = await this.octokit.paginate(this.octokit.rest.repos.listForUser, {
                username,
                sort: 'pushed',
                direction: 'asc',
                per_page: 100,
            });
        }

        return repos.map((repo: any) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            clone_url: repo.clone_url,
            private: repo.private,
            owner: { login: repo.owner.login },
        }));
    }

    async getOrgRepos(org: string): Promise<GithubRepo[]> {
        const repos = await this.octokit.paginate(this.octokit.rest.repos.listForOrg, {
            org,
            sort: 'pushed',
            direction: 'asc',
            per_page: 100,
        });

        return repos.map((repo: any) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            clone_url: repo.clone_url,
            private: repo.private,
            owner: { login: repo.owner.login },
        }));
    }
}
