import fs from 'fs'
import path from 'path'
import flamegrill, { CookResult, CookResults, ScenarioConfig, Scenarios } from 'flamegrill'

import { generateUrl } from '@fluentui/digest'

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO:
//
// As much of this file should be absorbed into flamegrill as possible.
// Flamegrill knows all possible kinds and stories from digest. Could default to running tests against all.
// Embed iterations in stories as well as scenarios. That way they would apply for static tests as well.
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// TODO: We can't do CI, measure baseline or do regression analysis until master & PR files are deployed and publicly accessible.
// const urlForDeployPath = process.env.BUILD_SOURCEBRANCH
//   ? `http://fabricweb.z5.web.core.windows.net/pr-deploy-site/${process.env.BUILD_SOURCEBRANCH}/perf-test`
//   : `file://${path.resolve(__dirname, '../dist/')}`;
const urlForDeployPath = `file://${path.resolve(__dirname, '../dist/')}`

// const urlForMaster = process.env.SYSTEM_PULLREQUEST_TARGETBRANCH
//   ? `http://fabricweb.z5.web.core.windows.net/pr-deploy-site/refs/heads/${process.env.SYSTEM_PULLREQUEST_TARGETBRANCH}/perf-test/index.html`
//   : 'http://fabricweb.z5.web.core.windows.net/pr-deploy-site/refs/heads/master/perf-test/index.html';

const urlForDeploy = `${urlForDeployPath}/index.html`
const defaultIterations = 1

const outDir = path.join(__dirname, '../dist')
const tempDir = path.join(__dirname, '../logfiles')

console.log(`__dirname: ${__dirname}`)

export default async function getPerfRegressions() {
  // TODO: support iteration/kind/story via commandline as in other perf-test script
  // TODO: can do this now that we have story information
  // TODO: align flamegrill terminology with CSF (story vs. scenario)
  const scenarios: Scenarios = {}
  const scenarioList: string[] = []

  // TODO: can this get typing somehow? can't be imported since file is only available after build
  const test = require('../dist/stories.js')
  const { stories } = test.default

  console.log('stories:')
  console.dir(stories, { depth: null })

  Object.keys(stories).forEach(kindKey => {
    Object.keys(stories[kindKey])
      .filter(storyKey => typeof stories[kindKey][storyKey] === 'function')
      .forEach(storyKey => {
        const scenarioName = `${kindKey}.${storyKey}`
        scenarioList.push(scenarioName)
        scenarios[scenarioName] = {
          // TODO: We can't do CI, measure baseline or do regression analysis until master & PR files are deployed and publicly accessible.
          scenario: generateUrl(
            urlForDeploy,
            kindKey,
            storyKey,
            getIterations(stories, kindKey, storyKey),
          ),
        }
      })
  })

  console.log(`\nRunning scenarios: ${scenarioList}\n`)

  if (!fs.existsSync(tempDir)) {
    console.log(`Making temp directory ${tempDir}...`)
    fs.mkdirSync(tempDir)
  }

  const tempContents = fs.readdirSync(tempDir)

  if (tempContents.length > 0) {
    console.log(`Unexpected files already present in ${tempDir}`)
    tempContents.forEach(logFile => {
      const logFilePath = path.join(tempDir, logFile)
      console.log(`Deleting ${logFilePath}`)
      fs.unlinkSync(logFilePath)
    })
  }

  const scenarioConfig: ScenarioConfig = { outDir, tempDir }
  const scenarioResults = await flamegrill.cook(scenarios, scenarioConfig)

  const comment = createReport(stories, scenarioResults)

  // TODO: determine status according to perf numbers
  const status = 'success'

  console.log(`Perf evaluation status: ${status}`)
  console.log(`Writing comment to file:\n${comment}`)

  // Write results to file
  fs.writeFileSync(path.join(outDir, 'perfCounts.html'), comment)

  console.log(
    `##vso[task.setvariable variable=PerfCommentFilePath;]apps/perf-test/dist/perfCounts.html`,
  )
  console.log(`##vso[task.setvariable variable=PerfCommentStatus;]${status}`)
}

/**
 * Create test summary based on test results.
 *
 * @param {CookResults} testResults
 * @returns {string}
 */
function createReport(stories, testResults: CookResults): string {
  const report = ''

    // TODO: We can't do CI, measure baseline or do regression analysis until master & PR files are deployed and publicly accessible.
    // // Show only significant changes by default.
    // .concat(createScenarioTable(testResults, false))

    // // Show all results in a collapsible table.
    // .concat('<details><summary>All results</summary><p>')
    // .concat(createScenarioTable(testResults, true))
    // .concat('</p></details>');

    .concat(createScenarioTable(stories, testResults, true))

  return report
}

/**
 * Create a table of scenario results.
 *
 * @param {CookResults} testResults
 * @param {boolean} showAll Show only significant results by default.
 * @returns {string}
 */
