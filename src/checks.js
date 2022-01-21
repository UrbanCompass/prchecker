const marked = require('marked');  // try demo https://marked.js.org/demo/

let checkers = {
    lineChanges: pr => {
        // changes should less than 400 lines (include testing)
        return pr.additions + pr.deletions <= 400
    },
    jiraTitle: pr => {
        // pr title should include jira link with "[]" wrapped. leave any string if no jira link can provide. 
        if (!pr) return false;
        return pr.title.trim()[0] === "[" && pr.title.indexOf("]") !== -1
    },
    body: pr => {
        // pr body should contains these headers 
        const requireHeaders = ["Description", "Work Ticket", "Test Plan", "Automated Testing", "Screenshots", "Checklist for PR owner"]
        if (!pr.body) return false;
        const tokens = marked.lexer(pr.body)
        const headers = tokens.filter(token => token.type === "heading" && token.depth <= 3).map(token => token.text)
        const headersSet = new Set(headers)
        return requireHeaders.filter(header => !headersSet.has(header)).length === 0
    },
    tasks: pr => {
        // all tasks in body should be completed
        if (!pr.body) return false;
        const tokens = marked.lexer(pr.body)
        const taskItems = tokens.filter(token => token.type === "list").map(list => list.items).flat()
        return taskItems.filter(item => item.task === true).filter(item => item.checked === false).length === 0
    }
}


module.exports = function(pr, checkItems) {
    if (checkItems === "all") {
        checkItems = Object.keys(checkers)
    }
    return checkItems.map(item => checkers[item](pr))
}
