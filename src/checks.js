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


const AUTOMATED_TESTING_HEADER  = "Automated Testing"


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
        const newOwnerCheckListHeader = "Mandatory checklist to be completed by PR owner"
        const oldOwnerCheckListHeader = "Checklist for PR owner"
        const requireHeaders = ["Description", "Work Ticket", "Test Plan",
        AUTOMATED_TESTING_HEADER, "Screenshots", newOwnerCheckListHeader, "Monitoring and Rollback Plan"]
        if (!pr.body) return false;
        const tokens = marked.lexer(pr.body)
        const headers = tokens.filter(token => token.type === "heading" && token.depth <= 3).map(token => token.text)
        const headersSet = new Set(headers)
        if (headersSet.has(oldOwnerCheckListHeader)) {
            headersSet.delete(oldOwnerCheckListHeader)
            headersSet.add(newOwnerCheckListHeader)
        }
        const missedHeaders = requireHeaders.filter(header => !headersSet.has(header))
        const success = missedHeaders.length === 0
        return new CheckResult({
            success: success,
            message: success ? "passed" : `Missing headers: ${JSON.stringify(missedHeaders)}, please check!`
        })
    },
    tasks: pr => {
        // all tasks in body should be completed
        if (!pr.body) return new CheckResult({success: false, message: "Please leave something in body when start PR."});
        let tokens = marked.lexer(pr.body)
        tokens = tokens.map((token, index) => {
            token.id = index
            return token
        })

        let taskTokenOfAutomatedTesting = null
        let automatedTestingHeadToken = null
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            // find tasks list between AUTOMATED_TESTING_HEADER and next header(section)
            if (!automatedTestingHeadToken) {
                if (token.type === "heading" && token.text === AUTOMATED_TESTING_HEADER) {
                    automatedTestingHeadToken = token
                }
                continue
            }
            // when found tasks 
            if (automatedTestingHeadToken && token.type === "list") {
                taskTokenOfAutomatedTesting = token
                break
            }
            // if for loop run to next header, means cloudn't found tasks between headers. 
            if (automatedTestingHeadToken && token.type === "heading" && token.depth <= 3) {
                break
            }
        }
        if (!taskTokenOfAutomatedTesting) {
            return new CheckResult({
                success: false,
                message: "Not found any check boxes under [Automated Testing] section, please follow the template."
            })
        }

        // checking at least one box checked for Automated testing
        const hasChecked = taskTokenOfAutomatedTesting.items.filter(item => item.task === true).map(item => item.checked).some(Boolean)
        if (!hasChecked) {
            return new CheckResult({
                success: false,
                message: "At least check one checkbox under [Automated Testing] section."
            })
        }

        const taskItems = tokens.filter(token => token.type === "list" && token.id !== taskTokenOfAutomatedTesting.id).map(list => list.items).flat()
        const unCheckedItems = taskItems.filter(item => item.task === true).filter(item => item.checked === false)
        const success = unCheckedItems.length === 0
        return new CheckResult({
            success: success,
            message: success ? "passed" : `Exist unchecked items: ${JSON.stringify(unCheckedItems.map(item => item.text))}, please check!`
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