function createScenarioTable(stories, testResults: CookResults, showAll: boolean): string {
  const resultsToDisplay = Object.keys(testResults)
    .filter(
      key =>
        showAll ||
        (testResults[key].analysis &&
          testResults[key].analysis.regression &&
          testResults[key].analysis.regression.isRegression),
    )
    .filter(testResultKey => getStoryKey(testResultKey) !== 'Fabric')
    .sort()

  if (resultsToDisplay.length === 0) {
    return '<p>No significant results to display.</p>'
  }

  // TODO: We can't do CI, measure baseline or do regression analysis until master & PR files are deployed and publicly accessible.
  // const result = `
  // <table>
  // <tr>
  //   <th>Scenario</th>
  //   <th>
  //     <a href="https://github.com/OfficeDev/office-ui-fabric-react/wiki/Perf-Testing#why-are-results-listed-in-ticks-instead-of-time-units">Master Ticks</a>
  //   </th>
  //   <th>
  //     <a href="https://github.com/OfficeDev/office-ui-fabric-react/wiki/Perf-Testing#why-are-results-listed-in-ticks-instead-of-time-units">PR Ticks</a>
  //   </th>
  //   <th>Status</th>
  // </tr>`.concat(
  //   resultsToDisplay
  //     .map(key => {
  //       const testResult = testResults[key];

  //       return `<tr>
  //           <td>${scenarioNames[key] || key}</td>
  //           ${getCell(testResult, true)}
  //           ${getCell(testResult, false)}
  //           ${getRegression(testResult)}
  //          </tr>`;
  //     })
  //     .join('\n')
  //     .concat(`</table>`),
  // );

  // TODO: add iterations column (and maybe ticks per iteration)
  const result = `
  <table>
  <tr>
    <th>Kind</th>
    <th>Story</th>
    <th>Fabric TPI</th>
    <th>TPI</th>
    <th>Iterations</th>
    <th>
      <a href="https://github.com/OfficeDev/office-ui-fabric-react/wiki/Perf-Testing#why-are-results-listed-in-ticks-instead-of-time-units">PR Ticks</a>
    </th>
  </tr>`.concat(
    resultsToDisplay
      .map(resultKey => {
        const testResult = testResults[resultKey]
        const kind = getKindKey(resultKey)
        const story = getStoryKey(resultKey)
        const iterations = getIterations(stories, kind, story)
        const tpi = getTpiResult(testResults, stories, kind, story) || 'n/a'
        const fabricTpi = getTpiResult(testResults, stories, kind, 'Fabric') || ''

        return `<tr>
            <td>${kind}</td>
            <td>${story}</td>
            <td>${fabricTpi}</td>
            <td>${tpi}</td>
            <td>${iterations}</td>
            <td>${getTicksResult(testResult, false)}</td>
           </tr>`
      })
      .join('\n')
      .concat(`</table>`),
  )

  return result
}

function getKindKey(resultKey: string): string {
  const [kind] = resultKey.split('.')
  return kind
}

function getStoryKey(resultKey: string): string {
  const [, story] = resultKey.split('.')
  return story
}

function getTpiResult(testResults, stories, kind, story): string | undefined {
  let tpi = undefined
  if (stories[kind][story]) {
    const resultKey = `${kind}.${story}`
    const testResult = testResults[resultKey]
    const ticks = getTicks(testResult)
    const iterations = getIterations(stories, kind, story)
    tpi =
      ticks &&
      iterations &&
      (ticks / iterations).toLocaleString('en', { maximumSignificantDigits: 2 })
    tpi = linkifyResult(testResult, tpi, false)
  }
  return tpi
}

function getIterations(stories, kind, story) {
  // Give highest priority to most localized definition of iterations. Story => kind => default.
  return (
    stories[kind][story].iterations ||
    (stories[kind].default && stories[kind].default.iterations) ||
    defaultIterations
  )
}

function getTicks(testResult: CookResult): number | undefined {
  return testResult.analysis && testResult.analysis.numTicks
}

function linkifyResult(testResult, resultContent, getBaseline) {
  let flamegraphFile = testResult.processed.output && testResult.processed.output.flamegraphFile
  let errorFile = testResult.processed.error && testResult.processed.error.errorFile

  if (getBaseline) {
    const processedBaseline = testResult.processed.baseline
    flamegraphFile =
      processedBaseline && processedBaseline.output && processedBaseline.output.flamegraphFile
    errorFile = processedBaseline && processedBaseline.error && processedBaseline.error.errorFile
  }

  const cell = errorFile
    ? `<a href="${path.basename(errorFile)}">err</a>`
    : flamegraphFile
    ? `<a href="${path.basename(flamegraphFile)}">${resultContent}</a>`
    : `n/a`

  return cell
}

/**
 * Helper that renders an output cell based on a test result.
 *
 * @param {CookResult} testResult
 * @param {boolean} getBaseline
 * @returns {string}
 */
function getTicksResult(testResult: CookResult, getBaseline: boolean): string {
  let numTicks = testResult.analysis && testResult.analysis.numTicks

  if (getBaseline) {
    numTicks =
      testResult.analysis && testResult.analysis.baseline && testResult.analysis.baseline.numTicks
  }

  return linkifyResult(testResult, numTicks, getBaseline)
}

/**
 * Helper that renders an output cell based on a test result.
 *
 * @param {CookResult} testResult
 * @returns {string}
 */
// TODO: We can't do CI, measure baseline or do regression analysis until master & PR files are deployed and publicly accessible.
// function getRegression(testResult: CookResult): string {
//   const cell = testResult.analysis && testResult.analysis.regression && testResult.analysis.regression.isRegression
//     ? testResult.analysis.regression.regressionFile
//       ? `<a href="${urlForDeployPath}/${path.basename(testResult.analysis.regression.regressionFile)}">Possible regression</a>`
//       : ''
//     : '';

//   return `<td>${cell}</td>`;
// }