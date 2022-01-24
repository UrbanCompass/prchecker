const marked = require('marked');  // try demo https://marked.js.org/demo/


class CheckResult {
    constructor(params) {
        const defaults = {
            checkItem: null,
            success: false,
            message: ""
        }

        const constructorParams = Object.assign(defaults, params)
        Object.keys(constructorParams).forEach(key => {
            this[key] = constructorParams[key]
        })
    }
}


let checkers = {
    lineChanges: pr => {
        // changes should less than 400 lines (include testing)
        const success = pr.additions + pr.deletions <= 400
        return new CheckResult({
            success: success,
            message: success ? "passed" : "change lines more than 400!"
        }) 
    },
    jiraTitle: pr => {
        // pr title should include jira link with "[]" wrapped. leave any string if no jira link can provide. 
        if (!pr) return false;
        const success = pr.title.trim()[0] === "[" && pr.title.indexOf("]") !== -1
        return new CheckResult({
            success: success,
            message: success ? "passed" : "Not found jira link in title, please ensure '[xxx]' in the head of title."
        })
    },
    body: pr => {
        // pr body should contains these headers 
        const requireHeaders = ["Description", "Work Ticket", "Test Plan",
         "Automated Testing", "Screenshots", "Checklist for PR owner", "Monitoring and Rollback Plan"]
        if (!pr.body) return false;
        const tokens = marked.lexer(pr.body)
        const headers = tokens.filter(token => token.type === "heading" && token.depth <= 3).map(token => token.text)
        const headersSet = new Set(headers)
        const missedHeaders = requireHeaders.filter(header => !headersSet.has(header))
        const success = missedHeaders.length === 0
        return new CheckResult({
            success: success,
            message: success ? "passed" : `Missing headers: ${JSON.stringify(missedHeaders)}, please check!`
        })
    },
    tasks: pr => {
        // all tasks in body should be completed
        if (!pr.body) return false;
        const tokens = marked.lexer(pr.body)
        const taskItems = tokens.filter(token => token.type === "list").map(list => list.items).flat()
        const unCheckedItems = taskItems.filter(item => item.task === true).filter(item => item.checked === false)
        const success = unCheckedItems.length === 0
        return new CheckResult({
            success: success,
            message: success ? "passed" : `Exists unchecked items: ${JSON.stringify(unCheckedItems.map(item => item.text))}, please check!`
        })
    }
}


module.exports = function(pr, checkItems) {
    if (checkItems === "all") {
        checkItems = Object.keys(checkers)
    }
    return checkItems.map(item => {
        const checkResult = checkers[item](pr)
        checkResult.checkItem = item
        return checkResult
    })
}
