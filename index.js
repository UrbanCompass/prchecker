const core = require('@actions/core');
const github = require('@actions/github');
const check = require('./src/checks')


// most @actions toolkit packages have async methods
async function run() {
  try {
    const pr = github.context.payload.pull_request
    let skipKey = core.getInput("skip-key", {required: false}) || "URGENT"
    if (pr.title.indexOf(skipKey) !== -1) {
      core.warning(`[${skipKey}] in title, check skipped!!!`)
      return
    }

    const checkItems = core.getInput('checkItems') || "all";
    const checkResults = check(pr, checkItems)
    checkResults.forEach(cr => {
      console.log(`Check for ${cr.checkItem ? "successful" : "failure"}: ${cr.message}`)
    })

    const failures = checkResults.filter(r => !r.success)

    if (failures.length > 0) {
      core.setFailed("These items check failed: " + failures.map(r => r.checkItem).join(", "))
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
