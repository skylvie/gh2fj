export interface Config {
    forgejoUrl: string;
    forgejoToken: string;
    forgejoOrgOwner: string;
    githubToken: string;
    githubUsers: string[];
    githubOrgs: string[];
}

export interface GithubUser {
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    email: string | null;
    websiteUrl: string | null;
    location: string | null;
}

export interface GithubOrg {
    login: string;
    name: string | null;
    description: string | null;
    avatar_url: string;
    websiteUrl: string | null;
    location: string | null;
}

export interface GithubRepo {
    name: string;
    full_name: string;
    description: string | null;
    clone_url: string;
    private: boolean;
    owner: {
        login: string;
    };
}
