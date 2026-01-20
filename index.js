require("dotenv").config()
const axios = require("axios")


async function getPullRequest(owner, repo, pullNumber) {
    const pr = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    )
  
    const comments = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    )
  
    return {
      author: pr.data.user.login,
      description: pr.data.body,
      comments: comments.data.map(c => ({
        author: c.user.login,
        body: c.body
      }))
    }
  }

  
  function summarizePullRequest(pr) {
    return `
  Author: ${pr.author}
  
  Description:
  ${pr.description}
  
  Comments:
  ${pr.comments.map(c => `- ${c.author}: ${c.body}`).join("\n")}
  `
  }

  function reviewPullRequest(pr) {
    return {
      summary: "PR looks good overall.",
      suggestions: [
        "Add more comments to explain complex logic",
        "Consider adding tests"
      ]
    }
  }

  async function createPullRequest(
    owner,
    repo,
    title,
    body,
    head,
    base
  ) {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        title,
        body,
        head,
        base
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    )
  
    return response.data.html_url
  }

  class MCPServer {
    constructor() {
      this.tools = {}
    }
  
    tool(name, fn) {
      this.tools[name] = fn
      console.log(`Tool registered: ${name}`)
    }
  
    start() {
      console.log("MCP Server is running")
    }
  }

  const server = new MCPServer()
  server.start()


server.tool("get_pull_request", getPullRequest)
server.tool("summarize_pull_request", summarizePullRequest)
server.tool("review_pull_request", reviewPullRequest)
server.tool("create_pull_request", createPullRequest)


//temporary test code

async function test() {
    const pr = await getPullRequest(
      "man0612",
      "mcp-git-demo",
      1
    )
  
    console.log(pr)
  
    const summary = summarizePullRequest(pr)
    console.log(summary)
  
    const review = reviewPullRequest(pr)
    console.log(review)
  }
  
  test()
  