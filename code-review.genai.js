const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required");
}

const changes = await git.diff({ staged: true });

// Provide the missing third argument (e.g., an empty string or appropriate value)
defDiff("CODE_CHANGES", changes, "");

$`## Role
You are a senior developer whose job is to review code changes and provide meaningful feedback.

## Task
Review <CODE_CHANGES>, point out possible mistakes or bad practices, and provide suggestions for improvement.
- Be specific about what's wrong and why it's wrong
- Reference proper coding standards and best practices
- Be brief to get your point across
`;