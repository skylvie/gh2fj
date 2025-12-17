import type { Config } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

export const config: Config = {
    forgejoUrl: process.env.FORGEJO_URL!,
    forgejoToken: process.env.FORGEJO_TOKEN!,
    forgejoOrgOwner: process.env.FORGEJO_ORG_OWNER!,
    githubToken: process.env.GITHUB_TOKEN!,
    githubUsers: (process.env.GITHUB_USERS || "").split(",").filter(Boolean),
    githubOrgs: (process.env.GITHUB_ORGS || "").split(",").filter(Boolean),
};
