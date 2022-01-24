# PR Format Checker

This is an GitHub Action, use to ensure your PR format is acceptable. 

if PR didn't pass your check, the merge request will be blocked.

```
Put URGENT into PR title to skip this check.
```

## how to use

edit `.github/workflows/pr-check.yml`

```yaml
 name: Check Pr
 on:
   pull_request:
     types:
       - opened
       - reopened
       - edited

 jobs:
   check-pr:
     runs-on: ubuntu-latest
     steps:
       - uses: sobadgirl/prchecker@main
         with:
           skip-word: "URGENT"  // optional, this is default value
           check-items: "all"  // optional JSON array string of check items or 'all', default 'all'. example: '["body", "tasks", "xxx"]', all items can found in `src/checks.js`
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## how to add new checker

add a new check function `(pr: Object): Tuple[bool, str]` in `src/checks.js`, param `pr` is context data, payload is: https://docs.github.com/en/rest/reference/pulls#get-a-pull-request

**don't forget** to run `npm run all` before you commit and push. 

## how to debug locally
#### TBD
run locally: `brew install act`


## TODO
- [x] checker function support return more info, not only `true` or `false`
- [x] custom word for SKIP
- [x] read check items input 
- [ ] custom failure message from input
- [ ] changed lines exclude testing
- [ ] auto release
- [ ] version lock
- [ ] testing
