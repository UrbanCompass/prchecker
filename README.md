# PR Format Checker

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
- [x] custom words for SKIP
- [x] read check items input 
- [ ] custom failure message from input
- [ ] changed lines exclude testing
- [ ] auto release
- [ ] version lock
- [ ] testing
