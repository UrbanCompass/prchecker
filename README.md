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
       - uses: UrbanCompass/prchecker@main
         with:
           skip-word: "URGENT"  # optional, this is default value
           exempt-users: '["sobadgirl", "alex"]' # optional, serialized json array of GitHub user name(not display name). fill this field when you want some people to be exempt from this pr checker. 
           check-items: "all"  # optional JSON array string of check items or 'all', default 'all'. example: '["body", "tasks", "xxx"]', all items can found in `src/checks.js`
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

When only select some check items, just update lines like below:
```yml
...
jobs:
   check-pr:
     steps:
       - uses: UrbanCompass/prchecker@main
         check-items: '["body", "jiraTitle", "tasks"]'  # this line changed, items are function names in ./src/checks.js:checkers
```

⚠️⚠️⚠️ Why we use serialized json array, but not `yaml` array? That because input of GitHub Action only support string.

also see references:
- [GitHub Action Docs](https://docs.github.com/cn/actions/creating-actions/metadata-syntax-for-github-actions#runsstepswith)
- [Support Community](https://github.community/t/can-action-inputs-be-arrays/16457)


## how to add new checker

This project was write with `js`.

### Setup development environment
You should setup `nodejs` development environment, we especially suggest use [NVM](https://github.com/nvm-sh/nvm#installing-and-updating), install it by run: 
```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash```

then install and use `nodejs` via NVM:
```sh
nvm install --lts
nvm use --lts
```

Ensure you got `nodejs` successfully installed.
```shell
$ node -v
v17.3.0
```

### Clone repository
Clone this repository:
```shell
git clone git@github.com:UrbanCompass/prchecker.git
```

install npm dependencies
```
npm i
```

### Write your codes
add a new check function `(pr: Object): CheckResult` in `src/checks.js`, param `pr` is context data, payload is: https://docs.github.com/en/rest/reference/pulls#get-a-pull-request


### Commit your changes. 
**don't forget** to run `npm run all` before you commit and push. 

```shell
npm run all
git add .
git commit -m "some changes"
git push origin your-branch
```

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
