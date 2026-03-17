import * as semver from 'semver'
import { assertNonNullable } from './fatal-error'

export type VersionConstraint = {
  dotcom?: boolean
  ghe?: boolean
  es?: boolean | string
}

const assumedGiteaVersion = new semver.SemVer('1.20.0')

const rawVersionCache = new Map<string, string>()
const versionCache = new Map<string, semver.SemVer | null>()

const endpointVersionKey = (ep: string) => `endpoint-version:${ep}`

/** All endpoints are Gitea (self-hosted) - no dotcom concept */
export const isDotCom = (_ep: string) => false

export const isGist = (_ep: string) => false

export const isGHE = (_ep: string) => false

/** Gitea endpoints - all are "enterprise" (self-hosted) */
export const isGHES = (ep: string) => !isDotCom(ep)

/** Whether endpoint is a Gitea instance */
export const isGiteaEndpoint = (ep: string) =>
  ep.includes('/api/v1') || ep.includes('/api/v3')

export function getEndpointVersion(endpoint: string) {
  const key = endpointVersionKey(endpoint)
  const cached = versionCache.get(key)

  if (cached !== undefined) {
    return cached
  }

  const raw = localStorage.getItem(key)
  const parsed = raw === null ? null : semver.parse(raw)

  if (parsed !== null) {
    versionCache.set(key, parsed)
  }

  return parsed
}

export function updateEndpointVersion(endpoint: string, version: string) {
  const key = endpointVersionKey(endpoint)

  if (rawVersionCache.get(key) !== version) {
    const parsed = semver.parse(version)
    localStorage.setItem(key, version)
    rawVersionCache.set(key, version)
    versionCache.set(key, parsed)
  }
}

function checkConstraint(
  epConstraint: string | boolean | undefined,
  epMatchesType: boolean,
  epVersion?: semver.SemVer
) {
  if (epConstraint === undefined || epConstraint === false) {
    return false
  }

  if (epConstraint === true) {
    return epMatchesType
  }

  assertNonNullable(epVersion, `Need to provide a version to compare against`)
  return epMatchesType && semver.satisfies(epVersion, epConstraint)
}

export const endpointSatisfies =
  ({ dotcom, ghe, es }: VersionConstraint, getVersion = getEndpointVersion) =>
  (ep: string) =>
    checkConstraint(dotcom, isDotCom(ep)) ||
    checkConstraint(ghe ?? dotcom, isGHE(ep)) ||
    checkConstraint(es, isGHES(ep), getVersion(ep) ?? assumedGiteaVersion)

export const supportsAvatarsAPI = endpointSatisfies({ es: true })

export const supportsRerunningChecks = endpointSatisfies({ es: true })

export const supportsRerunningIndividualOrFailedChecks = endpointSatisfies({
  es: true,
})

export const supportsRetrieveActionWorkflowByCheckSuiteId = endpointSatisfies({
  es: true,
})

export const supportsAliveSessions = (_ep?: string) => false

export const supportsRepoRules = (_ep?: string) => false
