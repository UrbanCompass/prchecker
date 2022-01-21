const core = require('@actions/core');
const github = require('@actions/github');
const check = require('./src/checks')


// most @actions toolkit packages have async methods
async function run() {
  try {
    const pr = github.context.payload.pull_request
    if (pr.title.indexOf('URGENT') !== -1) {
      core.warning("[URGENT] in title, check skipped!!!")
      return
    }

    const checkItems = core.getInput('checkItems') || "all";
    const checkResults = check(pr, checkItems)
    const failures = checkResults.filter(r => r[1] === false)
    if (failures.length > 0) {
      core.setFailed("These items check failed: " + failures.map(r => r[0]).join(", "))
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
